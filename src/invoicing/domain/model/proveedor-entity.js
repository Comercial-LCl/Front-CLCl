export class Proveedor {
    constructor({ id = null, ruc = '', razonSocial = '' }) {
        this.id          = id;
        this.ruc         = ruc;
        this.razonSocial = razonSocial;
    }
}