# Product manager playbook

Keep **Layntra for Figma** open from **Plugins → Development**. If it must be
re-imported, use `apps/figma-plugin/manifest.json`. Begin every workflow with:

```text
$layntra status
```

## PRD to editable wireframe

```text
$layntra plan
Target: new-frame
Build a 390 × 844 account-recovery wireframe.
Include: email entry, verification sent, invalid code, expired code, loading,
success, and offline states.
Preserve: every existing page node.
```

Review the proposed frames and copy before entering:

```text
$layntra apply
```

## Review the current selection

```text
$layntra review selection
Check information hierarchy, action priority, accessibility labels, and missing
loading, empty, permission, error, success, and offline states.
Do not modify Figma.
```

The response must say `No Figma changes made`.

## Refine without changing copy

```text
$layntra plan selection
Goal: make the login card hierarchy clearer.
Preserve: all copy, brand colors, and named layers.
Allowed: spacing, position, and size.
Do not: delete, hide, or add illustration layers.
```

Use `$layntra apply` only after the plan names the correct file, page, and
selection. If you change the selection after planning, Layntra must stop and
request a fresh plan.

## Verify and recover

Compare the plan with Layntra's post-write node counts and the visible Layers
panel. If the result is wrong or partial, return to Figma and press
`Command + Z` before making another plan.
