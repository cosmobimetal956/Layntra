---
name: poster-example
description: Optional editable poster workflow for Layntra. Use only when the user explicitly invokes $layntra and explicitly requests a poster, event card, speaker portrait, or event template.
---

# Layntra poster example

This is an optional example built on the core `$layntra` control policy. It must
not activate for general product design, Figma editing, or an unrelated request.

Follow the core Layntra workflow without exception:

1. Check `get_status` and inspect the explicit target.
2. Present a bounded plan and say that Figma has not changed.
3. Wait for `$layntra apply` in the same Codex task.
4. Pass the captured `expectedContext` to generic writes.
5. Re-inspect and report observed results plus `Command + Z` recovery.

Available poster tools include `list_templates`, `replace_guest_photo`,
`set_event_details`, `create_waic_template`, `create_crossborder_template`,
`place_guest_asset`, and the `redesign_crossborder_*` tools. Use them only when
the explicit request matches. Confirm local image paths exist before image work.

Never let this example redefine connection, targeting, confirmation, deletion,
or verification rules from the core Layntra Skill.
