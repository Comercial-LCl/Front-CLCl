<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInvoicingStore from '@/invoicing/application/invoicing.store.js';
import { formatearFecha } from '@/shared/utils/date-utils.js';

const route = useRoute();
const router = useRouter();
const store = useInvoicingStore();

const cargando = ref(true);
const { proveedorId, productoId } = route.params;

const producto = computed(() =>
    (store.productosPorProveedor[proveedorId] ?? []).find(p => p.id === productoId)
);

/** Historial con la variación respecto al precio anterior ya calculada, para no repetir esa lógica en el template */
const historialConVariacion = computed(() => {
  const historial = store.historialPrecios[productoId] ?? [];
  return historial.map((punto, index) => {
    const anterior = index > 0 ? historial[index - 1].precioUnitario : null;
    const variacion = anterior !== null ? punto.precioUnitario - anterior : null;
    return { ...punto, variacion };
  });
});

const ultimaVariacion = computed(() => {
  const lista = historialConVariacion.value;
  return lista.length > 0 ? lista[lista.length - 1].variacion : null;
});

onMounted(async () => {
  if (!store.productosPorProveedor[proveedorId]) {
    await store.fetchProductosPorProveedor(proveedorId);
  }
  await store.fetchHistorialPrecios(productoId);
  cargando.value = false;
});
</script>

<template>
  <div class="producto-historial">
    <div class="top-bar">
      <pv-button label="Volver al proveedor" icon="pi pi-arrow-left" text
                 @click="router.push({ name: 'invoicing-proveedor-detail', params: { id: proveedorId } })" />
    </div>

    <h2 v-if="producto">{{ producto.nombre }}</h2>

    <p v-if="cargando" class="hint">Cargando…</p>

    <template v-else>
      <div v-if="ultimaVariacion !== null" class="variacion-resumen" :class="ultimaVariacion > 0 ? 'sube' : ultimaVariacion < 0 ? 'baja' : ''">
        <i :class="ultimaVariacion > 0 ? 'pi pi-arrow-up' : ultimaVariacion < 0 ? 'pi pi-arrow-down' : 'pi pi-minus'" />
        {{ ultimaVariacion > 0 ? 'Subió' : ultimaVariacion < 0 ? 'Bajó' : 'Sin cambio' }}
        {{ ultimaVariacion !== 0 ? Math.abs(ultimaVariacion).toFixed(2) : '' }}
        respecto a la compra anterior
      </div>

      <pv-data-table :value="historialConVariacion">
        <pv-column header="Fecha">
          <template #body="{ data }">{{ formatearFecha(data.fechaEmision) }}</template>
        </pv-column>
        <pv-column field="precioUnitario" header="Precio unitario" />
        <pv-column header="Variación">
          <template #body="{ data }">
            <span v-if="data.variacion === null" class="hint">—</span>
            <span v-else :class="data.variacion > 0 ? 'texto-sube' : data.variacion < 0 ? 'texto-baja' : ''">
              <i :class="data.variacion > 0 ? 'pi pi-arrow-up' : data.variacion < 0 ? 'pi pi-arrow-down' : 'pi pi-minus'" />
              {{ Math.abs(data.variacion).toFixed(2) }}
            </span>
          </template>
        </pv-column>
      </pv-data-table>
    </template>
  </div>
</template>

<style scoped>
.producto-historial { display: flex; flex-direction: column; gap: 1.25rem; }
.top-bar { display: flex; justify-content: flex-start; }
.hint { color: #6b7280; }

.variacion-resumen {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  width: fit-content;
}
.variacion-resumen.sube { background: #fef2f2; color: #b91c1c; }
.variacion-resumen.baja { background: #f0fdf4; color: #15803d; }

.texto-sube { color: #b91c1c; }
.texto-baja { color: #15803d; }
</style>