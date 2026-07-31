import {IamApi} from "@/iam/infrastructure/iam-api.js";
import {UsuarioAssembler} from "@/iam/infrastructure/usuario.assembler.js";
import {Usuario} from "@/iam/domain/model/usuario-entity.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";

const iamApi = new IamApi();

const TOKEN_KEY = 'facturasia_token';
const USER_KEY  = 'facturasia_user';

function readStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? new Usuario(JSON.parse(raw)) : null;
}

const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem(TOKEN_KEY) || '');
    const user  = ref(readStoredUser());
    const error = ref('');

    const isAuthenticated = computed(() => !!token.value);

    function persist(userEntity, jwt) {
        user.value  = userEntity;
        token.value = jwt;
        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userEntity));
    }

    /** El sign-in del backend devuelve el usuario y el token en el mismo objeto */
    function login({email, password}) {
        error.value = '';
        return iamApi.signIn({email, password}).then(response => {
            const authenticatedUser = UsuarioAssembler.toEntityFromResponse(response);
            persist(authenticatedUser, response.data.token);
            return authenticatedUser;
        }).catch(err => {
            error.value = err.response?.data?.message || 'No se pudo iniciar sesión.';
            throw err;
        });
    }

    /** El sign-up del backend solo devuelve un mensaje de confirmación, así que encadenamos el login */
    function register({nombre, email, password, rucNegocio}) {
        error.value = '';
        return iamApi.signUp({nombre, email, password, rucNegocio})
            .then(() => login({email, password}))
            .catch(err => {
                if (!error.value) {
                    error.value = err.response?.data?.message || 'No se pudo completar el registro.';
                }
                throw err;
            });
    }

    function logout() {
        user.value  = null;
        token.value = '';
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    return { user, token, error, isAuthenticated, login, register, logout };
});

export default useAuthStore;