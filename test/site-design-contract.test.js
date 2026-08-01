import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("the public homepage ships the selected graphic design system", async () => {
  const [homepage, stylesheet] = await Promise.all([
    readFile("docs/index.html", "utf8"),
    readFile("docs/assets/site.css", "utf8")
  ]);

  await access("docs/assets/fonts/barlow-condensed-700.woff2");
  await access("docs/assets/fonts/inter-latin.woff2");

  assert.match(homepage, /See the write<br>before Figma<br>changes/);
  assert.match(homepage, /data-layntra-demo/);
  assert.match(homepage, /class="install-steps"/);
  assert.match(homepage, /class="figma-workspace"/);
  assert.match(homepage, /class="figma-layers"/);
  assert.match(homepage, /class="figma-inspector"/);
  assert.match(homepage, /src="assets\/site-demo\.js"/);

  assert.match(stylesheet, /font-family:\s*"Barlow Condensed"/);
  assert.match(stylesheet, /--signal-blue:\s*#1646e8/);
  assert.match(stylesheet, /--signal-yellow:\s*#ffd51e/);
  assert.match(stylesheet, /color-scheme:\s*light/);
  assert.doesNotMatch(stylesheet, /--acid:/);
});

test("the product demo exposes the controlled Figma workflow", async () => {
  const homepage = await readFile("docs/index.html", "utf8");

  for (const step of ["inspect", "plan", "apply", "undo"]) {
    assert.match(homepage, new RegExp(`data-demo-step="${step}"`));
  }

  assert.match(homepage, /data-demo-action="next"/);
  assert.match(homepage, /data-demo-action="stale"/);
  assert.match(homepage, /aria-live="polite"/);
  assert.match(homepage, /Selection changed/);
  assert.match(homepage, /Product simulation/);
});

test("the redesigned homepage keeps the beginner conversion path", async () => {
  const homepage = await readFile("docs/index.html", "utf8");
  const release = "https://github.com/lessthanno/Layntra/releases/tag/v0.1.0";

  assert.match(homepage, new RegExp(release.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(homepage, />Install in Codex</);
  assert.match(homepage, />Import the Figma companion</);
  assert.match(homepage, />Inspect your selection</);
  assert.match(homepage, />Open the illustrated install guide</);
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
