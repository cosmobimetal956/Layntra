# Product brief: Figma Local MCP

## User and problem

Primary users are non-technical creators, students, researchers, operators, and
humanities professionals who can describe a desired design but do not know MCP,
APIs, or Figma plugin development. Hosted MCP pricing and token-based setup make
the first successful edit unnecessarily difficult.

The free path depends on a personal Figma Starter workspace. Organization users
with only Dev, Collab, or View seats cannot run plugins in Figma Design under
Figma's current seat policy.

## Outcome

A user installs once, opens a Figma file, starts one visible plugin, and asks
Codex for a design in plain language. The result remains editable in Figma.

## Non-goals for 0.2

- Full parity with every Figma Plugin API capability
- Cloud collaboration, accounts, or telemetry
- Arbitrary code execution
- Silent deletion of user work
- Replacing Figma itself

## Acceptance criteria

- Core Codex Skill contains no poster-specific assumptions.
- Poster automation remains available as an optional example Skill.
- `get_status` diagnoses bridge and Figma connection without a stack trace.
- A visible Figma window explains the three-step usage loop.
- One repository command installs the Codex plugin.
- Chinese beginner documentation covers install, daily use, recovery, privacy.
- Existing general and poster tools remain compatible.

## Success measure

At least 80% of five first-time, non-developer testers complete
install → connect → inspect → create without live developer intervention, with
median time under ten minutes.

## Ownership and operating targets

Maintainers own code, protocol, security fixes, releases, and documentation.
No remote service or stored user data exists. Local command latency should be
under two seconds for 100 ordinary nodes, excluding Figma font/image work.
Recovery point is the user's Figma undo history; recovery time target is under
one minute by reconnecting the plugin.
