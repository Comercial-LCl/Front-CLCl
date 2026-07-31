export class ItemFactura {
    constructor({
                    id             = null,
                    descripcion    = '',
                    cantidad       = 0,
                    precioUnitario = 0,
                    subtotal       = 0,
                }) {
        this.id             = id;
        this.descripcion    = descripcion;
        this.cantidad       = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal       = subtotal;
    }
}