<p align="center">
  <img src="public/Indumentaria/Logo.png" alt="pnt2EcommerceVueJs" width="140" />
</p>

# pnt2EcommerceVueJs

SPA de e-commerce construida con Vue 3 + Vite que consume un backend REST (`http://localhost:3000/app`). Incluye catálogo público, registro/login con JWT, gestión de carrito y flujo de órdenes para clientes, además de un panel administrativo para productos, roles y usuarios.

## Características principales

- Catálogo y detalles de producto con cards reutilizables y soporte de imágenes.
- Autenticación JWT administrada con Pinia; persistencia automática del token y headers Authorization en Axios.
- Carrito y órdenes: agregar/eliminar items, validar stock, generar órdenes y consultar historial de compras.
- Perfil de usuario editable (datos personales y dirección de envío) sincronizado con el store global.
- Dashboard Admin modular con `ProductManagement`, `RoleManagement`, `UserManagement`, `OrdersManagement`, `ImageUrlsManagement` y tarjetas de métricas (`ProductMetrics`, `BestCustomerCard`).
- UI responsiva basada en Vuetify 3, Material Design Icons y layouts reutilizables (`NavBar`, `Footer`).

## Stack tecnológico

- Vue 3 + Vite (ESM, HMR)
- Pinia para estado global
- Vue Router 4 para navegación SPA
- Vuetify 3 para componentes UI
- Axios con instancia centralizada (`src/plugins/axios.js`)

## Arquitectura de la app

- `src/plugins/axios.js`: instancia única con `baseURL` leída de `VITE_API_URL`, timeout de 10s e inyección automática del token JWT.
- `src/store/auth.js`: maneja usuario, token y rol; expone getters (`isAuthenticated`, `isAdminGetter`) usados en router y vistas.
- `src/router/index.js`: define rutas públicas/privadas, aplica `meta.requiresAuth` y un guard global que redirige a `/login` si no hay sesión.
- `src/plugins/Vuetify.js`: configura Vuetify 3 y Material Design Icons para toda la SPA.
- Componentes compartidos (`NavBar`, `Footer`, cards de producto/carrito) consumen el store y el cliente Axios para mantener consistencia.

## Requisitos previos

- Node.js 18+ (recomendado LTS) y npm 9+
- Backend disponible en `http://localhost:3000/app` (o la URL que definas en `VITE_API_URL`)

## Configuración y ejecución

```bash
git clone https://github.com/szavala-dev/pnt2-trabajointegrador.git
cd pnt2-trabajointegrador
npm install

# Copia el ejemplo de variables de entorno
cp .env.example .env   # crea el archivo y edítalo según necesites

# Desarrollo
npm run dev

# Compilación producción
npm run build

# Previsualización del build
npm run preview
```

El servidor de desarrollo corre por defecto en `http://localhost:8000` y proxya las llamadas a la API configurada.

## Variables de entorno

Parte desde `.env.example` (`cp .env.example .env`) y ajusta los valores necesarios. El mínimo requerido es:

```bash
VITE_API_URL=http://localhost:3000/app
```

Si la variable no está definida, el cliente Axios usará `http://localhost:3000/app` como valor por defecto.

## Estructura del proyecto

```text
TP-Integrador/
├── .env.example
├── public/
├── src/
│   ├── assets/
│   │   └── style.css
│   ├── components/
│   │   ├── BestCustomerCard.vue
│   │   ├── CartItem.vue
│   │   ├── Footer.vue
│   │   ├── NavBar.vue
│   │   ├── OrderCard.vue
│   │   ├── OrderTable.vue
│   │   ├── OrdersManagement.vue
│   │   ├── ImageUrlsManagement.vue
│   │   ├── ProductCard.vue
│   │   ├── ProductManagement.vue
│   │   ├── ProductMetrics.vue
│   │   ├── ProfileCard.vue
│   │   ├── RoleManagement.vue
│   │   └── UserManagement.vue
│   ├── plugins/
│   │   ├── Vuetify.js
│   │   └── axios.js
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   ├── auth.js
│   │   └── index.js
│   ├── views/
│   │   ├── AboutView.vue
│   │   ├── AdminDashboardView.vue
│   │   ├── CartView.vue
│   │   ├── CatalogView.vue
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── OrderDetailsView.vue
│   │   ├── ProductDetailsView.vue
│   │   ├── ProfileView.vue
│   │   └── RegisterView.vue
│   ├── App.vue
│   └── main.js
├── vite.config.js
└── package.json
```

## Panel administrativo

- `ProductManagement`: CRUD completo de productos (crear, editar, ocultar/publicar y eliminar) con validación de stock y precios.
- `RoleManagement`: mantenimiento de roles y soporte para la verificación `/users/check-admin`.
- `UserManagement`: tabla con acciones para crear, editar, eliminar y reasignar roles para cada usuario.
- `OrdersManagement`: listado con filtros por estado, detalle expandible y acciones rápidas (`confirm`, `prepare`, `send`, `cancel`).
- `ImageUrlsManagement`: CRUD de URLs por producto con filtros rápidos, vista previa y soporte para marcar imágenes principales.
- `ProductMetrics` + `BestCustomerCard`: tarjetas de insights que consumen `/products/best-selling`, `/products/least-selling` y `/users/best-customer` para mostrar KPIs al ingresar al panel.

## Rutas principales

| Ruta | Descripción | Protegida |
| ---- | ----------- | --------- |
| `/` | Landing con catálogo destacado y newsletter | No |
| `/catalog` | Listado completo de productos con CTA de compra | No |
| `/product/:id` | Detalle con galería, precio y botón "Agregar al carrito" | No (añadir requiere login) |
| `/cart` | Carrito del usuario y generación de orden | Sí |
| `/orders` | Historial y detalles de órdenes | Sí |
| `/profile` | Edición de datos personales | Sí |
| `/admin` | Panel con módulos de productos, roles, usuarios, órdenes y métricas | Sí (solo admins, validado en la vista) |

`router.beforeEach` asegura que las rutas marcadas con `meta.requiresAuth` sólo se visiten autenticado; `AdminDashboardView` refuerza la verificación chequeando `authStore.isAdmin` al montar.

## Endpoints del backend

Todos los endpoints viven bajo `http://localhost:3000/app` y esperan/retornan JSON:

| Área | Endpoint | Descripción |
| ---- | -------- | ----------- |
| Auth/Usuarios | `POST /users/login` | Autenticación por email/contraseña (devuelve JWT) |
|  | `GET /users/loginToken` | Devuelve el usuario asociado al token vigente |
|  | `POST /users` | Registro de nuevos usuarios |
|  | `PUT /users/:id` | Actualización de perfil |
|  | `POST /users/check-admin` | Valida si un `RoleId` pertenece a un admin |
|  | `GET /users/best-customer` | Obtiene el cliente con mayor gasto total para alimentar el dashboard |
| Roles | CRUD completo (`/roles`, `/roles/:id`) | Gestión de roles desde el panel admin |
| Productos | CRUD y métricas (`/products`, `/products/best-selling`, `/products/least-selling`) | Gestión del catálogo |
| Carrito | `GET /carts/:userId`, `POST /carts/add`, `POST /carts/remove`, `POST /carts/:userId/generate-order` | Flujo de compra; `add/remove` esperan `{ userId, productId, quantity }` |
| Órdenes | `GET /orders`, `GET /orders/user/:id`, `PUT /orders/:id/{confirm|prepare|send|cancel}` | Gestión y seguimiento de órdenes |
|  | `GET /orders/{pending|confirmed|prepared|sent|canceled}` | Listados específicos por estado usados en `OrdersManagement` |
| Imágenes | `GET/POST/PUT/DELETE /image-urls` | Gestión de galería por producto usada en `ImageUrlsManagement` |

Incluye `Authorization: Bearer <token>` donde corresponda.

## Scripts disponibles

| Script | Descripción |
| ------ | ----------- |
| `npm run dev` | Levanta el servidor de desarrollo con HMR |
| `npm run build` | Genera el bundle de producción en `dist/` |
| `npm run preview` | Sirve el contenido compilado localmente |

## Contribuciones

1. Haz fork y crea una rama (`git checkout -b feature/nombre`).
2. Implementa tus cambios y ejecuta pruebas manuales.
3. Abre un Pull Request describiendo la motivación y, si aplica, evidencia visual.

## Licencia

MIT. Consulta el archivo `LICENSE` para más detalles.
