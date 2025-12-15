# 🏗️ ARQUITECTURA COMPLETA - NEOCHUK (Instagram-like)

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Flujos de Datos](#flujos-de-datos)
4. [Componentes y Responsabilidades](#componentes-y-responsabilidades)
5. [Base de Datos](#base-de-datos)
6. [APIs](#apis)
7. [Seguridad](#seguridad)

---

## 🎯 Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                       USUARIO FINAL                              │
│                   (Navegador Web)                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Angular 21)                            │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Components, Services, State Management                   │    │
│  │ - Interfaz gráfica                                       │    │
│  │ - Autenticación (JWT)                                   │    │
│  │ - Consumo de APIs                                        │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ REST API
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND (NestJS)                                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Controllers, Services, DTOs                              │    │
│  │ - Lógica de negocio                                      │    │
│  │ - Validación de datos                                    │    │
│  │ - Autenticación y autorización                          │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────────┘
                       │ TypeORM
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Tablas: Users, Posts, Comments, Reactions, etc.         │    │
│  │ - Persistencia de datos                                  │    │
│  │ - Relaciones entre entidades                             │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
neochuk-project/
│
├── 📂 FRONTEND (Angular 21)
│   └── src/app/
│       ├── 📂 core/
│       │   ├── 📂 guards/
│       │   │   ├── auth.guard.ts           → Verifica si usuario está autenticado
│       │   │   └── role.guard.ts           → Verifica roles del usuario
│       │   │
│       │   ├── 📂 interceptors/
│       │   │   ├── auth.interceptor.ts     → Agrega JWT a todas las requests
│       │   │   ├── error.interceptor.ts    → Captura y maneja errores HTTP
│       │   │   └── loading.interceptor.ts  → Controla estado de carga global
│       │   │
│       │   ├── 📂 services/
│       │   │   ├── auth.service.ts         → Gestión de autenticación (login/logout)
│       │   │   ├── api.service.ts          → HTTP base para todas las requests
│       │   │   ├── storage.service.ts      → localStorage/sessionStorage
│       │   │   └── toast.service.ts        → Notificaciones al usuario
│       │   │
│       │   ├── 📂 models/
│       │   │   ├── user.model.ts           → Interface de Usuario
│       │   │   ├── post.model.ts           → Interface de Post
│       │   │   ├── comment.model.ts        → Interface de Comentario
│       │   │   ├── reaction.model.ts       → Interface de Reacción
│       │   │   └── notification.model.ts   → Interface de Notificación
│       │   │
│       │   └── core.module.ts              → Módulo que agrupa core
│       │
│       ├── 📂 shared/
│       │   ├── 📂 components/
│       │   │   ├── navbar/                 → Barra superior con logo y búsqueda
│       │   │   ├── sidebar/                → Menú lateral con navegación
│       │   │   ├── layout/                 → Contenedor principal (navbar + sidebar + content)
│       │   │   ├── loading-spinner/        → Spinner de carga global
│       │   │   ├── modal/                  → Modal reutilizable
│       │   │   ├── confirm-dialog/         → Diálogo de confirmación
│       │   │   ├── error-message/          → Mensaje de error reutilizable
│       │   │   └── image-upload/           → Componente para subir imágenes
│       │   │
│       │   ├── 📂 directives/
│       │   │   ├── debounce.directive.ts   → Retrasa ejecución de evento
│       │   │   ├── auto-focus.directive.ts → Auto-enfoca elementos
│       │   │   └── infinite-scroll.dir.ts  → Carga infinita al scroll
│       │   │
│       │   ├── 📂 pipes/
│       │   │   ├── time-ago.pipe.ts        → Convierte fecha a "hace 5 min"
│       │   │   ├── safe-html.pipe.ts       → Sanitiza HTML
│       │   │   └── truncate.pipe.ts        → Corta texto largo
│       │   │
│       │   └── shared.module.ts            → Módulo que agrupa shared
│       │
│       ├── 📂 features/
│       │   │
│       │   ├── 📂 auth/                    ← AUTENTICACIÓN
│       │   │   ├── pages/
│       │   │   │   ├── login/
│       │   │   │   │   ├── login.component.ts
│       │   │   │   │   ├── login.component.html
│       │   │   │   │   └── login.component.css
│       │   │   │   └── register/
│       │   │   │       ├── register.component.ts
│       │   │   │       ├── register.component.html
│       │   │   │       └── register.component.css
│       │   │   ├── services/
│       │   │   │   └── auth.service.ts     → Lógica de auth específica del módulo
│       │   │   └── auth.module.ts
│       │   │
│       │   ├── 📂 feed/                    ← FEED PRINCIPAL
│       │   │   ├── pages/
│       │   │   │   └── feed-view/
│       │   │   │       ├── feed-view.component.ts   → Carga posts, paginación
│       │   │   │       ├── feed-view.component.html
│       │   │   │       └── feed-view.component.css
│       │   │   ├── components/
│       │   │   │   └── post-item/
│       │   │   │       ├── post-item.component.ts   → Renderiza un post individual
│       │   │   │       ├── post-item.component.html
│       │   │   │       └── post-item.component.css
│       │   │   ├── services/
│       │   │   │   └── feed.service.ts     → GET /api/posts, POST /api/comments
│       │   │   └── feed.module.ts
│       │   │
│       │   ├── 📂 profile/                 ← PERFIL DE USUARIO
│       │   │   ├── pages/
│       │   │   │   ├── view-profile/
│       │   │   │   │   ├── view-profile.component.ts   → GET /api/users/:id
│       │   │   │   │   ├── view-profile.component.html
│       │   │   │   │   └── view-profile.component.css
│       │   │   │   └── edit-profile/
│       │   │   │       ├── edit-profile.component.ts   → PUT /api/users/:id
│       │   │   │       ├── edit-profile.component.html
│       │   │   │       └── edit-profile.component.css
│       │   │   ├── components/
│       │   │   │   ├── profile-header/     → Muestra info del usuario
│       │   │   │   └── posts-grid/         → Grid de posts del usuario
│       │   │   ├── services/
│       │   │   │   └── profile.service.ts  → GET/PUT /api/users
│       │   │   └── profile.module.ts
│       │   │
│       │   ├── 📂 explore/                 ← EXPLORACIÓN
│       │   │   ├── pages/
│       │   │   │   └── explore-view/
│       │   │   │       ├── explore-view.component.ts   → GET /api/posts/trending
│       │   │   │       ├── explore-view.component.html
│       │   │   │       └── explore-view.component.css
│       │   │   ├── components/
│       │   │   │   ├── search-bar/         → POST /api/users/search
│       │   │   │   ├── trending-posts/     → Muestra posts trending
│       │   │   │   └── suggested-users/    → Muestra usuarios sugeridos
│       │   │   ├── services/
│       │   │   │   └── explore.service.ts  → GET trending, search
│       │   │   └── explore.module.ts
│       │   │
│       │   ├── 📂 notifications/           ← NOTIFICACIONES
│       │   │   ├── pages/
│       │   │   │   └── notifications-view/
│       │   │   │       ├── notifications-view.component.ts  → GET /api/notifications
│       │   │   │       ├── notifications-view.component.html
│       │   │   │       └── notifications-view.component.css
│       │   │   ├── components/
│       │   │   │   └── notification-item/  → Renderiza notificación
│       │   │   ├── services/
│       │   │   │   └── notification.service.ts → GET/DELETE /api/notifications
│       │   │   └── notifications.module.ts
│       │   │
│       │   ├── 📂 saved/                   ← POSTS GUARDADOS
│       │   │   ├── pages/
│       │   │   │   └── saved-view/
│       │   │   │       ├── saved-view.component.ts   → GET /api/users/saved-posts
│       │   │   │       ├── saved-view.component.html
│       │   │   │       └── saved-view.component.css
│       │   │   ├── components/
│       │   │   │   └── saved-post-item/   → Renderiza post guardado
│       │   │   ├── services/
│       │   │   │   └── saved.service.ts    → GET/POST/DELETE saved posts
│       │   │   └── saved.module.ts
│       │   │
│       │   ├── 📂 upload/                  ← CREAR POST
│       │   │   ├── pages/
│       │   │   │   └── upload-post/
│       │   │   │       ├── upload-post.component.ts   → POST /api/posts
│       │   │   │       ├── upload-post.component.html
│       │   │   │       └── upload-post.component.css
│       │   │   ├── components/
│       │   │   │   └── image-preview/      → Vista previa de imagen
│       │   │   ├── services/
│       │   │   │   └── upload.service.ts   → POST /api/posts (con FormData)
│       │   │   └── upload.module.ts
│       │   │
│       │   └── 📂 messages/                ← MENSAJERÍA (OPCIONAL)
│       │       ├── pages/
│       │       │   └── messages-view/
│       │       ├── components/
│       │       │   ├── chat-list/
│       │       │   └── chat-window/
│       │       ├── services/
│       │       │   └── message.service.ts
│       │       └── messages.module.ts
│       │
│       ├── 📂 state/                       ← STATE MANAGEMENT (NgRx - OPCIONAL)
│       │   ├── 📂 auth/
│       │   │   ├── auth.actions.ts         → Acciones: login, logout, refresh
│       │   │   ├── auth.reducer.ts         → Reducer que actualiza estado
│       │   │   ├── auth.effects.ts         → Side effects: llamadas HTTP
│       │   │   └── auth.selectors.ts       → Selectores para leer estado
│       │   │
│       │   ├── 📂 post/
│       │   │   ├── post.actions.ts
│       │   │   ├── post.reducer.ts
│       │   │   ├── post.effects.ts
│       │   │   └── post.selectors.ts
│       │   │
│       │   └── app.state.ts                → Estado global
│       │
│       ├── app-routing.module.ts           → Rutas principales
│       ├── app.module.ts                   → Módulo raíz
│       └── app.component.ts                → Componente raíz
│
│
├── 📂 BACKEND (NestJS)
│   └── src/
│       ├── 📂 auth/                        ← AUTENTICACIÓN
│       │   ├── auth.controller.ts          → POST /auth/login, /auth/register
│       │   ├── auth.service.ts             → Lógica de login/register
│       │   ├── auth.module.ts              → Agrupa auth
│       │   ├── 📂 dto/
│       │   │   ├── login.dto.ts            → { email, password }
│       │   │   └── register.dto.ts         → { email, username, password }
│       │   ├── 📂 strategies/
│       │   │   └── jwt.strategy.ts         → Valida JWT en requests
│       │   └── 📂 guards/
│       │       └── jwt.guard.ts            → @UseGuards(JwtAuthGuard)
│       │
│       ├── 📂 users/                       ← GESTIÓN DE USUARIOS
│       │   ├── users.controller.ts         → GET /users/:id, PUT /users/:id
│       │   ├── users.service.ts            → CRUD de usuarios
│       │   ├── users.module.ts
│       │   ├── 📂 entities/
│       │   │   └── user.entity.ts          → Tabla Users en BD
│       │   └── 📂 dto/
│       │       ├── create-user.dto.ts
│       │       └── update-user.dto.ts
│       │
│       ├── 📂 posts/                       ← GESTIÓN DE POSTS
│       │   ├── posts.controller.ts         → GET/POST /posts, DELETE /posts/:id
│       │   ├── posts.service.ts            → CRUD de posts
│       │   ├── posts.module.ts
│       │   ├── 📂 entities/
│       │   │   └── post.entity.ts          → Tabla Posts en BD
│       │   └── 📂 dto/
│       │       ├── create-post.dto.ts      → { caption, image, userId }
│       │       └── update-post.dto.ts
│       │
│       ├── 📂 comments/                    ← GESTIÓN DE COMENTARIOS
│       │   ├── comments.controller.ts      → GET/POST /posts/:id/comments
│       │   ├── comments.service.ts         → CRUD de comentarios
│       │   ├── comments.module.ts
│       │   ├── 📂 entities/
│       │   │   └── comment.entity.ts       → Tabla Comments en BD
│       │   └── 📂 dto/
│       │       └── create-comment.dto.ts
│       │
│       ├── 📂 reactions/                   ← SISTEMA DE REACCIONES
│       │   ├── reactions.controller.ts     → POST /posts/:id/reactions
│       │   ├── reactions.service.ts        → CRUD de reacciones
│       │   ├── reactions.module.ts
│       │   ├── 📂 entities/
│       │   │   └── reaction.entity.ts      → Tabla Reactions en BD
│       │   └── 📂 dto/
│       │       └── create-reaction.dto.ts
│       │
│       ├── 📂 follows/                     ← SISTEMA DE SEGUIMIENTOS
│       │   ├── follows.controller.ts       → POST /users/:id/follow
│       │   ├── follows.service.ts          → Lógica de follow/unfollow
│       │   ├── follows.module.ts
│       │   ├── 📂 entities/
│       │   │   └── follow.entity.ts        → Tabla Follows en BD
│       │   └── 📂 dto/
│       │       └── create-follow.dto.ts
│       │
│       ├── 📂 saved-posts/                 ← POSTS GUARDADOS
│       │   ├── saved-posts.controller.ts   → GET/POST /users/:id/saved-posts
│       │   ├── saved-posts.service.ts
│       │   ├── saved-posts.module.ts
│       │   ├── 📂 entities/
│       │   │   └── saved-post.entity.ts    → Tabla SavedPosts en BD
│       │   └── 📂 dto/
│       │       └── create-saved-post.dto.ts
│       │
│       ├── 📂 notifications/               ← NOTIFICACIONES
│       │   ├── notifications.controller.ts → GET /notifications
│       │   ├── notifications.service.ts    → CRUD y generación de notificaciones
│       │   ├── notifications.module.ts
│       │   ├── 📂 entities/
│       │   │   └── notification.entity.ts  → Tabla Notifications en BD
│       │   └── 📂 dto/
│       │       └── create-notification.dto.ts
│       │
│       ├── 📂 uploads/                     ← GESTIÓN DE ARCHIVOS
│       │   ├── uploads.controller.ts       → POST /uploads
│       │   ├── uploads.service.ts          → Subir a Cloudinary/AWS
│       │   ├── uploads.module.ts
│       │   └── 📂 dto/
│       │       └── upload.dto.ts
│       │
│       ├── 📂 database/                    ← CONFIGURACIÓN DE BD
│       │   ├── database.module.ts          → Configura TypeORM
│       │   ├── typeorm.config.ts
│       │   └── 📂 migrations/
│       │       ├── 001-create-users.ts
│       │       ├── 002-create-posts.ts
│       │       └── ...
│       │
│       ├── 📂 common/                      ← CÓDIGO COMPARTIDO
│       │   ├── 📂 decorators/
│       │   │   ├── public.decorator.ts     → @Public() - sin autenticación
│       │   │   ├── current-user.decorator.ts
│       │   │   └── roles.decorator.ts
│       │   ├── 📂 interceptors/
│       │   │   └── transform.interceptor.ts → Transforma respuestas
│       │   ├── 📂 filters/
│       │   │   └── http-exception.filter.ts → Maneja excepciones HTTP
│       │   ├── 📂 pipes/
│       │   │   └── validation.pipe.ts      → Valida DTOs
│       │   └── 📂 utils/
│       │       ├── hash.util.ts            → Hash de contraseñas
│       │       └── jwt.util.ts             → Generación de JWT
│       │
│       ├── app.module.ts                   → Módulo raíz (importa todos)
│       └── main.ts                         → Punto de entrada
│
│
├── 📂 DATABASE (PostgreSQL)
│   ├── 🗄️ users
│   │   ├── id (UUID)
│   │   ├── email (unique)
│   │   ├── username (unique)
│   │   ├── passwordHash
│   │   ├── profileImage
│   │   ├── bio
│   │   ├── followers (count)
│   │   ├── following (count)
│   │   └── createdAt, updatedAt
│   │
│   ├── 🗄️ posts
│   │   ├── id (UUID)
│   │   ├── userId (FK → users)
│   │   ├── caption (text)
│   │   ├── image (URL)
│   │   ├── likesCount
│   │   ├── createdAt, updatedAt
│   │   └── Relaciones:
│   │       ├── comments (1:N)
│   │       ├── reactions (1:N)
│   │       └── savedBy (N:M)
│   │
│   ├── 🗄️ comments
│   │   ├── id (UUID)
│   │   ├── postId (FK → posts)
│   │   ├── userId (FK → users)
│   │   ├── text (varchar)
│   │   └── createdAt
│   │
│   ├── 🗄️ reactions
│   │   ├── id (UUID)
│   │   ├── postId (FK → posts)
│   │   ├── userId (FK → users)
│   │   ├── type (enum: like, love, wow, sad, angry)
│   │   └── createdAt
│   │
│   ├── 🗄️ follows
│   │   ├── id (UUID)
│   │   ├── followerId (FK → users)
│   │   ├── followingId (FK → users)
│   │   └── createdAt
│   │
│   ├── 🗄️ saved_posts
│   │   ├── id (UUID)
│   │   ├── userId (FK → users)
│   │   ├── postId (FK → posts)
│   │   └── createdAt
│   │
│   └── 🗄️ notifications
│       ├── id (UUID)
│       ├── userId (FK → users)
│       ├── fromUserId (FK → users)
│       ├── type (enum: like, comment, follow, reaction)
│       ├── postId (FK → posts, nullable)
│       ├── read (boolean)
│       └── createdAt
│
│
├── docker-compose.yml                      → Levanta PostgreSQL en Docker
├── .env                                    → Variables de entorno
├── .gitignore
├── README.md
└── ARCHITECTURE.md                         ← Este archivo
```

---

## 🔄 Flujos de Datos

### 1️⃣ FLUJO DE REGISTRO

```
FRONTEND (Angular)
├── Usuario ingresa: email, username, password
├── LoginComponent → authService.register()
│
└─→ POST /api/auth/register
    │
    BACKEND (NestJS)
    ├── AuthController recibe request
    ├── AuthService.register()
    │   ├── Valida email único (no existe en BD)
    │   ├── Valida username único
    │   ├── Hash de contraseña (bcrypt)
    │   └── Guarda usuario en BD
    │
    ├── Genera JWT token
    └─→ Response: { access_token, user }
        │
        FRONTEND
        ├── Guarda token en localStorage
        ├── Redirige a /feed
        └── Muestra toast "Registro exitoso"
```

### 2️⃣ FLUJO DE LOGIN

```
FRONTEND (Angular)
├── Usuario ingresa: email, password
├── LoginComponent → authService.login()
│
└─→ POST /api/auth/login
    │
    BACKEND (NestJS)
    ├── AuthController recibe request
    ├── AuthService.login()
    │   ├── Busca usuario por email
    │   ├── Compara password con hash
    │   └── Si válido: genera JWT
    │
    └─→ Response: { access_token, user }
        │
        FRONTEND
        ├── authInterceptor agrega JWT en header
        ├── Guarda token en localStorage
        ├── Redirige a /feed
        └── Muestra toast "Bienvenido"
```

### 3️⃣ FLUJO DE CREAR POST

```
FRONTEND (Angular)
├── Usuario en UploadPostComponent
├── Selecciona imagen
│   └─→ Previsualización en el cliente
├── Ingresa caption
├── Click en "Publicar"
│
└─→ POST /api/posts (multipart/form-data)
    Header: Authorization: Bearer {JWT}
    Body: { caption, image (file), userId }
    │
    BACKEND (NestJS)
    ├── JwtGuard valida token
    ├── PostsController.create()
    ├── PostsService.create()
    │   ├── Valida datos con DTO
    │   ├── Sube imagen a Cloudinary/AWS
    │   ├── Guarda post en BD
    │   └── Crea notificación para seguidores (opcional)
    │
    └─→ Response: { post: Post }
        │
        FRONTEND
        ├── UploadPostComponent recibe respuesta
        ├── Limpia formulario
        ├── Redirige a /feed
        ├── FeedViewComponent recarga posts
        └── Muestra toast "Post publicado"
```

### 4️⃣ FLUJO DE VER FEED

```
FRONTEND (Angular)
├── Usuario entra a /feed
├── FeedViewComponent.ngOnInit()
│   └─→ feedService.getPosts()
│
└─→ GET /api/posts?page=1&limit=10
    Header: Authorization: Bearer {JWT}
    │
    BACKEND (NestJS)
    ├── JwtGuard valida token
    ├── PostsController.findAll()
    ├── PostsService.findAll()
    │   ├── Consulta BD: SELECT * FROM posts
    │   ├── Pagina resultados
    │   ├── Para cada post, carga:
    │   │   ├── Usuario (author)
    │   │   ├── Comentarios
    │   │   ├── Reacciones
    │   │   └── Si usuario actual guardó el post
    │   └── Ordena por createdAt DESC
    │
    └─→ Response: { posts: Post[], total: number }
        │
        FRONTEND
        ├── FeedViewComponent recibe posts
        ├── Detecta cambios (ChangeDetectorRef)
        ├── Renderiza PostItemComponent para cada post
        └── Usuario ve feed con todos los posts
```

### 5️⃣ FLUJO DE REACCIONAR A UN POST

```
FRONTEND (Angular)
├── Usuario hace hover en post
├── Aparece selector de reacciones (5 emojis)
├── Usuario selecciona emoji (ej: ❤️ love)
├── PostItemComponent → postService.addReaction()
│
└─→ POST /api/posts/:postId/reactions
    Header: Authorization: Bearer {JWT}
    Body: { type: 'love', userId: currentUserId }
    │
    BACKEND (NestJS)
    ├── JwtGuard valida token
    ├── ReactionsController.create()
    ├── ReactionsService.create()
    │   ├── Verifica si usuario ya reaccionó
    │   ├── Si sí: actualiza tipo de reacción
    │   ├── Si no: crea nueva reacción
    │   ├── Guarda en BD tabla Reactions
    │   ├── Crea notificación para autor del post
    │   └── Retorna post actualizado
    │
    └─→ Response: { post: Post con reactions actualizado }
        │
        FRONTEND
        ├── PostItemComponent actualiza UI
        ├── Muestra emoji seleccionado
        ├── Actualiza contador de reacciones
        └── Usuario ve cambio inmediato
```

### 6️⃣ FLUJO DE SEGUIR A USUARIO

```
FRONTEND (Angular)
├── Usuario en perfil de otro usuario
├── Click en botón "Seguir"
├── ProfileComponent → profileService.followUser()
│
└─→ POST /api/users/:userId/follow
    Header: Authorization: Bearer {JWT}
    │
    BACKEND (NestJS)
    ├── JwtGuard valida token
    ├── FollowsController.create()
    ├── FollowsService.follow()
    │   ├── Verifica que no sea seguidor ya
    │   ├── Crea registro en tabla Follows
    │   ├── Actualiza contadores:
    │   │   ├── followers del usuario (target) += 1
    │   │   ├── following del usuario (actual) += 1
    │   ├── Crea notificación "X te está siguiendo"
    │   └── Retorna { follow: Follow }
    │
    └─→ Response: { success: true }
        │
        FRONTEND
        ├── ProfileComponent actualiza UI
        ├── Botón cambia a "Siguiendo"
        ├── Contador de followers +1
        └── Usuario vê cambio inmediato
```

### 7️⃣ FLUJO DE NOTIFICACIONES

```
BACKEND (NestJS)
Continuamente escuchando eventos:
├── Alguien reacciona a un post
├── Alguien comenta en un post
├── Alguien te sigue
│
└─→ NotificationsService crea entrada en BD
    │
    └─→ Response con notificación creada

FRONTEND (Angular)
├── NotificationsComponent.ngOnInit()
│   └─→ notificationService.getNotifications()
│
└─→ GET /api/notifications
    Header: Authorization: Bearer {JWT}
    │
    BACKEND
    ├── NotificationsController.findAll()
    ├── NotificationsService.findAll()
    │   ├── SELECT * FROM notifications WHERE userId = current
    │   ├── Ordena por createdAt DESC
    │   └── Carga datos del usuario que originó notificación
    │
    └─→ Response: { notifications: Notification[] }
        │
        FRONTEND
        ├── NotificationsViewComponent muestra lista
        ├── Agrupa por tipo (likes, comments, follows)
        ├── Muestra avatar del usuario que interactuó
        └── Usuario puede marcar como leído o eliminar
```

---

## 🎯 Componentes y Responsabilidades

### FRONTEND - COMPONENTES

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|-----------------|
| **AuthComponent** | features/auth/pages/ | Formulario de login/registro |
| **FeedViewComponent** | features/feed/pages/ | Carga y lista de posts |
| **PostItemComponent** | features/feed/components/ | Renderiza un post individual |
| **ViewProfileComponent** | features/profile/pages/ | Muestra perfil de usuario |
| **EditProfileComponent** | features/profile/pages/ | Edita datos del usuario |
| **ExploreViewComponent** | features/explore/pages/ | Posts trending y búsqueda |
| **NotificationsViewComponent** | features/notifications/pages/ | Lista de notificaciones |
| **SavedViewComponent** | features/saved/pages/ | Posts guardados del usuario |
| **UploadPostComponent** | features/upload/pages/ | Crear nuevo post |
| **NavbarComponent** | shared/components/ | Barra superior (logo, búsqueda) |
| **SidebarComponent** | shared/components/ | Menú lateral |
| **LayoutComponent** | shared/components/ | Contenedor (navbar + sidebar + content) |

### BACKEND - SERVICIOS

| Servicio | Ubicación | Responsabilidad |
|----------|-----------|-----------------|
| **AuthService** | auth/ | Lógica de registro, login, JWT |
| **UsersService** | users/ | CRUD de usuarios |
| **PostsService** | posts/ | CRUD de posts |
| **CommentsService** | comments/ | CRUD de comentarios |
| **ReactionsService** | reactions/ | CRUD de reacciones |
| **FollowsService** | follows/ | Lógica de seguimientos |
| **SavedPostsService** | saved-posts/ | Guardar/desguardar posts |
| **NotificationsService** | notifications/ | Crear/obtener notificaciones |
| **UploadsService** | uploads/ | Subir archivos a cloud |

---

## 🗄️ Base de Datos

### Tabla: Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  profile_image VARCHAR,
  bio TEXT,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: Posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  caption TEXT NOT NULL,
  image VARCHAR NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: Comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  text VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: Reactions
```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL, -- 'like', 'love', 'wow', 'sad', 'angry'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Un usuario, una reacción por post
);
```

### Tabla: Follows
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### Tabla: Saved Posts
```sql
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

### Tabla: Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  from_user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL, -- 'like', 'comment', 'follow', 'reaction'
  post_id UUID REFERENCES posts(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 APIs

### Authentication

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **POST** | `/api/auth/register` | { email, username, password } | { access_token, user } | ❌ No |
| **POST** | `/api/auth/login` | { email, password } | { access_token, user } | ❌ No |
| **POST** | `/api/auth/logout` | - | { success } | ✅ Sí |
| **GET** | `/api/auth/me` | - | { user } | ✅ Sí |

### Users

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/users/:id` | - | { user } | ✅ Sí |
| **PUT** | `/api/users/:id` | { bio, profileImage } | { user } | ✅ Sí |
| **GET** | `/api/users/search` | - | { users } | ✅ Sí |

### Posts

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/posts` | page, limit | { posts, total } | ✅ Sí |
| **GET** | `/api/posts/:id` | - | { post } | ✅ Sí |
| **POST** | `/api/posts` | { caption, image } | { post } | ✅ Sí |
| **DELETE** | `/api/posts/:id` | - | { success } | ✅ Sí |
| **GET** | `/api/posts/trending` | - | { posts } | ✅ Sí |

### Comments

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/posts/:id/comments` | - | { comments } | ✅ Sí |
| **POST** | `/api/posts/:id/comments` | { text } | { comment } | ✅ Sí |
| **DELETE** | `/api/comments/:id` | - | { success } | ✅ Sí |

### Reactions

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/posts/:id/reactions` | - | { reactions } | ✅ Sí |
| **POST** | `/api/posts/:id/reactions` | { type } | { reaction } | ✅ Sí |
| **DELETE** | `/api/posts/:id/reactions` | - | { success } | ✅ Sí |

### Follows

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **POST** | `/api/users/:id/follow` | - | { follow } | ✅ Sí |
| **DELETE** | `/api/users/:id/follow` | - | { success } | ✅ Sí |
| **GET** | `/api/users/:id/followers` | - | { users } | ✅ Sí |
| **GET** | `/api/users/:id/following` | - | { users } | ✅ Sí |

### Saved Posts

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/users/saved-posts` | - | { posts } | ✅ Sí |
| **POST** | `/api/posts/:id/save` | - | { save } | ✅ Sí |
| **DELETE** | `/api/posts/:id/save` | - | { success } | ✅ Sí |

### Notifications

| Método | Endpoint | Req Body | Response | Autenticación |
|--------|----------|----------|----------|---------------|
| **GET** | `/api/notifications` | - | { notifications } | ✅ Sí |
| **PUT** | `/api/notifications/:id/read` | - | { notification } | ✅ Sí |
| **DELETE** | `/api/notifications/:id` | - | { success } | ✅ Sí |

---

## 🔒 Seguridad

### JWT (JSON Web Tokens)

```
1. Usuario se autentica (login/register)
2. Backend crea JWT: 
   header.payload.signature
   
3. Frontend guarda en localStorage
4. Cada request incluye: Authorization: Bearer <token>

5. Backend valida token:
   ├── Verifica firma (no fue modificado)
   ├── Verifica expiración
   ├── Extrae userId
   └── Permitir acceso si todo es válido
```

### Protección de Endpoints

```
PUBLIC (sin JWT):
├── POST /auth/register
├── POST /auth/login
└── GET /posts (para visitantes)

PRIVATE (con JWT):
├── GET /api/posts
├── POST /api/posts
├── GET /api/users/:id
├── POST /api/users/:id/follow
├── POST /api/posts/:id/reactions
├── GET /api/notifications
└── ... (todas las demás)
```

### Validación de Datos (DTOs)

```typescript
// Login DTO - Valida que existan email y password
LoginDto {
  @IsEmail() email: string;
  @MinLength(6) password: string;
}

// Create Post DTO - Valida caption e imagen
CreatePostDto {
  @IsNotEmpty() caption: string;
  @IsUrl() image: string;
}
```

### Manejo de Errores

```
Request inválido
  ↓
ValidationPipe (DTOs)
  ├─ Si inválido: Error 400
  └─ Si válido: Continua

Endpoint requiere autenticación
  ↓
JwtGuard
  ├─ Si sin token: Error 401
  ├─ Si token inválido: Error 401
  └─ Si válido: Continua

Usuario no es propietario del recurso
  ↓
Guardias de autorización
  ├─ Si sin permisos: Error 403
  └─ Si tiene permisos: Continua
```

---

## 📊 Resumen de Flujos

```
┌─────────────────────────────────────────────────────────────┐
│               USUARIO EN LA PLATAFORMA                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    REGISTRARSE  INICIAR SESIÓN  VER FEED
         │           │           │
         └───────────┼───────────┘
                     ↓
              USUARIO AUTENTICADO
                     │
         ┌───────────┼───────────────────────┐
         ↓           ↓           ↓           ↓           ↓
      VER FEED    CREAR POST  VER PERFIL  EXPLORAR  NOTIFICACIONES
         │           │           │           │           │
         ├─ Like      ├─ Upload   ├─ Follow  ├─ Buscar   ├─ Marcar leído
         ├─ React     ├─ Caption  ├─ Edit    ├─ Trending └─ Eliminar
         ├─ Comment   └─ Publicar └─ Posts   └─ Sugerencias
         ├─ Save
         └─ Follow usuario
```

---

## 🚀 Próximos Pasos

1. **Backend NestJS + PostgreSQL**
2. **Migración Frontend a estructura modular**
3. **Integración APIs Frontend-Backend**
4. **Testing (Jest)**
5. **Deployment (Docker, Vercel, Heroku)**

