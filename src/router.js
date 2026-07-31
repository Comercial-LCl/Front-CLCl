import {createRouter, createWebHistory} from 'vue-router';
import useAuthStore from "@/iam/application/auth.store.js";
import invoicingRoutes from "@/invoicing/presentation/invoicing-routes.js";

const pageNotFound = () => import("@/shared/presentation/views/page-not-found.vue");
const login        = () => import("@/iam/presentation/views/login.vue");
const register     = () => import("@/iam/presentation/views/register.vue");

const routes = [
    { path: '/login',    name: 'login',    component: login,    meta: { title: 'Iniciar sesión', public: true } },
    { path: '/register', name: 'register', component: register, meta: { title: 'Registro', public: true } },

    { path: '/invoicing', name: 'invoicing', children: invoicingRoutes },

    { path: '/',                redirect: { name: 'invoicing-facturas' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Página no encontrada', public: true } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to) => {
    document.title = `FacturasIA - ${to.meta['title']}`;

    const authStore = useAuthStore();

    if (!authStore.isAuthenticated && !to.meta.public) {
        return { name: 'login' };
    }

    if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
        return { name: 'invoicing-facturas' };
    }
});

export default router;