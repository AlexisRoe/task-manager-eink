# task-manager-eink

I want an application, served as pwa (horizontal, standalone only) which is designed security-by-design and stores data exclusivly local only.

## Tech

- react
- zustand for handling localstorage or alternativly a db
- pwa
- vite
- vitest
- using ui-lib exclusivly (https://www.npmjs.com/package/e-ink-ui-lib, github.com/AlexisRoe/e-ink-ui-lib)

## Design

Take the screenshots and the prototype to create this react-app with the ui-lib. Recreate the interface with this components and use custom-css for layout only.

If the lib does not contain the components needed to do it, open a new PR to add this components. Create them in this project first and than transfer them, so they can be exchanged.

## Functionality

Use the prototype and the screenshots to recreate the same logic internally

## Security

Security-by-design has to be applied to local development, dependencies, tests, git pipelines, security checks, etc.