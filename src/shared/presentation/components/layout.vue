<script setup>
import { useRouter } from "vue-router";
import useAuthStore from "@/iam/application/auth.store.js";

const router = useRouter();
const authStore = useAuthStore();

function logout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>

  <div class="app-shell">
    <div class="header">
      <pv-toolbar class="custom-toolbar">
        <template #start>
          <div class="brand-container">
            <h3>FacturasIA</h3>
          </div>
        </template>

        <template #end>
          <div class="right-actions">
            <router-link to="/invoicing/facturas" class="nav-link">Facturas</router-link>
            <router-link to="/invoicing/resumen" class="nav-link">Resumen de gastos</router-link>

            <pv-button label="Cerrar sesión" class="logout-btn" rounded text @click="logout" />
          </div>
        </template>
      </pv-toolbar>
    </div>

    <div class="main-content">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.header { position: sticky; top: 0; width: 100%; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); z-index: 1000; }
.custom-toolbar { background-color: transparent !important; border: none !important; padding: 0.5rem 2rem; }
.brand-container h3 { color: #1a2a40; font-weight: 700; font-size: 1.6rem; margin: 0; }
.main-content {
  flex: 1;
  width: 100%;
  padding: 28px 2.5rem;
  box-sizing: border-box;
}
.right-actions { display: flex; align-items: center; gap: 1.5rem; }
.nav-link { text-decoration: none; color: #000000; font-weight: 600; font-size: 1rem; padding-bottom: 3px; border-bottom: 2px solid transparent; }
.nav-link:hover, .nav-link.router-link-active { color: #e53e4f; border-bottom: 2px solid #e53e4f; }
</style>