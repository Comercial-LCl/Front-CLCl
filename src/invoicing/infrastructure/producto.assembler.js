import {Producto} from "@/invoicing/domain/model/producto-entity.js";

export class ProductoAssembler {
    static toEntityFromResource(resource) {
        return new Producto({...resource});
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }
}