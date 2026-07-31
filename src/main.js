import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import Material from '@primeuix/themes/material';
import PrimeVue from 'primevue/config';
import {
    Avatar, Button, Card, Column, ConfirmationService, ConfirmDialog,
    DataTable, DatePicker, Dialog, Drawer, FileUpload, FloatLabel,
    IconField, InputIcon, InputNumber, InputText, Password, Select,
    Tag, Textarea, Toast, ToastService, Toolbar, Tooltip
} from "primevue";
import pinia from "@/pinia.js";
import router from "@/router.js";

const app = createApp(App)
    .use(PrimeVue, { theme: { preset: Material, options: { darkModeSelector: false } }, ripple: true })
    .use(ConfirmationService)
    .use(ToastService)
    .component('pv-avatar',         Avatar)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table',     DataTable)
    .component('pv-date-picker',    DatePicker)
    .component('pv-dialog',         Dialog)
    .component('pv-drawer',         Drawer)
    .component('pv-file-upload',    FileUpload)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-number',   InputNumber)
    .component('pv-input-text',     InputText)
    .component('pv-password',       Password)
    .component('pv-select',         Select)
    .component('pv-tag',            Tag)
    .component('pv-textarea',       Textarea)
    .component('pv-toast',          Toast)
    .component('pv-toolbar',        Toolbar)
    .component('tooltip',           Tooltip)
    .use(pinia)
    .use(router);

// Pinia antes que el router por la misma razón que en SkillSwap:
// el guard beforeEach usa useAuthStore() en la primera navegación.
router.isReady().then(() => app.mount('#app'));