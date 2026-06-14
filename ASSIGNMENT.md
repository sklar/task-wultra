# React Developer Assignment

Welcome! This short take-home assignment is the basis for a technical discussion during your interview at Wultra. We want to see how you think and build, not how many features you can pack in.

## Time budget

Aim for ~2–3 hours. We are not looking for a finished product – we want a small, honest piece of code we can talk through together.

## The task

Build a tiny dashboard SPA in React that visualises a list of devices paired with a (mock) backend. The dashboard should have 3–4 pages connected via basic routing, and should display data using a mix of tables and charts.

The shape of a "device" in our world (simplified): a mobile device a user has activated against our authentication backend. It has a model, a status (active / removed / expired), an owning user, and a history of events (activation, login, signature, removal, …).

## Required features

- **Basic React app** (CRA, Vite, Next.js – your call, just be ready to defend it).
- **Routing** between 3–4 pages, for example:
  - Dashboard / overview (charts + KPIs from aggregate stats)
  - Devices list (table, sortable/filterable as you see fit)
  - Device detail (info + event timeline)
  - Users list or a Settings page
- **At least one chart** (any library is fine – Recharts, Chart.js, victory, hand-rolled SVG…).
- **At least one table** with multiple rows of data.
- **Networking**: fetch data over HTTP. You can either:
  - use our hosted mock API (see below), or
  - use any public API you like – we just want to see real network calls, loading and error states.
- **Local storage**: persist *some* user preference (e.g. table page size, theme, filters, favourite devices, last visited page – anything reasonable).
- **Visual identity** loosely inspired by [wultra.com](https://wultra.com) – dark background, our blue (`#09f`) as accent. Pixel-perfect is **not** required.
- A short **README** with a "How to run locally" section (Node version, install, start, build).

## Explicitly NOT required

- Backend, auth, SSR, Docker.
- Pixel-perfect / fully responsive design.
- Production-grade error handling, 100 % test coverage, i18n.

We would much rather see a small codebase with clear decisions than a large one full of TODOs.

## Mock API

A static REST-ish JSON API is provided at:

```
https://wultra.github.io/mtoken-tools/react-demo-api/
```

Open that URL in your browser to see the full structure, example records and live links. The basic endpoints are:

- `GET statistics.json` – aggregate stats for the overview page
- `GET devices/index.json` – paginated list of devices (also `page-1.json`, `page-2.json`, …)
- `GET devices/{deviceId}.json` – single device detail incl. event history
- `GET users/index.json` – list of users
- `GET users/{userId}.json` – user detail with their devices

> [!WARNING]
> **You don't have to use all endpoints!** Pick whichever ones make sense for the pages you build. If you would rather call a different public API (GitHub, Star Wars, weather, crypto, …) that is **completely fine**.

## AI tools

Using AI assistants (Copilot, ChatGPT, Cursor, Claude, …) is **allowed and expected**. We will, however, ask you in detail about *every* part of the code during the interview. If you cannot explain it, please don't ship it.

## Delivery

Send us either:

- a link to a Git repository (GitHub / GitLab / Bitbucket – public or private+invite), or
- a `.zip` of the project (please exclude `node_modules`).

Include a short README with:

1. Node / package manager versions you used
2. Install and start commands
3. A few sentences on the technical decisions you made and what you would do next if you had more time

## Already have something similar?

If you already have a personal, hobby, or demo project that demonstrates the same skills (networking, routing, state management, error handling) – just send that instead. There is no need to do this assignment on top of it. Don't worry about matching the Wultra colors or this exact feature set. The goal is to have real code we can discuss together, not to make you redo work you have already done.

## What happens next

The assignment is a starting point for a technical conversation, not a pass/fail test. We will sit down together, walk through your code, ask about trade-offs, alternatives, and things you might do differently. The more honest the code, the better the conversation.

Questions? Drop us a line any time before the interview.
