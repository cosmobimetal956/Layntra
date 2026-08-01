import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("the public homepage ships the minimal MCP visual system", async () => {
  const [homepage, stylesheet] = await Promise.all([
    readFile("docs/index.html", "utf8"),
    readFile("docs/assets/site.css", "utf8")
  ]);

  await access("docs/assets/fonts/inter-latin.woff2");
  await access("docs/assets/figma-import-manifest-path.png");

  assert.match(homepage, /Layntra connects<br>Codex to Figma<br>through MCP/);
  assert.doesNotMatch(homepage, /data-layntra-demo/);
  assert.doesNotMatch(homepage, /feature-stack|platform-grid|final-cta/);
  assert.match(homepage, /class="shell install-layout"/);
  assert.match(homepage, /src="assets\/site\.js"/);

  assert.match(stylesheet, /font-family:\s*"Inter"/);
  assert.match(stylesheet, /--blue:\s*#82a5ff/);
  assert.match(stylesheet, /--black:\s*#000000/);
  assert.match(stylesheet, /color-scheme:\s*dark/);
  assert.doesNotMatch(stylesheet, /linear-gradient|radial-gradient/);
});

test("the homepage explains only the MCP role", async () => {
  const homepage = await readFile("docs/index.html", "utf8");

  for (const fact of ["Inspect selections", "Edit real layers", "Undo changes", "local MCP server"]) {
    assert.ok(homepage.includes(fact));
  }
  assert.match(homepage, /Codex ↔ local MCP server ↔ Figma Desktop/);
  assert.doesNotMatch(homepage, /Controlled by design|Local by default|control model|Product simulation/);
});

test("the redesigned homepage keeps the beginner conversion path", async () => {
  const homepage = await readFile("docs/index.html", "utf8");
  const release = "https://github.com/lessthanno/Layntra/releases/tag/v0.1.0";

  assert.match(homepage, new RegExp(release.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(homepage, />Install in Codex</);
  assert.match(homepage, />Import in Figma Desktop</);
  assert.match(homepage, /Plugins → Development → Import plugin from manifest/);
  assert.match(homepage, /Illustrated guide/);
});

test("the public site preserves core accessibility contracts", async () => {
  const [homepage, stylesheet] = await Promise.all([
    readFile("docs/index.html", "utf8"),
    readFile("docs/assets/site.css", "utf8")
  ]);

  assert.equal((homepage.match(/<h1\b/g) ?? []).length, 1);
  assert.match(homepage, /class="skip-link" href="#main"/);
  assert.match(homepage, /<main id="main">/);
  assert.match(stylesheet, /:focus-visible/);
  assert.match(stylesheet, /outline:\s*3px solid var\(--signal-orange\)/);
  assert.match(stylesheet, /@media \(prefers-reduced-motion:\s*reduce\)/);
});
