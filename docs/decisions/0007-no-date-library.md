# 0007. No date library

Date: 2026-11-19 · Status: accepted

## Context
Only local calendar dates, weeks and a few labels are needed.

## Decision
Dates are `YYYY-MM-DD` strings and times `HH:MM`, handled by pure utilities (`utils/date.utils.ts`, `utils/time.utils.ts`) and `Intl.DateTimeFormat`. Day arithmetic uses calendar fields so daylight-saving changes cannot shift dates.

## Consequences
Fewer dependencies; ISO week numbers and DST are covered by unit tests.
