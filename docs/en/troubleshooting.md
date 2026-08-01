# Troubleshooting

The companion manifest is `apps/figma-plugin/manifest.json`. Import or run it
from **Plugins → Development**, then check:

```text
$layntra status
```

## Companion is not connected

Open the intended Design file, run **Layntra for Figma**, and keep the window
open. If it was already open, close and run it again, then start a new Codex
task. Do not apply a plan while status is disconnected.

## Port 3846 is in use

Inspect safely with `lsof -nP -iTCP:3846 -sTCP:LISTEN`. Do not kill an unknown
process automatically. Close a known older Layntra bridge or choose a separate
diagnostic session.

## Figma asks for Design access

An organization Dev, Collab, or View seat may block Design plugins. Switch to a
personal Starter workspace for the free path. Do not submit a potentially paid
seat request unless you intend to.

## No selection

Select the intended frame before `$layntra plan selection`, or use target
`new-frame`. Page-wide writes are unavailable.

## Context changed after planning

Layntra stopped before writing because the page or selection changed. Run
`$layntra status`, inspect again, then create a new `$layntra plan`. Do not reuse
the old plan.

## Unsupported property or invalid input

Remove the unsupported part and regenerate the plan. Layntra does not expose
deletion or arbitrary code execution in `v0.1.0`.

## Timeout or partial result

Do not retry a write automatically. Inspect the page and compare observed nodes
with the plan. If anything unexpected changed, press `Command + Z`. Create a new
plan and approve with `$layntra apply` only after status is healthy.

If import is uncertain, repeat **Plugins → Development → Import plugin from
manifest…** with `apps/figma-plugin/manifest.json`.
