<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

const route = useRoute();
const router = useRouter();
const store = useInvoicingStore();

const cargando = ref(true);
const proveedorId = route.params.id;

const proveedor = computed(() => store.proveedores.find(p => p.id === proveedorId));
const productos = computed(() => store.productosPorProveedor[proveedorId] ?? []);

onMounted(async () => {
  if (!store.proveedoresLoaded) await store.fetchProveedores();
  await store.fetchProductosPorProveedor(proveedorId);
  cargando.value = false;
});

function verHistorial(producto) {
  router.push({
    name: 'invoicing-producto-historial',
    params: { proveedorId, productoId: producto.id },
  });
}
</script>

<template>
  <div class="proveedor-detail">
    <div class="top-bar">
      <pv-button label="Volver a proveedores" icon="pi pi-arrow-left" text @click="router.push({ name: 'invoicing-proveedores' })" />
    </div>

    <h2 v-if="proveedor">{{ proveedor.razonSocial }}</h2>
    <p v-if="proveedor" class="hint">RUC: {{ proveedor.ruc }}</p>

    <h3>Productos comprados</h3>

    <p v-if="cargando" class="hint">Cargando…</p>
    <p v-else-if="productos.length === 0" class="hint">Todavía no tienes productos registrados de este proveedor con detalle de IA.</p>

    <pv-data-table v-else :value="productos" @row-click="e => verHistorial(e.data)" class="clickable-rows">
      <pv-column field="nombre" header="Producto" />
    </pv-data-table>
  </div>
</template>

<style scoped>
.proveedor-detail { display: flex; flex-direction: column; gap: 1.25rem; }
.top-bar { display: flex; justify-content: flex-start; }
.hint { color: #6b7280; }
.clickable-rows :deep(tr) { cursor: pointer; }
</style>