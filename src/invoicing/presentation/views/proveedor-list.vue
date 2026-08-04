<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

const router = useRouter();
const store = useInvoicingStore();

onMounted(() => {
  if (!store.proveedoresLoaded) store.fetchProveedores();
});

function verDetalle(proveedor) {
  router.push({ name: 'invoicing-proveedor-detail', params: { id: proveedor.id } });
}
</script>

<template>
  <div class="proveedor-list">
    <h2>Proveedores</h2>
    <p class="hint">Proveedores a los que ya les has comprado — toca uno para ver el historial de precios de sus productos.</p>

    <pv-data-table :value="store.proveedores" @row-click="e => verDetalle(e.data)" class="clickable-rows">
      <pv-column field="ruc" header="RUC" />
      <pv-column field="razonSocial" header="Razón social" />
    </pv-data-table>
  </div>
</template>

<style scoped>
.proveedor-list { display: flex; flex-direction: column; gap: 1.25rem; }
.hint { color: #6b7280; }
.clickable-rows :deep(tr) { cursor: pointer; }
</style>