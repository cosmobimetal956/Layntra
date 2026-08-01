import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("the public homepage ships the product-led visual system", async () => {
  const [homepage, stylesheet] = await Promise.all([
    readFile("docs/index.html", "utf8"),
    readFile("docs/assets/site.css", "utf8")
  ]);

  await access("docs/assets/fonts/inter-latin.woff2");
  await access("docs/assets/layntra-canvas-artwork.png");
  await access("docs/assets/figma-import-manifest-path.png");

  assert.match(homepage, /The local MCP plugin<br>for Codex ↔ Figma/);
  assert.doesNotMatch(homepage, /data-layntra-demo/);
  assert.doesNotMatch(homepage, /class="product-stage shell"/);
  assert.match(homepage, /class="shell install-layout"/);
  assert.match(homepage, /src="assets\/site\.js"/);

  assert.match(stylesheet, /font-family:\s*"Inter"/);
  assert.match(stylesheet, /--blue:\s*#2f66ff/);
  assert.match(stylesheet, /--black:\s*#000000/);
  assert.match(stylesheet, /color-scheme:\s*dark/);
  assert.doesNotMatch(stylesheet, /linear-gradient|radial-gradient/);
});

test("the homepage explains the controlled MCP workflow without an oversized demo", async () => {
  const homepage = await readFile("docs/index.html", "utf8");

  for (const step of ["Inspect", "Plan", "Apply + undo"]) assert.ok(homepage.includes(step));
  assert.match(homepage, /Selection changed/);
  assert.match(homepage, /Local bridge/);
  assert.doesNotMatch(homepage, /Product simulation|Codex plugin demonstration/);
});

test("the redesigned homepage keeps the beginner conversion path", async () => {
  const homepage = await readFile("docs/index.html", "utf8");
  const release = "https://github.com/lessthanno/Layntra/releases/tag/v0.1.0";

  assert.match(homepage, new RegExp(release.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(homepage, />Install in Codex</);
  assert.match(homepage, />Import the Figma companion</);
  assert.match(homepage, /Figma Desktop → Plugins → Development/);
  assert.match(homepage, /Open the illustrated install guide/);
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
