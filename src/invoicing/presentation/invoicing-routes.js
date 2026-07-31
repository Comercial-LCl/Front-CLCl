const facturaList             = () => import('./views/factura-list.vue');
const facturaDetail           = () => import('./views/factura-detail.vue');
const facturaFisicaForm       = () => import('./views/factura-fisica-form.vue');
const facturaElectronicaForm  = () => import('./views/factura-electronica-form.vue');
const facturaCorrectionForm   = () => import('./views/factura-correction-form.vue');
const resumenGastos           = () => import('./views/resumen-gastos.vue');

const invoicingRoutes = [
    { path: 'facturas',                     name: 'invoicing-facturas',           component: facturaList,            meta: { title: 'Facturas' } },
    { path: 'facturas/nueva/fisica',        name: 'invoicing-facturas-fisica',     component: facturaFisicaForm,      meta: { title: 'Nueva factura física' } },
    { path: 'facturas/nueva/electronica',   name: 'invoicing-facturas-electronica',component: facturaElectronicaForm, meta: { title: 'Nueva factura electrónica' } },
    { path: 'facturas/:id',                 name: 'invoicing-facturas-detail',     component: facturaDetail,          meta: { title: 'Detalle de factura' } },
    { path: 'facturas/:id/corregir',        name: 'invoicing-facturas-corregir',   component: facturaCorrectionForm,  meta: { title: 'Corregir factura' } },
    { path: 'resumen',                      name: 'invoicing-resumen',             component: resumenGastos,          meta: { title: 'Resumen de gastos' } },
];

export default invoicingRoutes;