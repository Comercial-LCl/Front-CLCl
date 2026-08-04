const facturaList             = () => import('./views/factura-list.vue');
const facturaDetail           = () => import('./views/factura-detail.vue');
const facturaFisicaForm       = () => import('./views/factura-fisica-form.vue');
const facturaElectronicaForm  = () => import('./views/factura-electronica-form.vue');
const facturaCorrectionForm   = () => import('./views/factura-correction-form.vue');
const resumenGastos           = () => import('./views/resumen-gastos.vue');
const proveedorList           = () => import('./views/proveedor-list.vue');
const proveedorDetail         = () => import('./views/proveedor-detail.vue');
const productoHistorial       = () => import('./views/producto-historial.vue');

const invoicingRoutes = [
    { path: 'facturas',                     name: 'invoicing-facturas',           component: facturaList,            meta: { title: 'Facturas' } },
    { path: 'facturas/nueva/fisica',        name: 'invoicing-facturas-fisica',     component: facturaFisicaForm,      meta: { title: 'Nueva factura física' } },
    { path: 'facturas/nueva/electronica',   name: 'invoicing-facturas-electronica',component: facturaElectronicaForm, meta: { title: 'Nueva factura electrónica' } },
    { path: 'facturas/:id',                 name: 'invoicing-facturas-detail',     component: facturaDetail,          meta: { title: 'Detalle de factura' } },
    { path: 'facturas/:id/corregir',        name: 'invoicing-facturas-corregir',   component: facturaCorrectionForm,  meta: { title: 'Corregir factura' } },
    { path: 'resumen',                      name: 'invoicing-resumen',             component: resumenGastos,          meta: { title: 'Resumen de gastos' } },
    { path: 'proveedores',                  name: 'invoicing-proveedores',         component: proveedorList,          meta: { title: 'Proveedores' } },
    { path: 'proveedores/:id',              name: 'invoicing-proveedor-detail',    component: proveedorDetail,        meta: { title: 'Detalle de proveedor' } },
    { path: 'proveedores/:proveedorId/productos/:productoId/historial', name: 'invoicing-producto-historial', component: productoHistorial, meta: { title: 'Historial de precios' } },
];

export default invoicingRoutes;