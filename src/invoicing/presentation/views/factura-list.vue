<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';
import { formatearFecha } from '@/shared/utils/date-utils.js';

const router = useRouter();
const store = useInvoicingStore();

const filtroProveedorId = ref(null);
const filtroCategoriaId = ref(null);
const filtroDesde = ref(null);
const filtroHasta = ref(null);

onMounted(() => {
  if (!store.facturasLoaded) store.fetchFacturas();
  if (!store.proveedoresLoaded) store.fetchProveedores();
  if (!store.categoriasLoaded) store.fetchCategorias();
});

function aplicarFiltros() {
  store.filtrarFacturas({
    proveedorId: filtroProveedorId.value,
    categoriaId: filtroCategoriaId.value,
    desde: filtroDesde.value ? filtroDesde.value.toISOString().slice(0, 10) : null,
    hasta: filtroHasta.value ? filtroHasta.value.toISOString().slice(0, 10) : null,
  });
}

function limpiarFiltros() {
  filtroProveedorId.value = null;
  filtroCategoriaId.value = null;
  filtroDesde.value = null;
  filtroHasta.value = null;
  store.fetchFacturas();
}

function verDetalle(factura) {
  router.push({ name: 'invoicing-facturas-detail', params: { id: factura.id } });
}
</script>

<template>
  <div class="factura-list">
    <div class="header-row">
      <h2>Facturas</h2>
      <div class="actions">
        <pv-button label="Nueva factura física" icon="pi pi-camera" @click="router.push({ name: 'invoicing-facturas-fisica' })" />
        <pv-button label="Nueva factura electrónica" icon="pi pi-file-pdf" severity="secondary" @click="router.push({ name: 'invoicing-facturas-electronica' })" />
      </div>
    </div>

    <div class="filters">
      <pv-select v-model="filtroProveedorId" :options="store.proveedores" optionLabel="razonSocial" optionValue="id" placeholder="Proveedor" showClear />
      <pv-select v-model="filtroCategoriaId" :options="store.categorias" optionLabel="nombre" optionValue="id" placeholder="Categoría" showClear />
      <pv-date-picker v-model="filtroDesde" placeholder="Desde" dateFormat="yy-mm-dd" showIcon />
      <pv-date-picker v-model="filtroHasta" placeholder="Hasta" dateFormat="yy-mm-dd" showIcon />
      <pv-button label="Filtrar" @click="aplicarFiltros" />
      <pv-button label="Limpiar" severity="secondary" text @click="limpiarFiltros" />
    </div>

    <pv-data-table :value="store.facturas" @row-click="e => verDetalle(e.data)" class="clickable-rows">
      <pv-column field="tipo" header="Tipo" />
      <pv-column header="Proveedor">
        <template #body="{ data }">{{ store.getProveedorLabel(data.proveedorId) }}</template>
      </pv-column>
      <pv-column header="Categoría">
        <template #body="{ data }">{{ store.getCategoriaNombre(data.categoriaId) }}</template>
      </pv-column>
      <pv-column header="Fecha">
        <template #body="{ data }">{{ formatearFecha(data.fechaEmision) }}</template>
      </pv-column>
      <pv-column header="Monto">
        <template #body="{ data }">{{ data.montoTotal }} {{ data.moneda }}</template>
      </pv-column>
      <pv-column field="estadoProcesamiento" header="Estado">
        <template #body="{ data }">
          <pv-tag
              :value="data.estadoProcesamiento === 'ProcesadoSinDetalle' ? 'Sin detalle de IA' : data.estadoProcesamiento"
              :severity="data.estadoProcesamiento === 'ProcesadoSinDetalle' ? 'warn' : 'success'"
          />
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>

<style scoped>
.factura-list { display: flex; flex-direction: column; gap: 1.5rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.actions { display: flex; gap: 0.75rem; }
.filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.clickable-rows :deep(tr) { cursor: pointer; }
</style>