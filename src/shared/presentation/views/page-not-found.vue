<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada.</p>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 1rem; }
</style>