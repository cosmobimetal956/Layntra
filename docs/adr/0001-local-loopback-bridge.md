# ADR 0001: Local loopback bridge

- Status: Accepted
- Date: 2026-07-30
- Owner: Maintainers

## Context

Creators need Codex-driven Figma editing without a hosted Figma MCP plan or a
Figma API token. Figma plugins cannot expose an MCP stdio server directly.

## Decision

Codex speaks MCP over stdio to a dependency-free Node process. The bridge
accepts WebSocket connections on `127.0.0.1` only. A hidden Figma plugin UI
relays declarative, bounded commands to the controller, where document access
occurs. Arbitrary code execution and deletion are excluded.

## Alternatives

- Hosted Figma MCP is simpler but metered and outside the local-first goal.
- The REST API requires tokens and lacks the same open-document editing loop.
- Browser automation is fragile and bypasses the supported Plugin API.

## Consequences

Figma Desktop and the plugin must remain open. A same-user local process can
attempt to reach the port, so the protocol stays least-privileged and bounded.

## Rollback

Remove the generic tool registrations while retaining poster-specific commands.
No document migration is required.
