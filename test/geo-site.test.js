import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const baseUrl = "https://lessthanno.github.io/Layntra/";
const releaseUrl = "https://github.com/lessthanno/Layntra/releases/tag/v0.1.0";
const repositoryUrl = "https://github.com/lessthanno/Layntra";
const pages = [
  "index.html",
  "how-it-works.html",
  "figma-mcp-alternative.html",
  "faq.html",
  "about.html",
  "privacy.html",
  "terms.html"
];

function firstMatch(content, pattern, message) {
  const match = content.match(pattern);
  assert.ok(match, message);
  return match[1].trim();
}

function jsonLd(content) {
  return [...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test("GEO pages expose unique crawlable metadata and a visible product identity", async () => {
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();

  for (const page of pages) {
    const content = await readFile(path.join("docs", page), "utf8");
    assert.match(content, /<!doctype html>/i, `${page} needs an HTML doctype`);
    assert.match(content, /<html lang="en">/, `${page} needs an English language declaration`);
    assert.equal((content.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1, `${page} needs exactly one H1`);
    assert.doesNotMatch(content, /<meta[^>]+name="robots"[^>]+noindex/i, `${page} must be indexable`);
    assert.doesNotMatch(content, /<script\s+src=/i, `${page} must not depend on remote scripts`);
    assert.match(content, new RegExp(repositoryUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${page} must link to source`);
    assert.match(content, new RegExp(releaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${page} must link to the release`);

    const title = firstMatch(content, /<title>([^<]+)<\/title>/, `${page} needs a title`);
    const description = firstMatch(content, /<meta name="description" content="([^"]+)">/, `${page} needs a description`);
    const canonical = firstMatch(content, /<link rel="canonical" href="([^"]+)">/, `${page} needs a canonical URL`);
    assert.ok(title.length >= 30 && title.length <= 75, `${page} title length is ${title.length}`);
    assert.ok(description.length >= 90 && description.length <= 180, `${page} description length is ${description.length}`);
    assert.ok(canonical.startsWith(baseUrl), `${page} canonical must use the Pages origin`);
    assert.ok(!titles.has(title), `${page} title must be unique`);
    assert.ok(!descriptions.has(description), `${page} description must be unique`);
    assert.ok(!canonicals.has(canonical), `${page} canonical must be unique`);
    titles.add(title);
    descriptions.add(description);
    canonicals.add(canonical);
  }
});

test("all internal site links resolve to tracked public files", async () => {
  for (const page of pages) {
    const content = await readFile(path.join("docs", page), "utf8");
    for (const match of content.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (href.startsWith("#") || href.startsWith("mailto:")) continue;
      const resolved = new URL(href, new URL(page, baseUrl));
      if (resolved.origin !== "https://lessthanno.github.io" || !resolved.pathname.startsWith("/Layntra/")) continue;
      let relative = decodeURIComponent(resolved.pathname.slice("/Layntra/".length));
      if (!relative || relative.endsWith("/")) relative += "index.html";
      await access(path.join("docs", relative));
    }
  }
});

test("structured data describes free software and mirrors visible FAQ answers", async () => {
  const homepage = await readFile("docs/index.html", "utf8");
  const graph = jsonLd(homepage)[0]["@graph"];
  const software = graph.find((entry) => entry["@type"] === "SoftwareApplication");
  assert.equal(software.name, "Layntra");
  assert.equal(software.softwareVersion, "0.1.0");
  assert.equal(software.isAccessibleForFree, true);
  assert.equal(software.offers.price, "0");
  assert.equal(software.codeRepository, repositoryUrl);
  assert.equal(software.downloadUrl, releaseUrl);
  assert.ok(!("aggregateRating" in software), "structured data must not fabricate a rating");

  const faq = await readFile("docs/faq.html", "utf8");
  const faqData = jsonLd(faq)[0];
  assert.equal(faqData["@type"], "FAQPage");
  assert.ok(faqData.mainEntity.length >= 8);
  for (const item of faqData.mainEntity) {
    assert.match(faq, new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.ok(item.acceptedAnswer.text.length >= 50);
  }
});

test("crawler and answer-engine discovery files publish canonical facts", async () => {
  const robots = await readFile("docs/robots.txt", "utf8");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /User-agent: OAI-SearchBot/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${baseUrl}sitemap\\.xml`));

  const sitemap = await readFile("docs/sitemap.xml", "utf8");
  assert.equal((sitemap.match(/<url>/g) ?? []).length, pages.length);
  for (const page of pages) {
    const canonical = page === "index.html" ? baseUrl : `${baseUrl}${page}`;
    assert.match(sitemap, new RegExp(canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const file of ["docs/llms.txt", "docs/llms-full.txt"]) {
    const content = await readFile(file, "utf8");
    assert.match(content, /Layntra/);
    assert.match(content, /inspect, plan, apply, and undo/i);
    assert.match(content, /does not bypass Figma permissions/i);
    assert.match(content, /not affiliated with(?:, endorsed by, or sponsored by)? Figma or OpenAI/i);
    assert.match(content, new RegExp(repositoryUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(content, new RegExp(releaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(content, /guaranteed (?:indexing|ranking|citation)/i);
  }
});
