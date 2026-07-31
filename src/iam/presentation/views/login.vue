<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '@/iam/application/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const tardando = ref(false);
let timeoutAviso = null;

function submit() {
  loading.value = true;
  tardando.value = false;
  timeoutAviso = setTimeout(() => { tardando.value = true; }, 5000);

  authStore.login({ email: email.value, password: password.value })
      .then(() => router.push({ name: 'invoicing-facturas' }))
      .catch(() => {})
      .finally(() => {
        loading.value = false;
        tardando.value = false;
        clearTimeout(timeoutAviso);
      });
}
</script>

<template>
  <div class="auth-page">
    <pv-card class="auth-card">
      <template #title>Iniciar sesión</template>
      <template #content>
        <form class="auth-form" @submit.prevent="submit">
          <pv-float-label>
            <pv-input-text id="email" v-model="email" />
            <label for="email">Correo electrónico</label>
          </pv-float-label>

          <pv-float-label>
            <pv-password id="password" v-model="password" :feedback="false" toggleMask />
            <label for="password">Contraseña</label>
          </pv-float-label>

          <small v-if="authStore.error" class="p-error">{{ authStore.error }}</small>

          <pv-button type="submit" label="Ingresar" :loading="loading" />
          <p v-if="loading && tardando" class="hint">
            Esto puede tardar hasta un minuto la primera vez — el servidor estaba inactivo y se está reactivando.
          </p>
        </form>

        <p class="auth-switch">
          ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
        </p>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; }
.auth-card { width: 100%; max-width: 400px; }
.auth-form { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 0.5rem; }
.auth-switch { text-align: center; margin-top: 1rem; }
.auth-form :deep(.p-floatlabel),
.auth-form :deep(.p-inputtext),
.auth-form :deep(.p-password),
.auth-form :deep(.p-password-input) {
  width: 100%;
}
.hint { color: #6b7280; font-size: 0.9rem; text-align: center; }
</style>