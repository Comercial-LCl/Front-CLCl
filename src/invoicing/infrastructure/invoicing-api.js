import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const facturasEndpointPath       = import.meta.env.VITE_FACTURAS_ENDPOINT_PATH;
const resumenGastosEndpointPath  = import.meta.env.VITE_RESUMEN_GASTOS_ENDPOINT_PATH;
const proveedoresEndpointPath    = import.meta.env.VITE_PROVEEDORES_ENDPOINT_PATH;
const categoriasEndpointPath     = import.meta.env.VITE_CATEGORIAS_ENDPOINT_PATH;
const productosEndpointPath      = import.meta.env.VITE_PRODUCTOS_ENDPOINT_PATH;

export class InvoicingApi extends BaseApi {
    #facturasEndpoint;
    #proveedoresEndpoint;
    #categoriasEndpoint;

    constructor() {
        super();
        this.#facturasEndpoint    = new BaseEndpoint(this, facturasEndpointPath);
        this.#proveedoresEndpoint = new BaseEndpoint(this, proveedoresEndpointPath);
        this.#categoriasEndpoint  = new BaseEndpoint(this, categoriasEndpointPath);
    }

    // ---- Facturas ----

    getFacturas() {
        return this.#facturasEndpoint.getAll();
    }

    getFacturaById(id) {
        return this.#facturasEndpoint.getById(id);
    }

    registrarFacturaFisica(formData) {
        return this.http.post(`${facturasEndpointPath}/fisica`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    registrarFacturaElectronica(formData) {
        return this.http.post(`${facturasEndpointPath}/electronica`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    filtrarFacturas({ proveedorId, categoriaId, desde, hasta } = {}) {
        const params = {};
        if (proveedorId) params.proveedorId = proveedorId;
        if (categoriaId) params.categoriaId = categoriaId;
        if (desde)        params.desde       = desde;
        if (hasta)        params.hasta       = hasta;
        return this.http.get(`${facturasEndpointPath}/filtrar`, { params });
    }

    corregirFactura(id, patch) {
        return this.http.patch(`${facturasEndpointPath}/${id}/corregir`, patch);
    }

    // ---- Resumen de gastos ----

    getResumenPorCategoria({ desde, hasta } = {}) {
        const params = {};
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        return this.http.get(`${resumenGastosEndpointPath}/por-categoria`, { params });
    }

    getResumenPorPeriodo({ desde, hasta }) {
        return this.http.get(`${resumenGastosEndpointPath}/por-periodo`, { params: { desde, hasta } });
    }

    // ---- Proveedores ----

    getProveedores() {
        return this.#proveedoresEndpoint.getAll();
    }

    consultarRuc(ruc) {
        return this.http.get(`${proveedoresEndpointPath}/consultar-ruc/${ruc}`);
    }

    getProductosPorProveedor(proveedorId) {
        return this.http.get(`${proveedoresEndpointPath}/${proveedorId}/productos`);
    }

    // ---- Categorías ----

    getCategorias() {
        return this.#categoriasEndpoint.getAll();
    }

    // ---- Productos ----

    getHistorialPrecios(productoId) {
        return this.http.get(`${productosEndpointPath}/${productoId}/historial-precios`);
    }
}