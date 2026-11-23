# 0021 Pause automatic deployment

## Status
Accepted. Changes the trigger described in the CI/CD section of `PLAN.md`.

## Context
Merging to `main` used to deploy to Cloudflare automatically. Releases (version bump, tag, GitHub release) should no longer go live on their own.

## Decision
`.github/workflows/deploy.yml` now has only a `workflow_dispatch` trigger instead of `push` to `main`. Everything else is unchanged: pinned actions, the protected `production` environment, `npm run check` before `wrangler deploy`, and the project-scoped token.

## Consequences
Merging to `main` no longer deploys. To deploy, start the Deploy workflow manually (Actions tab or `gh workflow run Deploy`) on `main`. To restore automatic deploys, put `push: branches: [main]` back under `on:`.
