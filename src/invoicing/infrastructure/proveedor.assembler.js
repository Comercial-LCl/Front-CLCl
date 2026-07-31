import {Proveedor} from "@/invoicing/domain/model/proveedor-entity.js";

export class ProveedorAssembler {
    static toEntityFromResource(resource) {
        return new Proveedor({...resource});
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }
}