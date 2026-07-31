export class Usuario {
    constructor({
                    id         = null,
                    nombre     = '',
                    email      = '',
                    rucNegocio = '',
                }) {
        this.id         = id;
        this.nombre     = nombre;
        this.email      = email;
        this.rucNegocio = rucNegocio;
    }
}