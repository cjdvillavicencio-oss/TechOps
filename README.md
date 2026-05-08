# TechOps AI Agents

Workspace OS con interfaz desktop orientada a agentes IA, preparado para ejecutarse en local y desplegarse en produccion desde Git.

La ruta principal de despliegue recomendada ahora es:

- **Easypanel + Dockerfile + Git**

Tambien queda base para:

- VPS propio con Docker
- VPS con PM2
- NGINX como reverse proxy

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- NextAuth con Google
- OpenAI por backend
- Google Sheets por backend

## Seguridad

- Nunca subas `.env`, secretos, tokens ni credenciales.
- Usa `.env.example` como plantilla.
- `OPENAI_API_KEY`, credenciales Google y cualquier secret deben vivir solo en variables de entorno.
- La API key de OpenAI no debe aparecer nunca en el frontend.

## Variables de entorno

Para desarrollo:

- copia `.env.example` a `.env.local`

Para produccion:

- usa variables del panel de Easypanel o `.env.production`

Variables principales:

```bash
LOCAL_APP_URL=http://localhost:3000
PUBLIC_APP_URL=https://tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=generate_a_long_random_secret
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
HOSTNAME=0.0.0.0
PORT=3000
```

## Setup local

```bash
npm install
npm run dev
```

Healthcheck local:

```bash
curl http://localhost:3000/api/health
```

## Build de produccion

```bash
npm install
npm run build
npm run start
```

## Docker

Build:

```bash
docker build -t techops-ai-agents .
```

Run:

```bash
docker run --env-file .env.production -p 3000:3000 techops-ai-agents
```

La imagen incluye:

- `EXPOSE 3000`
- `HOSTNAME=0.0.0.0`
- `HEALTHCHECK` contra `/api/health`

## Deploy recomendado: Easypanel

La guia especifica esta en:

- `deploy/easypanel/README.md`

Resumen rapido:

1. Conecta el repo GitHub en Easypanel.
2. Elige despliegue desde `Dockerfile`.
3. Usa el puerto interno `3000`.
4. Configura dominio real con HTTPS.
5. Carga todas las variables de entorno del `.env.example`.
6. Redeploy al hacer push a `main`.

## Google OAuth

En Google Cloud Console configura:

- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://tu-dominio.com`
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://tu-dominio.com/api/auth/callback/google`

## VPS con Docker o PM2

Si mas adelante prefieres no usar Easypanel:

- Docker Compose: `docker-compose.prod.yml`
- PM2: `ecosystem.config.cjs`
- NGINX host: `deploy/nginx/techops-ai-agents.conf`

## Verificaciones recomendadas

- `GET /api/health`
- Login con Google
- Callback Google en dominio real
- OpenAI funcionando solo desde backend
- Variables cargadas correctamente en produccion

## Flujo recomendado de commits

Agrupa los commits por bloques funcionales:

1. `chore: bootstrap git, env and deploy scaffolding`
2. `feat: auth and session hardening`
3. `feat: ai chat backend`
4. `feat: sheets persistence`
5. `feat: desktop agents ux`

## Notas

- Google Login debe probarse tanto en `localhost` como en dominio real.
- La app esta preparada para crecer a produccion, pero cualquier integracion nueva debe mantener la separacion cliente/servidor.
