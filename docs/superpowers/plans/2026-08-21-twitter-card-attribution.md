# Twitter Card Attribution Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add global Twitter/X site and creator attribution to every ResumAI Twitter Card.

**Architecture:** Extend the existing centralized `seo.meta` object in `nuxt.config.ts`, keeping attribution next to the existing `twitterCard` setting. Validate the exact values with a focused source assertion, then use Nuxt type checking and ESLint for project-level verification.

**Tech Stack:** Nuxt 4, `@nuxtjs/seo`, TypeScript, ESLint, pnpm

---

## Chunk 1: Global Twitter Card metadata

### Task 1: Add Twitter account attribution

**Files:**

- Modify: `nuxt.config.ts:39`
- Reference: `docs/superpowers/specs/2026-08-21-twitter-card-attribution-design.md`

- [ ] **Step 1: Verify the required metadata is absent**

Run:

```bash
rg -n "twitter(Site|Creator)" nuxt.config.ts
```

Expected: no matches and exit status 1.

- [ ] **Step 2: Add the minimal global configuration**

Add directly after `twitterCard` in `seo.meta`:

```ts
twitterSite: '@ResumAI',
twitterCreator: '@Sanwed',
```

- [ ] **Step 3: Verify the exact source values**

Run:

```bash
rg -n "twitterSite: '@ResumAI'|twitterCreator: '@Sanwed'" nuxt.config.ts
```

Expected: exactly two matches, one for each field.

- [ ] **Step 4: Run static validation**

Run:

```bash
pnpm typecheck
pnpm lint
git diff --check
```

Expected: all commands exit successfully with no TypeScript, lint, or whitespace errors.

- [ ] **Step 5: Commit the implementation**

```bash
git add nuxt.config.ts
git commit -m "feat: add Twitter Card attribution"
```
