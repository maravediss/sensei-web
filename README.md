# Sensei web — panel personal de Manuel

Panel Next.js 15 (App Router) para visualizar el seguimiento que Sensei guarda en `sensei.*` (Supabase self-hosted en VPS Margital).

## Stack

- Next.js 15 (standalone output)
- Tailwind v3
- Supabase JS client (schema custom `sensei`)
- Auth: passcode + cookie (sin Supabase Auth, suficiente para uso personal)

## Variables de entorno

```
SUPABASE_URL=https://supabase.margitalia.com
SUPABASE_SERVICE_ROLE_KEY=...
SENSEI_PASSCODE=manuel-sensei-2026
```

## Deploy

Docker multi-stage. Coolify en VPS Hetzner. Subdominio `sensei.margital.com` con Cloudflare.

## Páginas

- `/` Dashboard: KPIs (peso, sueño, kcal, proteína), volumen por grupo, lesiones activas, últimas sesiones
- `/historial` Listado sesiones con detalle por ID
- `/plan` Mesociclo vigente desglosado por días
- `/comida` Diario nutricional con macros vs target
- `/chat` Conversación con Sensei (lectura del log)

## Local dev

```bash
npm install
npm run dev
```
