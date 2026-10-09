# ADR-0002: Prototype first as static HTML; real app later

- Status: Accepted for the prototype phase; **superseded by ADR-0006 for the real app** (2026-10-09). The old `medmate-app.html` stays untouched until the migration is confirmed.
- Date: 2026-10-06
- Linked inputs/stories: see docs/requirements.md, docs/stories.md

## Context
The owner wants to ask for page changes and iterate until satisfied, before any real app. The repo already holds a working static, installable PWA that stores data in the browser.

## Decision
During the prototype phase: static HTML/CSS/JS, no build step, no backend, no login, data in browser storage only. Agent edits the prototype on request and shows the result. The "real app" (framework, database, sync) starts only after the owner explicitly approves the prototype, and begins with a new ADR.

## Alternatives considered
- Start the real stack now (React + backend + DB) – slows feedback, adds complexity the owner doesn't need yet.
- Design tool only (Figma) – can't test offline/install/storage behaviour.

## Consequences
Fast, cheap changes and easy hosting (e.g. GitHub Pages). No cross-device sync and no real data safety until the real app. Prototype code may be thrown away.
The prototype file is `medmate-app.html` . It is compiled output with no separate source , so it is edited in place; rebuilding as readable files would be a new ADR.
