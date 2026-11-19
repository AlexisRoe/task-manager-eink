# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately via GitHub Security Advisories on this repository. Do not open public issues for security problems.

## Threat model summary

- All data stays on the device (IndexedDB). The app performs no network requests besides loading its own static assets.
- Persisted data is treated as untrusted and validated on load.
- A strict Content-Security-Policy (`public/_headers`) blocks third-party origins, inline scripts and `eval`.
- Dependencies are pinned, installed with `npm ci` and `ignore-scripts=true`, and audited in CI.
