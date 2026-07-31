<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

const route = useRoute();
const router = useRouter();
const store = useInvoicingStore();

const original = ref(null);
const form = ref({
  proveedorRazonSocial: '',
  categoriaId: null,
  serie: '',
  numero: '',
  fechaEmision: '',
  montoTotal: 0,
  moneda: '',
});
const enviando = ref(false);
const errorMsg = ref('');

onMounted(async () => {
  if (!store.categoriasLoaded) await store.fetchCategorias();
  original.value = await store.fetchFacturaById(route.params.id);

  form.value = {
    proveedorRazonSocial: '',
    categoriaId: original.value.categoriaId,
    serie: original.value.serie,
    numero: original.value.numero,
    fechaEmision: original.value.fechaEmision,
    montoTotal: original.value.montoTotal,
    moneda: original.value.moneda,
  };
});

/** Solo manda al backend los campos que realmente cambiaron; el resto va como null */
async function guardar() {
  enviando.value = true;
  errorMsg.value = '';

  const patch = {
    proveedorRuc: null,
    proveedorRazonSocial: form.value.proveedorRazonSocial || null,
    categoriaId: form.value.categoriaId !== original.value.categoriaId ? form.value.categoriaId : null,
    serie: form.value.serie !== original.value.serie ? form.value.serie : null,
    numero: form.value.numero !== original.value.numero ? form.value.numero : null,
    fechaEmision: form.value.fechaEmision !== original.value.fechaEmision ? form.value.fechaEmision : null,
    montoTotal: form.value.montoTotal !== original.value.montoTotal ? form.value.montoTotal : null,
    moneda: form.value.moneda !== original.value.moneda ? form.value.moneda : null,
  };

  try {
    await store.corregirFactura(original.value.id, patch);
    router.push({ name: 'invoicing-facturas-detail', params: { id: original.value.id } });
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'No se pudo guardar la corrección.';
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div v-if="original" class="correction-form">
    <h2>Corregir factura {{ original.serie }}-{{ original.numero }}</h2>

    <div class="fields-grid">
      <pv-float-label>
        <pv-input-text v-model="form.proveedorRazonSocial" />
        <label>Razón social del proveedor (si está mal)</label>
      </pv-float-label>
      <pv-float-label>
        <pv-select v-model="form.categoriaId" :options="store.categorias" optionLabel="nombre" optionValue="id" />
        <label>Categoría</label>
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

    <div class="actions">
      <pv-button label="Guardar" :loading="enviando" @click="guardar" />
      <pv-button label="Cancelar" severity="secondary" text @click="router.back()" />
    </div>

    <small v-if="errorMsg" class="p-error">{{ errorMsg }}</small>
  </div>
</template>

<style scoped>
.correction-form { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
.fields-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.actions { display: flex; gap: 1rem; }
</style>