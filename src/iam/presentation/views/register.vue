<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuthStore from '@/iam/application/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const nombre = ref('');
const email = ref('');
const password = ref('');
const rucNegocio = ref('');
const loading = ref(false);

function submit() {
  loading.value = true;
  authStore.register({
    nombre: nombre.value,
    email: email.value,
    password: password.value,
    rucNegocio: rucNegocio.value,
  })
      .then(() => router.push({ name: 'invoicing-facturas' }))
      .catch(() => {})
      .finally(() => { loading.value = false; });
}
</script>

<template>
  <div class="auth-page">
    <pv-card class="auth-card">
      <template #title>Crear cuenta</template>
      <template #content>
        <form class="auth-form" @submit.prevent="submit">
          <pv-float-label>
            <pv-input-text id="nombre" v-model="nombre" />
            <label for="nombre">Nombre completo</label>
          </pv-float-label>

          <pv-float-label>
            <pv-input-text id="email" v-model="email" />
            <label for="email">Correo electrónico</label>
          </pv-float-label>

          <pv-float-label>
            <pv-password id="password" v-model="password" :feedback="false" toggleMask />
            <label for="password">Contraseña</label>
          </pv-float-label>

          <pv-float-label>
            <pv-input-text id="rucNegocio" v-model="rucNegocio" />
            <label for="rucNegocio">RUC del negocio (opcional)</label>
          </pv-float-label>

          <small v-if="authStore.error" class="p-error">{{ authStore.error }}</small>

          <pv-button type="submit" label="Registrarme" :loading="loading" />
        </form>

        <p class="auth-switch">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
        </p>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; }
.auth-card { width: 100%; max-width: 420px; }
.auth-form { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 0.5rem; }
.auth-switch { text-align: center; margin-top: 1rem; }
.auth-form :deep(.p-floatlabel),
.auth-form :deep(.p-inputtext),
.auth-form :deep(.p-password),
.auth-form :deep(.p-password-input) {
  width: 100%;
}
</style>