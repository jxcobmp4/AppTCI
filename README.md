# Encuentro

App interna para registrar el trabajo de evangelización callejera de tu equipo de iglesia.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Supabase · MapLibre · MapTiler
- **Idioma:** Español
- **Diseño:** Mobile-first, PWA instalable

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena tus claves de Supabase y MapTiler
npm run dev
```

Abrir <http://localhost:3000> → redirige a `/inicio`.

## Estado del proyecto

| Fase | Estado |
|---|---|
| 1 · Análisis y arquitectura | ✅ |
| 2 · Sistema de diseño + layout | ✅ esqueleto listo |
| 3 · Autenticación (Supabase) | ⏳ pendiente |
| 4 · Dashboard con datos reales | ⏳ |
| 5 · Registro de contactos + offline | ⏳ |
| 6 · Mapa (MapLibre) | ⏳ |
| 7 · Ficha de persona y seguimiento | ⏳ |
| 8 · Estadísticas | ⏳ |
| 9 · Endurecer permisos (RLS) | ⏳ |
| 10 · PWA + optimización | ⏳ |

## Estructura

```
src/
├── app/
│   ├── (auth)/login/          # login (placeholder)
│   ├── (app)/                  # layout con nav inferior
│   │   ├── inicio/
│   │   ├── mapa/
│   │   ├── personas/
│   │   ├── estadisticas/
│   │   └── perfil/
│   ├── layout.tsx
│   ├── page.tsx                # redirect → /inicio
│   └── globals.css             # tokens Tailwind 4
├── components/
│   ├── nav/BottomNav.tsx
│   └── ui/                     # FabRegistrar, StatCard, StatusBadge
└── lib/
    └── utils.ts
supabase/migrations/            # SQL (Fase 3)
```

## Decisiones de producto

- **Ubicación difusa:** al registrar un contacto, la coordenada se desplaza ~30–120 m. La coordenada exacta solo es visible para el creador y para admins. Ver `src/lib/geo/fuzz.ts` (Fase 5).
- **Offline-first:** el registro de contactos funciona sin señal y se sincroniza al recuperar red (Dexie, Fase 5).
- **Roles:** `admin` · `leader` · `member`. Autorización enforced por Row-Level Security en Postgres (Fase 9).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run typecheck` — TypeScript sin emitir
- `npm run lint` — ESLint
