<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';

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
</script>

<template>
  <div v-if="cargando" class="hint">Cargando…</div>

  <div v-else-if="factura" class="factura-detail">
    <div class="header-row">
      <h2>Factura {{ factura.serie }}-{{ factura.numero }}</h2>
      <pv-button label="Corregir datos" icon="pi pi-pencil" severity="secondary"
                 @click="router.push({ name: 'invoicing-facturas-corregir', params: { id: factura.id } })" />
    </div>

    <pv-card>
      <template #content>
        <div class="info-grid">
          <div><strong>Tipo:</strong> {{ factura.tipo }}</div>
          <div><strong>Proveedor:</strong> {{ store.getProveedorLabel(factura.proveedorId) }}</div>
          <div><strong>Categoría:</strong> {{ store.getCategoriaNombre(factura.categoriaId) }}</div>
          <div><strong>Fecha de emisión:</strong> {{ formatearFecha(factura.fechaEmision) }}</div>
          <div><strong>Monto total:</strong> {{ factura.montoTotal }} {{ factura.moneda }}</div>
          <div>
            <strong>Estado:</strong>
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
.header-row { display: flex; justify-content: space-between; align-items: center; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.resumen-ia { margin-top: 1rem; }
.hint { color: #6b7280; }
</style>