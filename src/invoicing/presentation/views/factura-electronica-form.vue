<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

const router = useRouter();
const store = useInvoicingStore();

const archivo = ref(null);
const enviando = ref(false);
const errorMsg = ref('');

function onSeleccionar(event) {
  archivo.value = event.files[0];
}

async function enviar() {
  if (!archivo.value) {
    errorMsg.value = 'Selecciona el PDF de la factura.';
    return;
  }

  enviando.value = true;
  errorMsg.value = '';

  const formData = new FormData();
  formData.append('archivo', archivo.value);

  try {
    const nuevaFactura = await store.registrarFacturaElectronica(formData);
    router.push({ name: 'invoicing-facturas-detail', params: { id: nuevaFactura.id } });
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'No se pudo registrar la factura.';
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="electronica-form">
    <h2>Registrar factura electrónica</h2>

    <pv-file-upload
        mode="basic"
        accept="application/pdf"
        :maxFileSize="10000000"
        chooseLabel="Seleccionar PDF"
        :auto="false"
        customUpload
        @select="onSeleccionar"
    />

    <p v-if="archivo">{{ archivo.name }}</p>

    <pv-button label="Registrar factura" :loading="enviando" @click="enviar" />

    <small v-if="errorMsg" class="p-error">{{ errorMsg }}</small>
  </div>
</template>

<style scoped>
.electronica-form { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
</style>