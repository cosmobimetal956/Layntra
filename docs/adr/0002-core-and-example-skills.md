# ADR 0002: Separate infrastructure from example Skills

- Status: Accepted
- Date: 2026-07-30
- Owner: Maintainers

## Context

The project began as a poster assistant. Keeping poster language in the default
Skill makes the infrastructure appear narrow and can cause unrelated Figma
requests to select the wrong workflow.

## Decision

Ship one Codex plugin with:

- a general `figma-local-mcp` Skill for setup, inspection, creation, updates,
  safety, and plain-language interaction;
- an optional poster example Skill that triggers only for explicit poster or
  event requests;
- one shared local MCP bridge.

The existing plugin slug stays temporarily compatible while the public product
name becomes Figma Local MCP.

## Consequences

General users see a simple infrastructure product. Domain workflows can grow as
independent Skills without expanding the core protocol indiscriminately.

## Rollback

Remove the core Skill and restore the previous poster Skill description. The MCP
tool contract and Figma document data do not require migration.
