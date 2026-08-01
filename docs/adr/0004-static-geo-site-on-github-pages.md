# ADR 0004: Publish a static GEO site from `main/docs`

- Status: Accepted
- Date: 2026-08-01

## Context

Layntra needs a stable, crawlable public identity beyond a repository README. The
site must answer product, installation, trust, permission, and comparison
questions in content that search engines and answer engines can fetch without
running client-side JavaScript. The project has no hosted application, account
system, analytics service, or web runtime.

## Decision

Publish a dependency-free static site from the `docs` directory on the protected
`main` branch using GitHub Pages branch deployment.

The site will use hand-authored semantic HTML and one local CSS file. It will
publish canonical metadata, visible factual answers, Schema.org JSON-LD,
`robots.txt`, `sitemap.xml`, `llms.txt`, and `llms-full.txt`. Automated contract
tests will verify metadata, internal links, crawl files, structured data, and
the absence of remote scripts.

The content may compare Layntra with common hosted integration patterns, but it
must not claim guaranteed indexing, affiliation with Figma or OpenAI, or a
capability to bypass Figma permissions.

## Consequences

- Search and answer engines can fetch meaningful content from first response
  HTML, even when scripting is unavailable.
- The deployment adds no JavaScript dependency, package supply chain, analytics,
  cookies, database, or hosted Layntra service.
- Existing Markdown guides remain in `docs` and can still be linked from GitHub.
- Shared header and footer markup is duplicated across the small static site;
  tests reduce drift, and a generator can be considered if page count grows.
- Discovery and citation are more likely but cannot be guaranteed by Layntra.
