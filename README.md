# NOVOeia Platform

Plataforma multi-tenant NOVOeia (marketing + Super Admin / Partner / Cliente) con login HighLevel OAuth y backend Supabase.

## Ejecutar en localhost

```bash
cp .env.example .env
npm install
npm run dev
```

Abre la URL de Vite (normalmente `http://localhost:5173`).

## Deploy en Netlify

La rama de producción debe ser **`main`**.

1. Netlify → **Site configuration** → **Build & deploy** → **Continuous deployment** → **Configure**.
2. En **Production branch**, elige **`main`** y guarda.
3. En **Environment variables**, configura solo el frontend:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploys** → **Trigger deploy** → **Deploy site** (para publicar `main` de inmediato).

El archivo `netlify.toml` ya define build (`npm run build`), publish (`dist`) y Node 22.

Secrets de GHL y Stripe van en **Supabase Edge Functions**, no en Netlify.

## Login con HighLevel

1. Crea una app OAuth en el [Marketplace de HighLevel](https://marketplace.gohighlevel.com/).
2. Redirect URL debe coincidir exactamente con `GHL_REDIRECT_URI` (ej. `http://localhost:5173/`).
3. Aplica migraciones y despliega Edge Functions en Supabase.
4. Configura secrets:

```bash
supabase db push
supabase functions deploy ghl-oauth
supabase secrets set GHL_CLIENT_ID=... GHL_CLIENT_SECRET=... GHL_REDIRECT_URI=http://localhost:5173/ GHL_SCOPES="users.readonly locations.readonly companies.readonly" GHL_SUPER_ADMIN_EMAILS=tu@email.com
```

5. En `.env` del frontend pon `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Abre **Ingresar** → **Continuar con HighLevel**.

### Roles al entrar con GHL

- Email en `GHL_SUPER_ADMIN_EMAILS` → `super_admin`
- Token de tipo Company (agencia) → `partner`
- Token de tipo Location (subcuenta) → `client`

## Demo local

En login también puedes elegir rol y usar **Entrar al demo** (sin sesión real).

## Estado actual

- Marketing navegable
- Consolas Super Admin / Partner
- Schema multi-tenant + RLS
- OAuth HighLevel: authorize + callback + sesión Supabase
- Conexión de agencia desde Super Admin (requiere sesión `super_admin`)
