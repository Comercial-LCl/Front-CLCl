import {BaseApi} from "@/shared/infrastructure/base-api.js";

const authenticationEndpointPath = import.meta.env.VITE_AUTHENTICATION_ENDPOINT_PATH;

export class IamApi extends BaseApi {

    signIn({email, password}) {
        return this.http.post(`${authenticationEndpointPath}/sign-in`, {email, password});
    }

    signUp({nombre, email, password, rucNegocio}) {
        return this.http.post(`${authenticationEndpointPath}/sign-up`, {nombre, email, password, rucNegocio});
    }
}