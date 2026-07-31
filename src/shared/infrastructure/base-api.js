import axios from "axios";

const TOKEN_KEY = 'facturasia_token';
const USER_KEY  = 'facturasia_user';

export class BaseApi {

    #http;

    constructor(baseURL = import.meta.env.VITE_API_URL) {
        this.#http = axios.create({
            baseURL: baseURL,
            timeout: 70000, // Render free tier puede tardar ~60s en el cold start
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.#http.interceptors.request.use(config => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        this.#http.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                    if (window.location.pathname !== '/login') window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    get http() {
        return this.#http;
    }
}