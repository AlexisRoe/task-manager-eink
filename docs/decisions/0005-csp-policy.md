# 0005. Strict Content-Security-Policy and security headers

Date: 2026-11-19 · Status: accepted

## Context
The app must not talk to third parties and should resist injection.

## Decision
`public/_headers` sets `default-src 'self'`, no inline script or style, `object-src 'none'`, `frame-ancestors 'none'`, Trusted Types for scripts, Permissions-Policy denying everything, no-referrer, nosniff, COOP and HSTS. React `style` props are applied through the CSSOM and remain allowed. The policy is never loosened to make something work.

## Consequences
The Trusted Types and CSP behaviour has to be confirmed in a real browser via `npm run build && npm run preview` behind the headers (see PLAN §12).
