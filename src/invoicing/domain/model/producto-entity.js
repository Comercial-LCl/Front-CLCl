export class Producto {
    constructor({ id = null, proveedorId = null, nombre = '' }) {
        this.id          = id;
        this.proveedorId = proveedorId;
        this.nombre      = nombre;
    }
}