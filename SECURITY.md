# Security policy

## Supported versions

Security fixes are provided for the latest `0.1.x` release and the default
branch.

## Report privately

Use [GitHub private vulnerability reporting](https://github.com/lessthanno/Layntra/security/advisories/new).
Do not open a public issue for an unpatched vulnerability. Describe affected
versions, impact, reproduction, and suggested mitigation. Do not include real
Figma documents, access tokens, account data, or unrelated personal content.

## Trust boundary

- The bridge listens only on `127.0.0.1:3846`.
- No Figma access token is requested or stored.
- Document changes execute in the visible Figma Desktop plugin sandbox.
- Reads and writes are bounded; writes can carry a planned context snapshot.
- Deletion, remote commands, and arbitrary JavaScript execution are not exposed.

Processes running as the same operating-system user may reach loopback ports.
Do not run untrusted local software while a sensitive Figma file and Layntra
companion are open. Codex model data handling is governed by the user's Codex
configuration and is outside Layntra's local bridge boundary.
