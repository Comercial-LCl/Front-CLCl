import {Usuario} from "@/iam/domain/model/usuario-entity.js";

export class UsuarioAssembler {
    static toEntityFromResource(resource) {
        return new Usuario({...resource});
    }

    static toEntityFromResponse(response) {
        return this.toEntityFromResource(response.data);
    }
}