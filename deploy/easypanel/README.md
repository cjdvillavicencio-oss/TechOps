# Deploy en Easypanel

Este proyecto esta preparado para desplegarse en Easypanel directamente desde Git usando el `Dockerfile` del repo.

## Tipo de app recomendado

- App basada en Dockerfile
- Fuente: repositorio GitHub
- Branch: `main`

## Build

Easypanel debe construir usando:

- `Dockerfile` en la raiz

No hace falta `docker-compose` para Easypanel.

## Puerto interno

Usa:

- `3000`

La app escucha con:

- `HOSTNAME=0.0.0.0`
- `PORT=3000`

## Variables de entorno en Easypanel

Configura estas variables en el panel:

```bash
LOCAL_APP_URL=http://localhost:3000
PUBLIC_APP_URL=https://tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=generate_a_long_random_secret
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
HOSTNAME=0.0.0.0
PORT=3000
```

## Dominio y HTTPS

Easypanel puede encargarse del dominio y HTTPS delante del contenedor.

En ese caso:

- `PUBLIC_APP_URL` debe ser tu dominio real con `https://`
- `NEXTAUTH_URL` debe ser exactamente el mismo dominio real con `https://`

## Google OAuth

En Google Cloud Console usa:

- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://tu-dominio.com`
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://tu-dominio.com/api/auth/callback/google`

## Healthcheck

La imagen expone healthcheck interno y la app tiene:

- `GET /api/health`

Si quieres, en Easypanel puedes usar esa ruta para monitorizacion.

## Deploys futuros

Cada push a la rama conectada puede disparar un redeploy desde Git.

## Notas

- `OPENAI_API_KEY` nunca debe exponerse al frontend.
- No subas `.env` al repo.
- Si Google Login falla en produccion, revisa primero `NEXTAUTH_URL`, `PUBLIC_APP_URL` y los redirect URIs de Google.
