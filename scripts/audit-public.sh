#!/usr/bin/env bash
set -euo pipefail

# Public-source audit: /Users/, email addresses, Figma file ID values,
# ai-poster-assistant, and active Figma Local MCP branding must not ship.
# Historical design records and explicit migration compatibility are allowlisted
# by exact path rather than by broad directory.

tracked_files() {
  git ls-files -z -- \
    ':(exclude).beads/**' \
    ':(exclude)scripts/audit-public.sh' \
    ':(exclude)test/public-audit.test.js' \
    ':(exclude)docs/superpowers/**' \
    ':(exclude)docs/adr/0002-core-and-example-skills.md' \
    ':(exclude)docs/adr/0003-layntra-codex-control-contract.md' \
    ':(exclude)docs/en/migration.md' \
    ':(exclude)docs/zh-CN/migration.md' \
    ':(exclude)docs/e2e-test-report.md' \
    ':(exclude)packages/mcp-bridge/server.js' \
    ':(exclude)packages/mcp-bridge/test/roundtrip.test.js'
}

scan() {
  local label="$1"
  local expression="$2"
  local matches
  matches="$(tracked_files | xargs -0 rg -n --no-heading -e "${expression}" -- 2>/dev/null || true)"
  if [ -n "${matches}" ]; then
    printf 'Public audit failed: %s\n%s\n' "${label}" "${matches}" >&2
    return 1
  fi
}

scan "absolute macOS user path" '/Users/'
scan "email address" '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
scan "disposable Figma file ID" 'eceO8ea18yfB6Ixx52mO0v|figma\.com/design/[A-Za-z0-9]+'
scan "legacy plugin slug" 'ai-poster-assistant'
scan "active legacy brand" 'Figma Local MCP'

echo "Public audit passed."
