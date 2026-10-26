# Hamkharid web

Persian RTL marketplace, built with Nuxt, Vue Composition API, and TypeScript.
Independent local Git repository. Backend: sibling `../backend`.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:3000. `/api/**` is proxied server-side to Django on port 8000.
Set `API_UPSTREAM` before building to change the backend origin. This app uses
client-side rendering with Nuxt's Node server for same-origin API forwarding.

```powershell
npm.cmd run lint
npm.cmd run format:check
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview
```

The backend repository contains the shared `docs/` directory, including the setup,
API, design system, and testing guides. No hosting or remote publishing is configured.
