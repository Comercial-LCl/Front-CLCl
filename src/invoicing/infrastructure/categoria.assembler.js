import {Categoria} from "@/invoicing/domain/model/categoria-entity.js";

export class CategoriaAssembler {
    static toEntityFromResource(resource) {
        return new Categoria({...resource});
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }
}