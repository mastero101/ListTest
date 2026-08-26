# ListTest / Cotizador PC — Documentación del Proyecto

Aplicación web para armar, valuar y compartir configuraciones (builds) de PC. Es un monorepo con dos partes independientes que viven en el mismo repositorio:

- **Frontend**: Angular 20 (`/src`), desplegado en Vercel (`https://cotizadorpc.org`).
- **Backend**: API REST en Node.js/Express con Sequelize sobre PostgreSQL (`/CRUD`), corriendo en `https://pcparts.7285531.xyz`.

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
| Seguridad backend | `express-rate-limit` (auth/registro), `helmet` (cabeceras HTTP) |
| Contenedores | Docker (`node:20-alpine`), sin Docker Compose en producción (ver [Build y despliegue](#build-y-despliegue)) |
| CI/CD | GitHub Actions con runner self-hosted en el VPS de producción |
| Dev server backend | `app3.js` vía Node (puerto 443 por defecto) |
| Servido estático (prod) | `lite-server` sobre `dist/list-test` (`startServer.bat`, `bs-config.json`) |
| Hosting frontend | Vercel (`.vercel/project.json`), Node.js 24.x |

## Estructura del repositorio

```
ListTest/
├── src/app/                 # Aplicación Angular (frontend)
├── CRUD/                    # API REST Node/Express (backend)
│   ├── app3.js               # Entry point del servidor
│   ├── config/db.js          # Conexión Sequelize a MySQL (con pool)
│   ├── models/                # Component, User, Configuracion
│   ├── controllers/           # Lógica de negocio por recurso
│   ├── routes/                 # Definición de endpoints Express
│   ├── middleware/verifyToken.js  # Verificación de JWT (rutas de escritura)
│   ├── Dockerfile, .dockerignore
│   ├── docker-compose.yml    # No se usa en el VPS actual (sin plugin compose); referencia
│   └── .env.example
├── .github/workflows/deploy.yml  # CI/CD: build + deploy del backend vía runner self-hosted
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
- **`BuildsComponent`** (~530 líneas, refactorizado): armador de PC. Los 8 slots de componente (procesador, placa madre, RAM, almacenamiento, enfriamiento, fuente, gráfica, gabinete) se modelan con un tipo `SlotKey` y un único `slots: Record<SlotKey, ComponentSlot>`, en vez de 48 propiedades planas + 8 setters independientes (diseño original). La selección pasa por un solo método `selectComponent(key, value)`; sumatorias de precio/consumo, export a PDF/CSV/texto y el JSON guardado (`buildJSON`) iteran sobre `slotList` en vez de código repetido por slot. Las claves del JSON exportado (`procesador`, `placaMadre`, `ram`, etc.) se mantuvieron intactas para no romper configuraciones ya guardadas. Filtra motherboards/RAM compatibles y guarda la configuración vía `configuracionController` para generar una URL compartible (`/builds/:id`).
- **`DetalleConfiguracionComponent`**: muestra el detalle de una configuración guardada, recuperándola por `id` desde `/configuraciones/:id`.
- **`PartsComponent`**: formulario (Reactive Forms) para dar de alta nuevos componentes/partes en el catálogo (`POST /components`, con header `Authorization: Bearer <token>`). Muestra/oculta campos según el tipo (`socket` para procesador/motherboard, `rams` para motherboard/ram, `potencia` para psu).
- **`EditpartsComponent`**: búsqueda con autocomplete (`ngx-mat-select-search`/CDK) sobre el catálogo de componentes y edición/borrado de un componente existente (`PUT`/`DELETE /components/:id`, ambos con header `Authorization`). Todos los campos del formulario tienen feedback de validación inline (`mat-error`).
- **`ValuacionComponent`**: calculadora de valor de reventa/depreciación de una PC en base a los componentes seleccionados y antigüedad (`anoSeleccionado`), también exporta a PDF.
- **`ChatgptComponent`**: interfaz de chat que usa `OpenAiService`.
- **`LoginComponent`**: login con feedback de validación inline y `MatSnackBar` para errores (ya no usa `alert()`).
- **`RegisterUserComponent`**: registro de usuario (`POST /users/register`). Tras un registro exitoso muestra un `MatSnackBar` y navega a `/login-user`; ya no intenta llamar a `/sms` ni `/send_email` (endpoints que nunca existieron en el backend, eran código muerto). Nota: esta ruta está detrás de `JwtAuthGuard` (ver tabla de rutas), un comportamiento preexistente algo inusual para una pantalla de registro.
- **`ProfileUserComponent`**: perfil de usuario, con `ChangePhotoDialogComponent` para cambiar foto.
- **`NavbarComponent`**: sidenav responsivo. Usa `BreakpointObserver` (`@angular/cdk/layout`) para detectar `(max-width: 960px)`: en mobile el sidenav es `mode="over"` (se superpone y se cierra automáticamente al navegar, suscrito a `router.events`), en desktop es `mode="side"` (fijo). Controla `showToggleButton`, inyectado directamente en varios componentes.
- **`GuiaComponent`**: página informativa/estática (guía de uso).

### Servicios

| Servicio | Responsabilidad | Notas |
|---|---|---|
| `AuthService` (`src/app/auth.service.ts`) | Login/logout, guarda `token` en `localStorage`, expone `isAuthenticated` como `BehaviorSubject` | POST a `/users/auth`. El `BehaviorSubject` se inicializa leyendo `localStorage.getItem('token')`, así que el estado de auth sobrevive a un reload/navegación (antes se inicializaba siempre en `false`, forzando un re-login aunque el token siguiera siendo válido) |
| `ApiService` (`src/app/api.service.ts`) | Obtener lista de usuarios | Solo tiene `getUsuarios()`; parece parcialmente redundante con otros accesos directos por `axios` desde los componentes |
| `ComponentesService` (`src/app/services/componentes.service.ts`) | Obtener catálogo de componentes (`GET /components`), expone estado `isLoading$` | Usado por `ValuacionComponent` |
| `OpenAiService` (`src/app/openai.service.ts`) | Envía prompts a la API de OpenAI (`gpt-3.5-turbo`) | La API key se obtiene en runtime desde `https://masteros.cloud/apikey` (ver [Puntos a tener en cuenta](#puntos-a-tener-en-cuenta)) |

La mayoría de componentes (`BuildsComponent`, `PartsComponent`, `HomeComponent`, etc.) llaman a la API directamente con `axios` en vez de pasar por un servicio, por lo que la URL base `https://nodemysql12.duckdns.org:443` está hardcodeada en múltiples archivos.

### Interfaces

`src/app/interfaces/componente.interface.ts` define `Componente` (id, modelo, precio, tipo, img, socket?, tienda, url, consumo?, potencia?, rams?), el modelo que refleja la tabla `componentes` del backend.

## Backend (Express + Sequelize)

Entry point: `CRUD/app3.js`.

- Levanta HTTPS (o HTTP si no hay `SSL_KEY_PATH`/`SSL_CERT_PATH` configurados y existentes, útil en local) en el puerto de `process.env.PORT` (default `443`).
- Aborta el arranque con un error claro si falta `JWT_SECRET` en el entorno, en vez de fallar de forma confusa en el primer login.
- `helmet()` para cabeceras de seguridad HTTP estándar (con `contentSecurityPolicy: false`, ya que es una API JSON pura sin vistas HTML propias).
- Configura CORS manualmente (permite todos los orígenes, headers `Authorization` incluidos).
- Al iniciar, se conecta a MySQL con reintentos (`connectWithRetry`, 10 intentos con 5s de espera fija) y sincroniza los modelos (`sequelize.sync()` — crea tablas si no existen; no usa migraciones). El pool de Sequelize (`config/db.js`, `max:10, min:0, acquire:30000, idle:10000`) permite además que una caída pasajera de MySQL no tumbe el proceso.
- Expone `GET /health` → `{ status: 'ok' }`, usado por el `HEALTHCHECK` de Docker y por el paso de verificación del deploy en CI/CD.
- Monta tres routers: `/components`, `/users`, `/configuraciones`.

### Endpoints

**`/components`** (`routes/componentRoutes.js` → `controllers/componentController.js`)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/components/` | Lista todos los componentes | Pública |
| GET | `/components/modelo/:modelo` | Búsqueda parcial (`LIKE %modelo%`) por modelo | Pública |
| GET | `/components/tipo/:tipo` | Filtra por tipo (procesador, motherboard, ram, etc.) | Pública |
| GET | `/components/:id` | Obtiene un componente por ID | Pública |
| POST | `/components/` | Crea un componente | 🔒 JWT |
| PUT | `/components/:id` | Actualiza un componente | 🔒 JWT |
| DELETE | `/components/:id` | Elimina un componente | 🔒 JWT |

Las rutas 🔒 pasan por `middleware/verifyToken.js` (verifica firma y expiración del JWT con `JWT_SECRET`, responde `401` sin token o `403` si es inválido/expiró). Las `GET` se mantienen públicas a propósito: las usan `BuildsComponent`, `ValuacionComponent` y `HomeComponent` sin login.

**`/users`** (`routes/userRoutes.js` → `controllers/userController.js`)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/users/` | Lista usuarios (sin `password`/`correo`) | Pública |
| GET | `/users/:id` | Usuario por ID (sin `password`/`correo`) | Pública |
| POST | `/users/register` | Registra usuario, hashea password con `bcrypt` (`SALT_ROUNDS`) | Rate limit |
| POST | `/users/auth` | Login: compara password con `bcrypt.compare`, devuelve JWT (`expiresIn: '1h'`) firmado con `JWT_SECRET` | Rate limit |

`/register` y `/auth` comparten un limiter (`express-rate-limit`): máximo 10 intentos cada 15 minutos por IP, para dificultar fuerza bruta de contraseñas y spam de registros.

**`/configuraciones`** (`routes/configuracionRoutes.js` → `controllers/configuracionController.js`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/configuraciones/` | Guarda una config como JSON (`jsonConfig`) + `fechaHora`, devuelve URL pública `cotizadorpc.org/builds/:id` |
| GET | `/configuraciones/:id` | Recupera y parsea una configuración guardada |
| PUT | `/configuraciones/:id` | Actualiza el `jsonConfig` de una configuración existente |

La protección de rutas en el frontend (`/parts`, `/edit`, `/register-user`, etc., vía `JwtAuthGuard`) sigue siendo solo del lado del cliente (no valida expiración/firma, solo que exista un `token`). Pero desde el backend, las escrituras en `/components` sí están protegidas por JWT real (ver tabla de arriba) — antes cualquiera podía escribir en el catálogo con `curl` sin token, ahora no.

`/configuraciones` se deja **intencionalmente pública** (sin JWT): es la feature de compartir un build armado, pensada para cualquier visitante, logueado o no.

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

1. `LoginComponent` → `AuthService.login()` → `POST /users/auth` (rate-limited) con `{ id_usuario, password }`.
2. Backend verifica con `bcrypt.compare` y firma un JWT (`{ id_usuario }`, expira en 1h) con `JWT_SECRET`.
3. Frontend guarda el token en `localStorage` bajo la key `token`; `AuthService.isAuthenticated` se inicializa leyendo ese valor, así que el estado sobrevive a un reload de página.
4. `JwtAuthGuard` (rutas del frontend) solo comprueba que `localStorage.getItem('token')` exista (no decodifica ni valida expiración/firma) — sigue siendo una guarda de UX, no de seguridad real.
5. En las llamadas que escriben en `/components` (`PartsComponent`, `EditpartsComponent`), el frontend manda el header `Authorization: Bearer <token>`.
6. El backend sí valida ese token en esas rutas (`middleware/verifyToken.js`) — es la barrera de seguridad real. El resto de rutas protegidas del frontend (`/parts`, `/edit`, `/register-user`, `/chatgpt`, `/profile`) no tienen contraparte de autorización en la API porque no exponen escritura directa sobre `/components`.

## Variables de entorno

El backend (`CRUD/.env`, no versionado) requiere:

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
DB_SSL=            # 'true' habilita SSL con rejectUnauthorized: false
MAILERSEND_API=    # presente en .env de producción pero sin uso detectado en el código actual
SALT_ROUNDS=       # rounds para bcrypt
JWT_SECRET=        # secreto para firmar/verificar JWT — el servidor no arranca si falta
PORT=              # opcional, default 443
SSL_KEY_PATH=      # ruta a la clave privada (Let's Encrypt en el VPS). Opcional: si falta o el archivo no existe, arranca en HTTP plano
SSL_CERT_PATH=     # ruta al certificado. Mismo comportamiento que SSL_KEY_PATH
```

Ver `CRUD/.env.example` para la plantilla versionada (sin secretos reales).

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

### Frontend

`npm run build` (Angular CLI) genera `dist/list-test`. Se despliega en **Vercel** (`.vercel/project.json`, Node.js 24.x), con dominio de producción `cotizadorpc.org`. El deploy es manual vía `vercel --prod` (o redeploy desde el dashboard) — no hay integración automática de git ↔ Vercel configurada en este proyecto. También puede servirse localmente de forma estática con `startServer.bat` (`lite-server` sobre `dist/list-test`, puerto 8000, UI en 8001 vía `bs-config.json`).

### Backend — Docker + CI/CD self-hosted

El backend corre **dockerizado** en el VPS (`nodemysql12.duckdns.org`, host `nodejsmysql`), reemplazando un proceso PM2 anterior:

- **`CRUD/Dockerfile`**: `node:20-alpine`, `npm ci --omit=dev`, `HEALTHCHECK` que detecta HTTP/HTTPS según haya `SSL_KEY_PATH`/`SSL_CERT_PATH`. El contenedor corre **como root** (sin `USER` no-root) porque necesita leer los certificados de Let's Encrypt (`privkey.pem`, permisos 640 root-only) — mismo nivel de privilegio que tenía el proceso PM2 anterior, no es una regresión de seguridad.
- Los certificados de Let's Encrypt se montan como bind-mounts de solo lectura, tanto `live/` (symlinks) como `archive/` (destino real de esos symlinks — hace falta montar ambos).
- `docker-compose.yml` existe en el repo como referencia pero **no se usa en producción**: el VPS no tiene el plugin `docker compose` instalado y un intento de instalarlo falló por un repositorio APT de terceros roto. El deploy real usa `docker run` directo.

**Despliegue automático** (`.github/workflows/deploy.yml`): un runner de GitHub Actions **self-hosted**, corriendo dentro del propio VPS como servicio systemd (`actions.runner.mastero101-ListTest.nodejsmysql`, usuario `ubuntu`), reemplaza el deploy manual por SSH. Mismo patrón usado en el proyecto "Proyecto Solar": el runner solo necesita salida HTTPS hacia GitHub (polling), no expone ninguna llave con permisos de ejecución de comandos.

- Se dispara con `push` a `master` que toque `CRUD/**` (o el propio workflow), o manualmente vía `workflow_dispatch`.
- Pasos: `git pull` → `docker rm -f cotizadorpc-backend || true` → `docker build` → `docker run -d --restart unless-stopped --network host --env-file .env` (con las variables `SSL_KEY_PATH`/`SSL_CERT_PATH` y los bind-mounts de certificados) → espera 10s → `docker ps` + `docker logs` + `curl -k -f https://localhost/health` como verificación.
- El runner corre como servicio (`sudo ./svc.sh install && sudo ./svc.sh start`), sobrevive reinicios y desconexiones SSH.
- El VPS es de recursos ajustados (1 vCPU / ~1GB RAM); se le agregó 1GB de swap persistente (`/etc/fstab`) para que `docker build`/`npm ci` no arriesguen quedarse sin memoria durante el deploy.

Un push que solo toque el frontend (`src/**`) no dispara este workflow ni afecta al backend.

## Puntos a tener en cuenta

Resueltos en la sesión más reciente (se dejan documentados por si el motivo de la decisión es útil más adelante):

- ~~JWT no verificado en backend~~ → ahora `POST/PUT/DELETE /components` exige JWT válido (`middleware/verifyToken.js`). `/configuraciones` se dejó pública a propósito (ver [Backend](#backend-express--sequelize)).
- ~~Sin rate limiting en login~~ → `/users/auth` y `/users/register` limitados a 10 intentos/15min por IP.
- ~~Estado de auth se perdía al recargar~~ → `AuthService.isAuthenticated` ahora se inicializa desde `localStorage`.
- ~~Sin backend dockerizado / deploy manual~~ → Docker + CI/CD self-hosted (ver [Build y despliegue](#build-y-despliegue)).
- ~~`register-user.component.ts` llamaba a `/sms` y `/send_email`, endpoints inexistentes~~ → eliminado, junto con un bug donde `window.location.reload()` corría antes que la navegación a `/login-user`, cancelándola.

Aún abiertos:

- **Endpoints hardcodeados**: la URL de la API (`https://nodemysql12.duckdns.org:443`) y del backend de API keys (`https://masteros.cloud/apikey`) están repetidas en múltiples archivos del frontend en lugar de centralizarse en `environment.ts`.
- **`OpenAiService`** obtiene la API key de OpenAI desde un endpoint externo (`masteros.cloud/apikey`) buscando el registro `id === 2` y usando su campo `username` como key — un patrón frágil y poco convencional para gestionar secretos.
- **Sin migraciones**: el esquema de base de datos se gestiona con `sequelize.sync()`, lo que puede ser riesgoso en producción ante cambios de modelo.
- **`ApiService`** parece subutilizado; la mayoría de componentes llaman a `axios` directamente en vez de centralizar las llamadas HTTP.
- **`register-user`** sigue detrás de `JwtAuthGuard` en el routing (`app-routing.module.ts`), es decir, hace falta tener ya un token para acceder a la pantalla de registro — comportamiento preexistente no tocado, posiblemente no intencional.
- **Sin tests automatizados** en ninguno de los dos proyectos (`npm test` del backend es un placeholder que siempre falla).
- Existe una carpeta `MYSQL Respaldo/23-04-2026/` sin trackear en git (ver `git status`), posiblemente un respaldo local pendiente de decidir si se versiona.
