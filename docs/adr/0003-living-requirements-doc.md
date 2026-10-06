# ADR-0003: Keep one living requirements document instead of an inputs log

- Status: Accepted
- Date: 2026-10-06
- Linked inputs/stories: docs/requirements.md

## Context
`docs/inputs.md` was a dated record of everything the owner said. The owner found it impractical: it reads like chat history, and the current truth about the app is hard to see.

## Decision
Replace it with `docs/requirements.md`: a living spec grouped by Product, Users, Logic, UI, UX, suggestions and open questions. The agent updates it on every owner input about those topics, editing lines in place and deleting what is no longer true. History lives in git; major decisions in ADRs.

## Alternatives considered
- Keep the log and add a summary on top – two things to keep in sync.
- Put requirements only into stories – UI/UX details don't fit the story format.

## Consequences
Always one place to see what the app should be. Old wording is only in git history, so reasons for big changes must go into an ADR.
