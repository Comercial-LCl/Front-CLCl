<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';
import { formatearFecha } from '@/shared/utils/date-utils.js';

const route = useRoute();
const router = useRouter();
const store = useInvoicingStore();

const factura = ref(null);
const cargando = ref(true);

onMounted(async () => {
  if (!store.proveedoresLoaded) await store.fetchProveedores();
  if (!store.categoriasLoaded) await store.fetchCategorias();
  factura.value = await store.fetchFacturaById(route.params.id);
  cargando.value = false;
});

/** Nivel de confianza de la IA para un campo específico, o null si no aplica
 *  (factura sin detalle de IA, o campo que ese tipo de factura no reporta). */
function confianza(campo) {
  return factura.value?.confianzaCampos?.[campo] ?? null;
}

function claseConfianza(campo) {
  const nivel = confianza(campo);
  if (nivel === 'baja') return 'campo-baja-confianza';
  if (nivel === 'media') return 'campo-media-confianza';
  return '';
}
</script>

<template>
  <div v-if="cargando" class="hint">Cargando…</div>

  <div v-else-if="factura" class="factura-detail">
    <div class="header-row">
      <h2>Factura {{ factura.serie }}-{{ factura.numero }}</h2>
      <div class="header-actions">
        <pv-tag v-if="factura.requiereRevision" severity="danger" value="Requiere revisión" icon="pi pi-exclamation-triangle" />
        <pv-button label="Corregir datos" icon="pi pi-pencil" severity="secondary"
                   @click="router.push({ name: 'invoicing-facturas-corregir', params: { id: factura.id } })" />
      </div>
    </div>

    <pv-card>
      <template #content>
        <div class="info-grid">
          <div><strong>Tipo:</strong> {{ factura.tipo }}</div>

          <div :class="claseConfianza('proveedorRuc')">
            <strong>Proveedor:</strong> {{ store.getProveedorLabel(factura.proveedorId) }}
            <i v-if="confianza('proveedorRuc') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div :class="claseConfianza('categoria')">
            <strong>Categoría:</strong> {{ store.getCategoriaNombre(factura.categoriaId) }}
            <i v-if="confianza('categoria') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div :class="claseConfianza('serie')">
            <strong>Serie:</strong> {{ factura.serie }}
            <i v-if="confianza('serie') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div :class="claseConfianza('numero')">
            <strong>Número:</strong> {{ factura.numero }}
            <i v-if="confianza('numero') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div :class="claseConfianza('fechaEmision')">
            <strong>Fecha de emisión:</strong> {{ formatearFecha(factura.fechaEmision) }}
            <i v-if="confianza('fechaEmision') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div :class="claseConfianza('montoTotal')">
            <strong>Monto total:</strong> {{ factura.montoTotal }} {{ factura.moneda }}
            <i v-if="confianza('montoTotal') === 'baja'" class="pi pi-exclamation-triangle icono-alerta" title="Baja confianza de la IA en este dato" />
          </div>

          <div><strong>Estado:</strong>
            <pv-tag
                :value="factura.estadoProcesamiento === 'ProcesadoSinDetalle' ? 'Sin detalle de IA' : factura.estadoProcesamiento"
                :severity="factura.estadoProcesamiento === 'ProcesadoSinDetalle' ? 'warn' : 'success'"
            />
          </div>
        </div>

        <p v-if="factura.resumenIa" class="resumen-ia"><strong>Resumen IA:</strong> {{ factura.resumenIa }}</p>
        <p v-else class="resumen-ia hint">Esta factura no tiene resumen de IA porque se registró sin foto.</p>

        <a v-if="factura.archivoUrl" :href="factura.archivoUrl" target="_blank">Ver archivo original</a>
      </template>
    </pv-card>

    <h3>Ítems</h3>
    <pv-data-table v-if="factura.items.length > 0" :value="factura.items">
      <pv-column field="descripcion" header="Descripción" />
      <pv-column field="cantidad" header="Cantidad" />
      <pv-column field="precioUnitario" header="Precio unitario" />
      <pv-column field="subtotal" header="Subtotal" />
    </pv-data-table>
    <p v-else class="hint">Sin detalle de productos (factura registrada sin foto).</p>
  </div>
</template>

<style scoped>
.factura-detail { display: flex; flex-direction: column; gap: 1.5rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
.header-actions { display: flex; gap: 0.75rem; align-items: center; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.resumen-ia { margin-top: 1rem; }
.hint { color: #6b7280; }

.campo-baja-confianza {
  border: 1px solid #ef4444;
  background: #fef2f2;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
}
.campo-media-confianza {
  border: 1px dashed #f59e0b;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
}
.icono-alerta { color: #ef4444; margin-left: 0.35rem; }
</style>