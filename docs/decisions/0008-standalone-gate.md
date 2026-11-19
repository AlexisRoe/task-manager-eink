# 0008. Standalone and landscape gate

Date: 2026-11-19 · Status: accepted

## Context
The app is designed for installed, landscape use on e-ink tablets.

## Decision
In production `StandaloneGate` shows install instructions unless `display-mode: standalone` matches, and a rotate screen in portrait. Development bypasses the gate (`ENFORCE_STANDALONE = import.meta.env.PROD`). Layout is fluid and fills the landscape viewport rather than scaling a fixed 1248×936 frame.

## Consequences
Opening the production URL in a normal tab shows only the install screen.
