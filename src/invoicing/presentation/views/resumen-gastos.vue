<script setup>
import { ref } from 'vue';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

const store = useInvoicingStore();

const desde = ref(null);
const hasta = ref(null);

function consultar() {
  const filtros = {
    desde: desde.value ? desde.value.toISOString().slice(0, 10) : null,
    hasta: hasta.value ? hasta.value.toISOString().slice(0, 10) : null,
  };
  store.fetchResumenPorCategoria(filtros);
  if (filtros.desde && filtros.hasta) store.fetchResumenPorPeriodo(filtros);
}
</script>

<template>
  <div class="resumen">
    <h2>Resumen de gastos</h2>

    <div class="filters">
      <pv-date-picker v-model="desde" placeholder="Desde" dateFormat="yy-mm-dd" showIcon />
      <pv-date-picker v-model="hasta" placeholder="Hasta" dateFormat="yy-mm-dd" showIcon />
      <pv-button label="Consultar" @click="consultar" />
    </div>

    <pv-card v-if="store.resumenPorPeriodoTotal !== null" class="total-card">
      <template #content>
        <p class="total-label">Total del periodo</p>
        <p class="total-value">{{ store.resumenPorPeriodoTotal }}</p>
      </template>
    </pv-card>

    <h3>Por categoría</h3>
    <pv-data-table :value="store.resumenPorCategoria">
      <pv-column field="categoriaNombre" header="Categoría" />
      <pv-column field="total" header="Total" />
    </pv-data-table>
  </div>
</template>

<style scoped>
.resumen { display: flex; flex-direction: column; gap: 1.5rem; }
.filters { display: flex; gap: 0.75rem; align-items: center; }
.total-card { max-width: 280px; }
.total-label { color: #6b7280; margin: 0; }
.total-value { font-size: 2rem; font-weight: 700; margin: 0.25rem 0 0; }
</style>