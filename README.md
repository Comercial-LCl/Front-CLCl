# FacturasIA — Frontend

Frontend del **Sistema Inteligente de Registro y Análisis de Facturas**: una app web que permite a pequeños negocios registrar automáticamente sus facturas de compra mediante código QR, fotografía o archivo PDF, usando OCR e inteligencia artificial para minimizar el ingreso manual de datos y visibilizar en qué categorías está gastando el negocio.

🔗 **Demo en producción:** https://front-clcl.vercel.app
🔗 **Backend (API + Swagger):** https://backend-clcl.onrender.com/swagger/index.html

> ⚠️ El backend corre en el free tier de Render y se duerme tras 15 min de inactividad — la primera petición después de eso puede tardar 30-60 segundos en responder mientras el servidor despierta.

## Stack tecnológico

- **Framework:** Vue.js 3 (Composition API, JavaScript)
- **UI:** PrimeVue, PrimeIcons, PrimeFlex
- **Estado:** Pinia
- **Routing:** Vue Router
- **HTTP:** Axios
- **Escaneo de QR:** qr-scanner
- **Build:** Vite

## Arquitectura

El proyecto sigue una organización por **Bounded Context** (DDD), un BC por carpeta:
