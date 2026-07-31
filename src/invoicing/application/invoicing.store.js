import {InvoicingApi} from "@/invoicing/infrastructure/invoicing-api.js";
import {FacturaAssembler} from "@/invoicing/infrastructure/factura.assembler.js";
import {ProveedorAssembler} from "@/invoicing/infrastructure/proveedor.assembler.js";
import {CategoriaAssembler} from "@/invoicing/infrastructure/categoria.assembler.js";
import {defineStore} from "pinia";
import {ref} from "vue";

const invoicingApi = new InvoicingApi();

const useInvoicingStore = defineStore('invoicing', () => {
    const facturas       = ref([]);
    const facturasLoaded = ref(false);

    const proveedores       = ref([]);
    const proveedoresLoaded = ref(false);

    const categorias       = ref([]);
    const categoriasLoaded = ref(false);

    const resumenPorCategoria    = ref([]);
    const resumenPorPeriodoTotal = ref(null);

    const errors = ref([]);

    function fetchFacturas() {
        return invoicingApi.getFacturas().then(response => {
            facturas.value = FacturaAssembler.toEntitiesFromResponse(response);
            facturasLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function filtrarFacturas(filtros) {
        return invoicingApi.filtrarFacturas(filtros).then(response => {
            facturas.value = FacturaAssembler.toEntitiesFromResponse(response);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function fetchFacturaById(id) {
        return invoicingApi.getFacturaById(id).then(response => {
            return FacturaAssembler.toEntityFromResponse(response);
        });
    }

    function registrarFacturaFisica(formData) {
        return invoicingApi.registrarFacturaFisica(formData).then(async response => {
            const nuevaFactura = FacturaAssembler.toEntityFromResponse(response);
            facturas.value.unshift(nuevaFactura);
            // El backend puede haber creado un proveedor/categoría nuevo automáticamente
            // (por RUC nuevo, o por clasificación de la IA) — refrescamos ambos catálogos
            // para que el detalle no muestre el fallback "Proveedor #id".
            await Promise.all([fetchProveedores(), fetchCategorias()]);
            return nuevaFactura;
        });
    }

    function registrarFacturaElectronica(formData) {
        return invoicingApi.registrarFacturaElectronica(formData).then(async response => {
            const nuevaFactura = FacturaAssembler.toEntityFromResponse(response);
            facturas.value.unshift(nuevaFactura);
            await Promise.all([fetchProveedores(), fetchCategorias()]);
            return nuevaFactura;
        });
    }

    function corregirFactura(id, patch) {
        return invoicingApi.corregirFactura(id, patch).then(response => {
            const facturaActualizada = FacturaAssembler.toEntityFromResponse(response);
            const index = facturas.value.findIndex(f => f.id === id);
            if (index !== -1) facturas.value[index] = facturaActualizada;
            return facturaActualizada;
        });
    }

    function fetchProveedores() {
        return invoicingApi.getProveedores().then(response => {
            proveedores.value = ProveedorAssembler.toEntitiesFromResponse(response);
            proveedoresLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /** 404 => RUC no encontrado en SUNAT/Decolecta, no se trata como error de la app */
    async function consultarRuc(ruc) {
        try {
            const response = await invoicingApi.consultarRuc(ruc);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) return null;
            errors.value.push(error);
            return null;
        }
    }

    function fetchCategorias() {
        return invoicingApi.getCategorias().then(response => {
            categorias.value = CategoriaAssembler.toEntitiesFromResponse(response);
            categoriasLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function fetchResumenPorCategoria({ desde, hasta } = {}) {
        return invoicingApi.getResumenPorCategoria({ desde, hasta }).then(response => {
            resumenPorCategoria.value = response.data;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function fetchResumenPorPeriodo({ desde, hasta }) {
        return invoicingApi.getResumenPorPeriodo({ desde, hasta }).then(response => {
            resumenPorPeriodoTotal.value = response.data.total;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /** Resuelve "RUC — Razón social" para mostrar en listas, igual que authStore.getUsername en SkillSwap */
    function getProveedorLabel(id) {
        const encontrado = proveedores.value.find(p => p.id === id);
        return encontrado ? `${encontrado.ruc} — ${encontrado.razonSocial}` : `Proveedor #${id}`;
    }

    function getCategoriaNombre(id) {
        if (!id) return 'Sin categoría';
        const encontrada = categorias.value.find(c => c.id === id);
        return encontrada ? encontrada.nombre : `Categoría #${id}`;
    }

    return {
        facturas, facturasLoaded,
        proveedores, proveedoresLoaded,
        categorias, categoriasLoaded,
        resumenPorCategoria, resumenPorPeriodoTotal,
        errors,
        fetchFacturas, filtrarFacturas, fetchFacturaById,
        registrarFacturaFisica, registrarFacturaElectronica, corregirFactura,
        fetchProveedores, consultarRuc, fetchCategorias,
        fetchResumenPorCategoria, fetchResumenPorPeriodo,
        getProveedorLabel, getCategoriaNombre,
    };
});

export default useInvoicingStore;