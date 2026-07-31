import {ItemFactura} from "@/invoicing/domain/model/item-factura-entity.js";

export class Factura {
    constructor({
                    id                    = null,
                    proveedorId           = null,
                    categoriaId           = null,
                    tipo                  = '',
                    serie                 = '',
                    numero                = '',
                    fechaEmision          = null,
                    montoTotal            = 0,
                    moneda                = 'PEN',
                    resumenIa             = '',
                    archivoUrl            = '',
                    estadoProcesamiento   = '',
                    items                 = [],
                }) {
        this.id                  = id;
        this.proveedorId         = proveedorId;
        this.categoriaId         = categoriaId;
        this.tipo                = tipo;
        this.serie               = serie;
        this.numero              = numero;
        this.fechaEmision        = fechaEmision;
        this.montoTotal          = montoTotal;
        this.moneda              = moneda;
        this.resumenIa           = resumenIa;
        this.archivoUrl          = archivoUrl;
        this.estadoProcesamiento = estadoProcesamiento;
        this.items               = (items ?? []).map(i => new ItemFactura(i));
    }
}