# One-time independent-review exception for PR #3

- **Rule and scope:** The independent GitHub approval requirement is waived
  only for PR #3, which adds a downloadable Figma companion archive and setup
  documentation. Branch protection remains enabled.
- **Owner:** `@lessthanno`
- **Approver:** `@lessthanno`, through explicit repository-owner authorization
  in the active Codex release task.
- **Business justification:** This single-maintainer repository cannot satisfy
  the second-account approval gate for the time-sensitive `v0.1.0` onboarding
  fix.
- **Risk:** Author-only review can miss packaging or documentation defects.
- **Compensating controls:** The change does not alter runtime behavior or
  permissions; 22 automated tests, public-source audit, secret scanning,
  deterministic artifact checks, and a two-pass pre-landing review passed. The
  squash commit is immediately reversible.
- **Expiry:** 2026-08-02. This exception cannot be reused for another PR.
- **Removal task:** `FLMCP-dxq` adds an independent reviewer before the next
  runtime or permission-changing release.
