# 0006. Disable npm lifecycle scripts

Date: 2026-11-19 · Status: accepted

## Context
Install-time scripts are the most common supply-chain attack vector.

## Decision
`.npmrc` sets `ignore-scripts=true`, `save-exact=true` and `engine-strict=true`; installs use `npm ci`. No dependency currently needs a rebuild step.

## Consequences
If a future dependency needs a postinstall build, document the exception in a new ADR.
