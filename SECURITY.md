# Security Policy

Security fixes are applied to the latest release on the default branch. Please
report suspected vulnerabilities privately through the repository host.

## Security model

- The bridge listens only on `127.0.0.1`.
- No Figma access token is requested, stored, or transmitted.
- Document changes execute inside the Figma Desktop plugin sandbox.
- Inspection depth and batch mutations are bounded.
- Arbitrary JavaScript execution and remote node deletion are not exposed.

Local processes running as the same operating-system user may be able to reach
the loopback bridge. Do not run untrusted software alongside a sensitive Figma
session.
