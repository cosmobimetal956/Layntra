# ADR 0003: Layntra is an explicit, controlled Codex plugin

- Status: Accepted
- Date: 2026-08-01
- Owner: Layntra maintainers

## Context

The project began as a poster assistant and later became a general local Figma
bridge. The temporary name "Figma Local MCP" describes transport, but it does
not describe the product experience for product managers and other
non-developers. Implicit activation from an ordinary prompt also gives users no
reliable signal about the active plugin, target, write boundary, or execution
state.

## Decision

The public product is **Layntra**, a Codex plugin. `Layntra for Figma` is its
required local canvas companion.

Users explicitly invoke `$layntra`. The Skill recognizes two groups of intents:

- `status`, `inspect`, `review`, and `plan` are read-only;
- `create`, `apply`, and `refine` may write only after a visible plan and an
  explicit approval in the same Codex task.

Every operation identifies one target: `selection`, read-only `page`, or
`new-frame`. New content defaults to `new-frame`; Layntra does not infer
permission for page-wide modification. A write includes the page and selection
context captured during planning. If that context changes, the Figma companion
rejects the operation and requires a new inspection. A successful write is
re-read before it is reported, and the response explains Figma `Command + Z`
recovery.

The project remains a modular monorepo with one installation entry point.
Existing MCP tool names remain compatible during the first migration. Poster
behavior stays in an optional example Skill.

## Alternatives considered

### Rename only

This is fast but preserves poster-era paths and implicit behavior. It does not
create an understandable contribution boundary or a controlled product.

### Multiple repositories

Separate core, adapter, and Skill repositories provide strict isolation but add
version coordination and installation burden before the first public release.

### Automatic natural-language activation

This appears simple but makes it unclear whether Layntra is active and whether
Codex is analyzing or modifying the document. It was rejected in favor of the
explicit `$layntra` contract.

## Consequences

- Public documentation leads with the controlled Codex workflow rather than
  MCP or WebSocket terminology.
- The Skill owns user intent and confirmation policy.
- The bridge owns schema limits, correlation, timeouts, and loopback transport.
- The Figma companion owns document access and stale-context enforcement.
- English and Simplified Chinese must cover the same first-success journey.
- Deletion and page-wide writes remain unavailable in `v0.1.0`.

## Migration

Public metadata, paths, Skills, UI, and documentation move to Layntra. Existing
users receive explicit uninstall and reinstall instructions. The Git history is
preserved in `lessthanno/Layntra`.

## Rollback

Before a public tag, revert the reorganization branch and continue using the
last verified local commit. No Figma document migration is required because the
protocol does not store project data outside the user's Figma file.
