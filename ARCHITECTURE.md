# ListTest / Cotizador PC — Documentación del Proyecto

Aplicación web para armar, valuar y compartir configuraciones (builds) de PC. Es un monorepo con dos partes independientes que viven en el mismo repositorio:

- **Frontend**: Angular 20 (`/src`), desplegado en Vercel.
- **Backend**: API REST en Node.js/Express con Sequelize sobre MySQL (`/CRUD`), corriendo en `https://nodemysql12.duckdns.org:443`.

> El nombre visible del sitio es "Cotizador PC" (ver `configuracionController.js`, que genera URLs `https://cotizadorpc.org/builds/:id`), aunque el proyecto Angular se llama `list-test`.

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Frontend (Angular)](#frontend-angular)
- [Backend (Express + Sequelize)](#backend-express--sequelize)
- [Modelo de datos](#modelo-de-datos)
- [Autenticación](#autenticación)
- [Variables de entorno](#variables-de-entorno)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Build y despliegue](#build-y-despliegue)
- [Puntos a tener en cuenta](#puntos-a-tener-en-cuenta)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend framework | Angular 20 (`NgModule`-based, no standalone components) |
| UI | Angular Material 20, Angular CDK, Bootstrap 5, `ngx-mat-select-search` |
| HTTP client (frontend) | `axios` en la mayoría de servicios/componentes; `HttpClient` de Angular solo en `OpenAiService` |
| PDF / export | `jspdf` + `jspdf-autotable` (cotizaciones/valuaciones en PDF), `html2canvas` |
| Backend framework | Express 4 |
| ORM | Sequelize 6 sobre `mysql2` |
| Auth | `jsonwebtoken` (JWT) + `bcrypt` para hash de contraseñas |
| Base de datos | MySQL |
| Dev server backend | `app3.js` vía Node (puerto 443 por defecto) |
| Servido estático (prod) | `lite-server` sobre `dist/list-test` (`startServer.bat`, `bs-config.json`) |
| Hosting frontend | Vercel (`.vercel/project.json`) |

## Estructura del repositorio

```
ListTest/
├── src/app/                 # Aplicación Angular (frontend)
├── CRUD/                    # API REST Node/Express (backend)
│   ├── app3.js               # Entry point del servidor
│   ├── config/db.js          # Conexión Sequelize a MySQL
│   ├── models/                # Component, User, Configuracion
│   ├── controllers/           # Lógica de negocio por recurso
│   └── routes/                 # Definición de endpoints Express
├── MYSQL Respaldo/          # Respaldos SQL de la base de datos
├── dist/                    # Build de producción del frontend
├── angular.json, tsconfig*  # Config Angular/TypeScript
├── bs-config.json, startServer.bat  # Servidor estático liviano para dist/
└── .vercel/                 # Config de despliegue en Vercel
```

El frontend y el backend **no comparten `package.json`**: cada uno tiene sus propias dependencias (`/package.json` para Angular, `/CRUD/package.json` para la API).

## Frontend (Angular)

### Módulos y routing

`AppModule` (`src/app/app.module.ts`) declara todos los componentes (arquitectura clásica de `NgModule`, sin standalone components excepto `ChangePhotoDialogComponent`). El ruteo vive en `src/app/app-routing.module.ts`:

| Ruta | Componente | Protegida (`JwtAuthGuard`) |
|---|---|---|
| `/` | redirige a `/home` | — |
| `/home` | `HomeComponent` | No |
| `/builds` | `BuildsComponent` | No |
| `/builds/:id` | `DetalleConfiguracionComponent` | No |
| `/login` | `LoginComponent` | No |
| `/parts` | `PartsComponent` | Sí |
| `/edit` | `EditpartsComponent` | Sí |
| `/chatgpt` | `ChatgptComponent` | Sí |
| `/register-user` | `RegisterUserComponent` | Sí |
| `/profile` | `ProfileUserComponent` | Sí |
| `/valuacion` | `ValuacionComponent` | No |
| `/guia` | `GuiaComponent` | No |

`JwtAuthGuard` (`src/app/jwt-auth.guard.ts`) solo verifica que exista un `token` en `localStorage`; **no valida expiración ni firma en el cliente**, simplemente redirige a `/login` si no hay token.

### Componentes principales

- **`HomeComponent`**: landing page. Carga en paralelo 5 configuraciones predefinidas por ID (`618`–`622`, representando gamas "entrada/baja/media/alta/trabajo") desde el endpoint de configuraciones y calcula precio/consumo total de cada una.
- **`BuildsComponent`** (el más grande, ~880 líneas): armador de PC. Permite elegir componentes por categoría (procesador, motherboard, RAM, almacenamiento, disipador, fuente, gráfica, gabinete), filtra motherboards/RAM compatibles, suma precios y consumo, exporta a PDF (`jspdf-autotable`) y guarda la configuración vía `configuracionController` para generar una URL compartible (`/builds/:id`).
- **`DetalleConfiguracionComponent`**: muestra el detalle de una configuración guardada, recuperándola por `id` desde `/configuraciones/:id`.
- **`PartsComponent`**: formulario (Reactive Forms) para dar de alta nuevos componentes/partes en el catálogo (`POST /components`). Muestra/oculta campos según el tipo (`socket` para procesador/motherboard, `rams` para motherboard/ram, `potencia` para psu).
- **`EditpartsComponent`**: búsqueda con autocomplete (`ngx-mat-select-search`/CDK) sobre el catálogo de componentes y edición de un componente existente.
- **`ValuacionComponent`**: calculadora de valor de reventa/depreciación de una PC en base a los componentes seleccionados y antigüedad (`anoSeleccionado`), también exporta a PDF.
- **`ChatgptComponent`**: interfaz de chat que usa `OpenAiService`.
- **`LoginComponent` / `RegisterUserComponent` / `ProfileUserComponent`**: login, registro de usuario y perfil (con `ChangePhotoDialogComponent` para cambiar foto).
- **`NavbarComponent`**: navegación lateral (sidenav) compartida, inyectada directamente en varios componentes para controlar `showToggleButton`.
- **`GuiaComponent`**: página informativa/estática (guía de uso).

### Servicios

| Servicio | Responsabilidad | Notas |
|---|---|---|
| `AuthService` (`src/app/auth.service.ts`) | Login/logout, guarda `token` en `localStorage`, expone `isAuthenticated` como `BehaviorSubject` | POST a `/users/auth` |
| `ApiService` (`src/app/api.service.ts`) | Obtener lista de usuarios | Solo tiene `getUsuarios()`; parece parcialmente redundante con otros accesos directos por `axios` desde los componentes |
| `ComponentesService` (`src/app/services/componentes.service.ts`) | Obtener catálogo de componentes (`GET /components`), expone estado `isLoading$` | Usado por `ValuacionComponent` |
| `OpenAiService` (`src/app/openai.service.ts`) | Envía prompts a la API de OpenAI (`gpt-3.5-turbo`) | La API key se obtiene en runtime desde `https://masteros.cloud/apikey` (ver [Puntos a tener en cuenta](#puntos-a-tener-en-cuenta)) |

La mayoría de componentes (`BuildsComponent`, `PartsComponent`, `HomeComponent`, etc.) llaman a la API directamente con `axios` en vez de pasar por un servicio, por lo que la URL base `https://nodemysql12.duckdns.org:443` está hardcodeada en múltiples archivos.

### Interfaces

`src/app/interfaces/componente.interface.ts` define `Componente` (id, modelo, precio, tipo, img, socket?, tienda, url, consumo?, potencia?, rams?), el modelo que refleja la tabla `componentes` del backend.

## Backend (Express + Sequelize)

Entry point: `CRUD/app3.js`.

- Levanta Express en el puerto de `process.env.PORT` (default `443`).
- Configura CORS manualmente (permite todos los orígenes, headers `Authorization` incluidos).
- Al iniciar, autentica contra MySQL con Sequelize y sincroniza los modelos (`sequelize.sync()` — crea tablas si no existen; no usa migraciones).
- Monta tres routers: `/components`, `/users`, `/configuraciones`.

### Endpoints

**`/components`** (`routes/componentRoutes.js` → `controllers/componentController.js`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/components/` | Lista todos los componentes |
| GET | `/components/modelo/:modelo` | Búsqueda parcial (`LIKE %modelo%`) por modelo |
| GET | `/components/tipo/:tipo` | Filtra por tipo (procesador, motherboard, ram, etc.) |
| GET | `/components/:id` | Obtiene un componente por ID |
| POST | `/components/` | Crea un componente |
| PUT | `/components/:id` | Actualiza un componente |
| DELETE | `/components/:id` | Elimina un componente |

**`/users`** (`routes/userRoutes.js` → `controllers/userController.js`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users/` | Lista usuarios (sin `password`/`correo`) |
| GET | `/users/:id` | Usuario por ID (sin `password`/`correo`) |
| POST | `/users/register` | Registra usuario, hashea password con `bcrypt` (`SALT_ROUNDS`) |
| POST | `/users/auth` | Login: compara password con `bcrypt.compare`, devuelve JWT (`expiresIn: '1h'`) firmado con `JWT_SECRET` |

**`/configuraciones`** (`routes/configuracionRoutes.js` → `controllers/configuracionController.js`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/configuraciones/` | Guarda una config como JSON (`jsonConfig`) + `fechaHora`, devuelve URL pública `cotizadorpc.org/builds/:id` |
| GET | `/configuraciones/:id` | Recupera y parsea una configuración guardada |
| PUT | `/configuraciones/:id` | Actualiza el `jsonConfig` de una configuración existente |

No hay middleware de verificación de JWT en el backend: ninguna ruta valida el token recibido en `Authorization` a pesar de que el frontend lo envía y de que CORS lo permite explícitamente. La protección de rutas (`/parts`, `/edit`, etc.) es **solo del lado del cliente** (`JwtAuthGuard`).

## Modelo de datos

Definido vía Sequelize (`CRUD/models/*.js`), sin migraciones — las tablas se generan/sincronizan automáticamente al levantar el servidor.

### `componentes` (modelo `Component`)
`id`, `tipo`, `modelo`, `precio`, `tienda`, `url`, `consumo`, `socket`, `rams`, `potencia`, `img` — sin timestamps.

### `usuarios` (modelo `User`)
`id`, `nombre`, `img`, `id_usuario`, `direccion`, `telefono`, `password` (hash bcrypt), `correo` — sin timestamps.

### `configuraciones` (modelo `Configuracion`)
`id`, `jsonConfig` (TEXT, serializa el build completo), `fechaHora` — sin timestamps propios de Sequelize (se maneja `fechaHora` a mano).

Existen respaldos SQL en `MYSQL Respaldo/` (`Respaldo_componentes.sql`, `test_componentes.sql`, y una carpeta fechada `23-04-2026/`) que sirven como snapshots históricos de la tabla `componentes`.

## Autenticación

Flujo end-to-end:

1. `LoginComponent` → `AuthService.login()` → `POST /users/auth` con `{ id_usuario, password }`.
2. Backend verifica con `bcrypt.compare` y firma un JWT (`{ id_usuario }`, expira en 1h) con `JWT_SECRET`.
3. Frontend guarda el token en `localStorage` bajo la key `token`.
4. `JwtAuthGuard` solo comprueba que `localStorage.getItem('token')` exista (no decodifica ni valida expiración/firma).
5. El backend no exige ni valida ese token en ninguna ruta protegida — es responsabilidad exclusiva del cliente.

## Variables de entorno

El backend (`CRUD/.env`, no versionado) requiere:

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
DB_SSL=          # 'true' habilita SSL con rejectUnauthorized: false
MAILERSEND_API=  # presente en .env pero sin uso detectado en el código actual
SALT_ROUNDS=     # rounds para bcrypt
JWT_SECRET=      # secreto para firmar/verificar JWT
PORT=            # opcional, default 443
```

El frontend no usa `environment.ts` de Angular para configuración: las URLs de API están hardcodeadas directamente en servicios y componentes (`https://nodemysql12.duckdns.org:443`).

## Puesta en marcha local

**Backend:**

```bash
cd CRUD
npm install
# crear CRUD/.env con las variables listadas arriba
node app3.js
```

**Frontend:**

```bash
npm install
npm start   # ng serve, http://localhost:4200
```

> Nota: varios servicios (`AuthService`, `ComponentesService`, etc.) apuntan por defecto a `https://nodemysql12.duckdns.org:443` en vez de `localhost:3000`. Para desarrollar 100% en local hay que editar manualmente esas URLs (existen variables `*_Url2`/`baseUrl2` ya declaradas pero sin usar activamente en varios servicios).

## Build y despliegue

- **Frontend**: `npm run build` (Angular CLI) genera `dist/list-test`. Se despliega en Vercel (`.vercel/project.json`). También puede servirse localmente de forma estática con `startServer.bat` (`lite-server` sobre `dist/list-test`, puerto 8000, UI en 8001 vía `bs-config.json`).
- **Backend**: se ejecuta como proceso Node persistente (`node app3.js`), actualmente alojado en `nodemysql12.duckdns.org` sobre el puerto 443 con TLS.

## Puntos a tener en cuenta

- **Endpoints hardcodeados**: la URL de la API (`https://nodemysql12.duckdns.org:443`) y del backend de API keys (`https://masteros.cloud/apikey`) están repetidas en múltiples archivos del frontend en lugar de centralizarse en `environment.ts`.
- **JWT no verificado en backend**: las rutas "protegidas" del frontend no tienen contraparte real de autorización en la API; cualquier cliente puede llamar directamente a `/components`, `/users`, etc.
- **`OpenAiService`** obtiene la API key de OpenAI desde un endpoint externo (`masteros.cloud/apikey`) buscando el registro `id === 2` y usando su campo `username` como key — un patrón frágil y poco convencional para gestionar secretos.
- **Sin migraciones**: el esquema de base de datos se gestiona con `sequelize.sync()`, lo que puede ser riesgoso en producción ante cambios de modelo.
- **`ApiService`** parece subutilizado; la mayoría de componentes llaman a `axios` directamente en vez de centralizar las llamadas HTTP.
- Existe una carpeta `MYSQL Respaldo/23-04-2026/` sin trackear en git (ver `git status`), posiblemente un respaldo local pendiente de decidir si se versiona.
