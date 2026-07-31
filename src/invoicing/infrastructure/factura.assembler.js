import {Factura} from "@/invoicing/domain/model/factura-entity.js";

export class FacturaAssembler {
    static toEntityFromResource(resource) {
        return new Factura({...resource});
    }

    static toEntityFromResponse(response) {
        return this.toEntityFromResource(response.data);
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(resource => this.toEntityFromResource(resource));
    }
}