# Easypanel Service Checklist

Usa esta chuleta al crear el servicio en Easypanel.

## Tipo de servicio

- Source: GitHub repo
- Build type: Dockerfile
- Branch: `main`
- Dockerfile path: `./Dockerfile`

## Puerto interno

- `3000`

## Dominio

- conecta tu dominio real en Easypanel
- activa HTTPS desde Easypanel

## Variables de entorno obligatorias

```bash
LOCAL_APP_URL=http://localhost:3000
PUBLIC_APP_URL=https://tu-dominio.com
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=generate_a_long_random_secret
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
HOSTNAME=0.0.0.0
PORT=3000
```

## Variables opcionales para Google Sheets

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

## Healthcheck recomendado

- path: `/api/health`
- expected: `200 OK`

## Google OAuth

En Google Cloud Console:

- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://tu-dominio.com`
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://tu-dominio.com/api/auth/callback/google`

## Si el login falla

Revisa primero:

- `PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- redirect URI exacta en Google Cloud
