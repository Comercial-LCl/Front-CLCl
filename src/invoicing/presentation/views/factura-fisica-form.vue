<script setup>
import { ref, computed, onBeforeUnmount, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QrScanner from 'qr-scanner';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';
import { parseFacturaQr, normalizarFecha } from '@/invoicing/infrastructure/qr-parser.js';

const router = useRouter();
const store = useInvoicingStore();

const videoRef = ref(null);
const qrFileInput = ref(null);
let scanner = null;

const fase = ref('escaneando'); // 'escaneando' -> 'revisando' -> 'foto' -> 'enviando'
const errorMsg = ref('');
const consultandoRuc = ref(false);

const camaras = ref([]);
const camaraSeleccionada = ref(null);

const tieneFlash = ref(false);
const flashActivo = ref(false);

const soportaExposicion = ref(false);
const exposicionReducida = ref(false);

const calidadImagen = ref(null); // 'nitido' | 'borroso' | null
const calidadFoto = ref(null); // nitidez de la foto ya capturada
const segundosSinDetectar = ref(0);
let intervaloCalidad = null;
let intervaloContador = null;

const form = ref({
  proveedorRuc: '',
  serie: '',
  numero: '',
  fechaEmision: '',
  montoTotal: 0,
  moneda: 'PEN',
});
const razonSocial = ref('');
const fotoBlob = ref(null);
const fotoPreviewUrl = ref('');
const enviarSinFoto = ref(false);

const hintProgresivo = computed(() => {
  if (fase.value !== 'escaneando') return null;
  if (segundosSinDetectar.value > 15) {
    return 'Si sigue sin leerlo, usa "subir foto del QR" con tu celular — suele ser más confiable que la webcam.';
  }
  if (segundosSinDetectar.value > 8) {
    return calidadImagen.value === 'borroso'
        ? 'Se ve borroso: aléjate o acércate despacio hasta que el recuadro se vea nítido.'
        : 'Inclina un poco el papel para que la luz no rebote directo hacia la cámara, o hazle sombra con la mano.';
  }
  return null;
});

async function iniciarEscaneo() {
  await nextTick();
  scanner = new QrScanner(videoRef.value, result => onQrDetectado(result.data), {
    highlightScanRegion: true,
    highlightCodeOutline: true,
    preferredCamera: 'environment',
    maxScansPerSecond: 10,
  });
  await scanner.start();

  tieneFlash.value = await scanner.hasFlash().catch(() => false);
  await verificarSoporteExposicion();

  try {
    camaras.value = await QrScanner.listCameras(true);
    if (camaras.value.length > 0) camaraSeleccionada.value = camaras.value[0].id;
  } catch {
    camaras.value = [];
  }

  intervaloCalidad = setInterval(evaluarNitidez, 900);
  intervaloContador = setInterval(() => {
    if (fase.value === 'escaneando') segundosSinDetectar.value++;
  }, 1000);
}

function evaluarNitidez() {
  const enVivo = fase.value === 'escaneando' || (fase.value === 'foto' && !fotoBlob.value);
  if (!enVivo) return;

  const video = videoRef.value;
  if (!video || video.readyState < 2 || !video.videoWidth) return;

  const tamano = 160;
  const canvas = document.createElement('canvas');
  canvas.width = tamano;
  canvas.height = tamano;
  const ctx = canvas.getContext('2d');

  const lado = Math.min(video.videoWidth, video.videoHeight) * 0.6;
  const sx = (video.videoWidth - lado) / 2;
  const sy = (video.videoHeight - lado) / 2;
  ctx.drawImage(video, sx, sy, lado, lado, 0, 0, tamano, tamano);

  const varianza = calcularVarianzaLaplaciano(ctx, tamano);
  calidadImagen.value = varianza > 350 ? 'nitido' : 'borroso';
}

/** Extraída para reutilizarla también sobre la foto ya capturada, no solo el video en vivo */
function calcularVarianzaLaplaciano(ctx, tamano) {
  const { data } = ctx.getImageData(0, 0, tamano, tamano);
  const gris = new Float32Array(tamano * tamano);
  for (let i = 0; i < gris.length; i++) {
    const o = i * 4;
    gris[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }

  let suma = 0, sumaCuadrados = 0, n = 0;
  for (let y = 1; y < tamano - 1; y++) {
    for (let x = 1; x < tamano - 1; x++) {
      const idx = y * tamano + x;
      const lap = gris[idx - 1] + gris[idx + 1] + gris[idx - tamano] + gris[idx + tamano] - 4 * gris[idx];
      suma += lap;
      sumaCuadrados += lap * lap;
      n++;
    }
  }
  const media = suma / n;
  return sumaCuadrados / n - media * media;
}

/** Evalúa la nitidez de la foto ya tomada (no del video en vivo) */
function evaluarNitidezFoto(canvasOrigen) {
  const tamano = 160;
  const canvas = document.createElement('canvas');
  canvas.width = tamano;
  canvas.height = tamano;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(canvasOrigen, 0, 0, tamano, tamano);

  const varianza = calcularVarianzaLaplaciano(ctx, tamano);
  calidadFoto.value = varianza > 350 ? 'nitido' : 'borroso';
}

async function toggleFlash() {
  if (!scanner) return;
  try {
    await scanner.toggleFlash();
    flashActivo.value = scanner.isFlashOn();
  } catch {
    // no soportado, ignoramos
  }
}

/** Detecta si el navegador/cámara permite controlar la exposición manualmente.
 *  Soporte inconsistente: común en Android Chrome, raro en webcams de Windows. */
async function verificarSoporteExposicion() {
  try {
    const track = videoRef.value?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;
    const capacidades = track.getCapabilities?.();
    soportaExposicion.value = !!(capacidades && 'exposureCompensation' in capacidades);
  } catch {
    soportaExposicion.value = false;
  }
}

/** Baja la compensación de exposición al mínimo soportado, para contrarrestar
 *  sobreexposición/reflejos que "lavan" el contraste blanco/negro del QR. */
async function reducirBrillo() {
  try {
    const track = videoRef.value?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;
    const capacidades = track.getCapabilities();
    if (!('exposureCompensation' in capacidades)) return;

    exposicionReducida.value = !exposicionReducida.value;
    const valor = exposicionReducida.value
        ? capacidades.exposureCompensation.min
        : (capacidades.exposureCompensation.max + capacidades.exposureCompensation.min) / 2;

    await track.applyConstraints({
      advanced: [{ exposureMode: 'manual', exposureCompensation: valor }],
    });
  } catch {
    // el dispositivo no permite exposición manual; no bloqueamos el flujo
  }
}

function cambiarCamara() {
  if (scanner && camaraSeleccionada.value) {
    scanner.setCamera(camaraSeleccionada.value);
  }
}

async function onQrDetectado(rawText) {
  if (fase.value !== 'escaneando') return;
  await procesarTextoQr(rawText);
}

async function procesarTextoQr(rawText) {
  try {
    const datos = parseFacturaQr(rawText);
    form.value = { ...form.value, ...datos };
    errorMsg.value = '';
    fase.value = 'revisando';

    consultandoRuc.value = true;
    const datosRuc = await store.consultarRuc(datos.proveedorRuc);
    razonSocial.value = datosRuc ? datosRuc.razonSocial : '';
  } catch (e) {
    errorMsg.value = e.message || 'No se pudo leer el código QR.';
  } finally {
    consultandoRuc.value = false;
  }
}

/** Convierte la imagen a blanco/negro puro (binarización por umbral) antes de decodificar.
 *  Puede rescatar QRs cuyo contraste quedó débil por reflejos o sobreexposición. */
function mejorarContrasteImagen(archivo) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gris = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const valor = gris > 150 ? 255 : 0; // umbral — ajustar si hace falta
        data[i] = data[i + 1] = data[i + 2] = valor;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(archivo);
  });
}

async function onQrImagenSeleccionada(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;

  try {
    const canvasProcesado = await mejorarContrasteImagen(archivo);
    const resultado = await QrScanner.scanImage(canvasProcesado, { returnDetailedScanResult: true });
    await procesarTextoQr(resultado.data);
  } catch {
    // si la versión binarizada falla, probamos con la imagen original sin procesar
    try {
      const resultado = await QrScanner.scanImage(archivo, { returnDetailedScanResult: true });
      await procesarTextoQr(resultado.data);
    } catch {
      errorMsg.value = 'No se pudo leer el QR en esa imagen. Prueba con otra foto, más cerca y sin reflejos.';
    }
  } finally {
    event.target.value = '';
  }
}

function abrirSelectorImagenQr() {
  qrFileInput.value?.click();
}

function ingresarManualmente() {
  errorMsg.value = '';
  fase.value = 'revisando';
}

function irATomarFoto() {
  fase.value = 'foto';
}

function capturarFoto() {
  const video = videoRef.value;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  evaluarNitidezFoto(canvas);

  canvas.toBlob(blob => {
    fotoBlob.value = blob;
    fotoPreviewUrl.value = URL.createObjectURL(blob);
    enviarSinFoto.value = false;
  }, 'image/jpeg', 0.9);
}

function reintentarFoto() {
  fotoBlob.value = null;
  fotoPreviewUrl.value = '';
  calidadFoto.value = null;
}

function omitirFoto() {
  fotoBlob.value = null;
  fotoPreviewUrl.value = '';
  enviarSinFoto.value = true;
}

async function enviar() {
  if (!fotoBlob.value && !enviarSinFoto.value) {
    errorMsg.value = 'Toma una foto o elige registrar sin foto.';
    return;
  }

  fase.value = 'enviando';
  errorMsg.value = '';

  const formData = new FormData();
  formData.append('proveedorRuc', form.value.proveedorRuc);
  formData.append('serie', form.value.serie);
  formData.append('numero', form.value.numero);
  formData.append('fechaEmision', normalizarFecha(form.value.fechaEmision));
  formData.append('montoTotal', form.value.montoTotal);
  formData.append('moneda', form.value.moneda);
  if (fotoBlob.value) {
    formData.append('imagen', fotoBlob.value, 'factura.jpg');
  }

  try {
    const nuevaFactura = await store.registrarFacturaFisica(formData);
    detenerCamara();
    router.push({ name: 'invoicing-facturas-detail', params: { id: nuevaFactura.id } });
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'No se pudo registrar la factura.';
    fase.value = 'foto';
  }
}

function detenerCamara() {
  if (scanner) {
    scanner.stop();
    scanner.destroy();
    scanner = null;
  }
  clearInterval(intervaloCalidad);
  clearInterval(intervaloContador);
}

function volver() {
  detenerCamara();
  router.push({ name: 'invoicing-facturas' });
}

onBeforeUnmount(() => {
  detenerCamara();
  if (fotoPreviewUrl.value) URL.revokeObjectURL(fotoPreviewUrl.value);
});

onMounted(() => {
  iniciarEscaneo();
});
</script>

<template>
  <div class="fisica-form">
    <div class="top-bar">
      <pv-button label="Volver" icon="pi pi-arrow-left" text @click="volver" />
    </div>

    <h2>Registrar factura física</h2>

    <div class="camera-wrap" v-show="fase !== 'enviando'">
      <video ref="videoRef" class="camera-video" v-show="!fotoBlob"></video>

      <div v-if="fase === 'escaneando' || (fase === 'foto' && !fotoBlob)" class="scan-overlay">
        <div class="scan-frame" :class="[calidadImagen, { 'scan-frame-wide': fase === 'foto' }]">
          <span class="corner corner-tl"></span>
          <span class="corner corner-tr"></span>
          <span class="corner corner-bl"></span>
          <span class="corner corner-br"></span>
        </div>

        <div v-if="calidadImagen" class="quality-badge" :class="calidadImagen">
          {{ calidadImagen === 'nitido' ? 'Buen enfoque' : 'Se ve borroso' }}
        </div>

        <div class="camera-controls">
          <pv-button
              v-if="tieneFlash"
              :icon="flashActivo ? 'pi pi-sun' : 'pi pi-moon'"
              rounded
              text
              @click="toggleFlash"
          />
          <pv-button
              v-if="soportaExposicion"
              :icon="exposicionReducida ? 'pi pi-eye-slash' : 'pi pi-eye'"
              :label="exposicionReducida ? 'Brillo normal' : 'Reducir brillo'"
              rounded
              text
              @click="reducirBrillo"
          />
        </div>
      </div>

      <img v-if="fotoBlob" :src="fotoPreviewUrl" alt="Foto de la factura" class="photo-preview-in-camera" />
    </div>

    <template v-if="fase === 'escaneando'">
      <p class="hint">Apunta la cámara al código QR, dentro del recuadro.</p>
      <p class="hint hint-tip">
        Si hay mucha luz o reflejos, inclina un poco el papel o hazle sombra con la mano —
        el brillo directo hace que el QR pierda el contraste que necesita para leerse.
      </p>
      <p v-if="hintProgresivo" class="hint hint-progresivo">{{ hintProgresivo }}</p>

      <div class="camara-selector" v-if="camaras.length > 1">
        <pv-select
            v-model="camaraSeleccionada"
            :options="camaras"
            optionLabel="label"
            optionValue="id"
            placeholder="Elegir cámara"
            @change="cambiarCamara"
        />
      </div>

      <div class="scan-alt-actions">
        <pv-button
            label="Mi cámara no enfoca — subir foto del QR"
            icon="pi pi-image"
            severity="secondary"
            text
            @click="abrirSelectorImagenQr"
        />
        <input ref="qrFileInput" type="file" accept="image/*" hidden @change="onQrImagenSeleccionada" />

        <pv-button
            label="El QR no se lee — ingresar datos manualmente"
            severity="secondary"
            text
            @click="ingresarManualmente"
        />
      </div>
    </template>

    <div v-if="fase === 'revisando' || fase === 'foto'" class="review-panel">
      <p v-if="consultandoRuc">Consultando RUC del proveedor…</p>
      <p v-else-if="razonSocial"><strong>Proveedor:</strong> {{ razonSocial }}</p>

      <div class="fields-grid">
        <pv-float-label>
          <pv-input-text v-model="form.proveedorRuc" />
          <label>RUC proveedor</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text v-model="form.serie" />
          <label>Serie</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text v-model="form.numero" />
          <label>Número</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text v-model="form.fechaEmision" />
          <label>Fecha de emisión</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-number v-model="form.montoTotal" mode="decimal" :minFractionDigits="2" />
          <label>Monto total</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text v-model="form.moneda" />
          <label>Moneda</label>
        </pv-float-label>
      </div>

      <pv-button v-if="fase === 'revisando'" label="Continuar a foto" @click="irATomarFoto" />
    </div>

    <div v-if="fase === 'foto'" class="photo-panel">
      <template v-if="!fotoBlob && !enviarSinFoto">
        <p class="hint hint-strong">
          Encuadra <strong>solo el detalle de productos</strong> de la factura (la tabla de ítems y
          precios), dentro del recuadro — no es necesario que salga el QR ni los bordes del papel.
        </p>
        <p class="hint hint-tip">
          Buena luz uniforme y sin reflejos sobre el papel ayuda a que la IA lea mejor cada producto.
          Evita que la sombra de tu mano o del celular tape el texto.
        </p>
        <pv-button
            label="Registrar sin foto (sin detalle de productos)"
            severity="secondary"
            outlined
            @click="omitirFoto"
        />
      </template>

      <template v-else-if="fotoBlob">
        <div class="quality-badge-static" :class="calidadFoto">
          {{ calidadFoto === 'nitido' ? 'Foto nítida' : 'La foto se ve borrosa' }}
        </div>
        <p v-if="calidadFoto === 'borroso'" class="hint hint-warning">
          Si la IA no logra leer bien los productos con esta foto, puedes repetirla.
        </p>
      </template>

      <template v-else>
        <p class="hint">Vas a registrar esta factura sin foto ni detalle de productos.</p>
      </template>
    </div>

    <p v-if="fase === 'enviando'" class="hint">Registrando factura…</p>

    <small v-if="errorMsg" class="p-error">{{ errorMsg }}</small>

    <div v-if="fase === 'foto'" class="bottom-actions">
      <template v-if="fotoBlob">
        <pv-button label="Repetir foto" severity="secondary" @click="reintentarFoto" />
        <pv-button label="Registrar factura" @click="enviar" />
      </template>
      <template v-else-if="enviarSinFoto">
        <pv-button label="Tomar foto en su lugar" severity="secondary" @click="enviarSinFoto = false" />
        <pv-button label="Registrar sin foto" @click="enviar" />
      </template>
      <template v-else>
        <pv-button label="Tomar foto" icon="pi pi-camera" @click="capturarFoto" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.fisica-form {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 5rem;
}
.top-bar { display: flex; justify-content: flex-start; }

.camera-wrap {
  position: relative;
  width: 100%;
  max-height: 45vh;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}
.camera-video { width: 100%; height: 100%; max-height: 45vh; object-fit: cover; display: block; }

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  width: 60%;
  aspect-ratio: 1;
}
.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 3px solid #9ca3af;
}
.scan-frame.nitido .corner { border-color: #22c55e; }
.scan-frame.borroso .corner { border-color: #f59e0b; }
.corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
.corner-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
.corner-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
.corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }

.quality-badge {
  position: absolute;
  bottom: 56px;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #6b7280;
}
.quality-badge.nitido { background: #22c55e; }
.quality-badge.borroso { background: #f59e0b; }

.camera-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 0.5rem;
  pointer-events: auto;
}
.camera-controls :deep(.p-button) { color: #ffffff !important; }

.camara-selector { max-width: 280px; }
.scan-alt-actions { display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start; }

.review-panel, .photo-panel { display: flex; flex-direction: column; gap: 1rem; }
.fields-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.photo-preview { width: 100%; border-radius: 8px; }

.hint { color: #6b7280; }
.hint-strong { color: #374151; font-size: 0.95rem; }
.hint-tip { font-size: 0.9rem; }
.hint-progresivo { color: #b45309; font-weight: 500; }

.bottom-actions {
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding: 1rem 1.25rem;
  margin: 0 -1.25rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
}
.scan-frame-wide { width: 85%; aspect-ratio: 16/10; }

.photo-preview-in-camera { width: 100%; height: 100%; object-fit: contain; background: #000; }

.quality-badge-static {
  display: inline-block;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #22c55e;
}
.quality-badge-static.borroso { background: #f59e0b; }

.hint-warning { color: #b45309; font-weight: 500; }
</style>