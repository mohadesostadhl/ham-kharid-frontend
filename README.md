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

With both servers running and the fictional dataset seeded, execute
`npm.cmd run test:e2e`. The ten integration tests use installed Microsoft Edge,
cover seller/buyer/order flows and mobile accessibility, and generate an HTML report
at `playwright-report/index.html`. They create uniquely named fictional records.

The `/profile` page shows user details and, for buyers, a fake wallet top-up form
and transaction history. `/account` focuses on reservations and orders. The app bar
profile icon opens account details, a fresh wallet balance, profile/purchases links
and logout; it closes on outside interaction, Escape, or navigation. New
accounts start at zero; charge the wallet before reserving. Cancellation and failed
campaigns return the paid amount; successful campaigns create orders without another
debit. Start the backend deadline worker to finalize expired campaigns. All money
is fictional; no banking or card details are used.

The backend repository contains the shared `docs/` directory, including the setup,
API, design system, and testing guides. No hosting or remote publishing is configured.
