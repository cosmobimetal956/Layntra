# One-time independent-review exception for PR #4

- **Rule and scope:** The independent GitHub approval requirement is waived
  only for PR #4, which publishes a dependency-free static discovery website,
  crawl metadata, and corresponding documentation tests. Branch protection
  remains enabled. This exception does not cover product runtime code, bridge
  permissions, Figma write behavior, release artifacts, or later pull requests.
- **Owner:** `@lessthanno`
- **Approver:** `@lessthanno`, through explicit repository-owner authorization
  in the active Codex GEO publication task.
- **Business justification:** This single-maintainer repository cannot satisfy
  the second-account approval gate, while a stable public site is required for
  Layntra discovery and correct public explanation of its Figma boundaries.
- **Risk:** Author-only review can miss incorrect claims, broken crawl metadata,
  accessibility defects, or static-site deployment errors.
- **Compensating controls:** The change adds no runtime JavaScript, analytics,
  cookies, database, hosted Layntra service, Figma permissions, or product write
  capability. Twenty-six automated tests, metadata and internal-link contracts,
  public-source audit, secret scanning, Sitemap XML validation, desktop and
  390-pixel mobile browser inspection, contrast measurement, and a two-pass
  pre-landing review are required. The merge commit is immediately reversible.
- **Expiry:** 2026-08-02. This exception cannot be reused for another PR.
- **Removal task:** `FLMCP-dxq` adds an independent reviewer before any future
  runtime, permission-changing, release-artifact, or hosted-service change.
