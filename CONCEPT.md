# task-manager-eink

I want an application, served as pwa (horizontal, standalone only) which is designed security-by-design and stores data exclusivly local only.

## Tech

- react
- zustand for handling localstorage or alternativly a db
- pwa
- vite
- vitest
- using ui-lib exclusivly (https://www.npmjs.com/package/e-ink-ui-lib, github.com/AlexisRoe/e-ink-ui-lib)
- Typescript

## Design

Take the screenshots and the prototype to create this react-app with the ui-lib. Recreate the interface with this components and use custom-css for layout only.

If the lib does not contain the components needed to do it, open a new PR to add this components. Create them in this project first and than transfer them, so they can be exchanged.

## Functionality

Use the prototype and the screenshots to recreate the same logic internally

### Daily habits

Besides tasks there are daily habits, created with "New habit" next to "New task". A habit has only a title, applies to every day without a time, and can be checked off at any point during that day (today or a past day, never a future one). At most 7 habits can be active at the same time. Habits can be renamed and deleted; deleting stops the habit from today on and keeps its past check-ins. The Day view lists them in their own section above the tasks. History shows a second heatmap for habits next to the task heatmap. The Week view does not show habits. See ADR [0017](docs/decisions/0017-daily-habits.md).

## Security

Security-by-design has to be applied to local development, dependencies, tests, git pipelines, security checks, etc.

## Documentation

document all decisions made to build the application. 

This application has to document all types, interfaces, methods and functions accordingly with JSDOCS. Document the intention/ purpose not the internals. 

In-code comments are only allowed if abolsut necessary.

## Code structure

Structure the code for a react application. Files should end with their function: render.hook.ts or day.view.ts or button.component.ts

Constants or config belong into dedicated files.

Follow best-practises in isolating code and resuse as much as possible.

## Deployment

This application will be deployed to Cloudflare pages later on with Github actions when merged to main.