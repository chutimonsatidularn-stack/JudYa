# ADR-0001: Record decisions as short ADRs and log owner inputs

- Status: Superseded by ADR-0003 (the inputs log part; stories and ADRs still stand)
- Date: 2026-10-06
- Linked inputs/stories: see docs/requirements.md, docs/stories.md

## Context
The owner builds with AI and doesn't code. AI sessions forget; the owner needs to see why things are the way they are.

## Decision
Keep three plain Markdown records: `docs/requirements.md` (what the owner said), `docs/stories.md` (what users need), `docs/adr/` (what we decided and why). One rules file (`AGENTS.md`) tells the agent to use them.

## Alternatives considered
- Issue tracker / wiki – more tools to learn; not needed yet.
- Many folders (requirements, specs, designs) – too heavy for now.

## Consequences
Everything lives in git and is readable by owner and agent. Revisit if stories exceed ~20 (split into one file each).
