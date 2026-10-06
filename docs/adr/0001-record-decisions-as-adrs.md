# ADR-0001: Record decisions as short ADRs and log owner inputs

- Status: Accepted
- Date: 2026-10-06
- Linked inputs/stories: I-2, I-3, I-5

## Context
The owner builds with AI and doesn't code. AI sessions forget; the owner needs to see why things are the way they are.

## Decision
Keep three plain Markdown records: `docs/inputs.md` (what the owner said), `docs/stories.md` (what users need), `docs/adr/` (what we decided and why). One rules file (`AGENTS.md`) tells the agent to use them.

## Alternatives considered
- Issue tracker / wiki – more tools to learn; not needed yet.
- Many folders (requirements, specs, designs) – too heavy for now.

## Consequences
Everything lives in git and is readable by owner and agent. Revisit if stories exceed ~20 (split into one file each).
