<script setup>
import { useRoute } from "vue-router";
import Layout from "@/shared/presentation/components/layout.vue";

const route = useRoute();
</script>

<template>
  <layout v-if="!route.meta.public"/>
  <router-view v-else/>
</template>