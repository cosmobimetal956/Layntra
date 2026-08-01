# Contributing to Layntra

Thank you for helping make controlled design automation understandable to more
people.

## Development setup

Requirements: Node.js 20+, Codex, and Figma Desktop for real E2E work.

```bash
npm install --ignore-scripts --package-lock=false
npm --prefix packages/mcp-bridge ci --ignore-scripts
npm run verify
```

## Architecture boundaries

- `skills/layntra` owns user intent, target selection, plan approval, and
  post-write reporting.
- `packages/mcp-bridge` owns schemas, limits, timeouts, correlation, and local
  transport.
- `apps/figma-plugin` owns Figma document access and stale-context enforcement.

Do not bypass `$layntra plan`, `$layntra apply`, `expectedContext`, or the
post-write read. Deletion and arbitrary code execution require a new approved
design and security review.

## Tests and documentation

Add a failing regression test before changing behavior. Run `npm run verify`
before every pull request. Changes to the user journey must update English and
Simplified Chinese together. Real tests must use a disposable personal Starter
file and must not publish local paths, account data, file IDs, or business
content.

Maintainers use `bd` for repository tasks. Contributors may open a GitHub issue
without installing `bd`.

By contributing, you agree that your work is provided under the MIT License.
