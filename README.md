# bolt-hackathon-2025

Code for Bolt's 2025 hackathon, aka World's Largest Hackathon.

## To Do

### MVP

- [x] Warn the user that updating the transcription will erase the previous one
- [x] Fix hover problem for the menu dropdown
- [x] Add bolt 'powered-by' as [required for the Hackathon](https://worldslargesthackathon.devpost.com/details/badgeguidelines)
- [ ] Deploy to Netlify
  - [ ] Add a link to the deployed app in the README
  - [ ] Verify that everything is working correctly

[**What to Submit**](https://worldslargesthackathon.devpost.com/#:~:text=for%20more%20details.-,What%20to%20Submit,-Include%20a%20video):

- [ ] Include a video (about 3 minutes) that demonstrates your submission. Videos must be uploaded to YouTube, Vimeo, or Facebook Video and made public.
- [ ] Provide a URL to a publicly available version of the project that is fully functional as described for review and judging.
- [ ] Confirm usage of Bolt.new to build the project and show the ‘Built with Bolt.new’ badge on your public project.
- [ ] Provide the email used to build the project on Bolt.new. This email must be associated with the usage of Bolt.new to built the submitted project.

### If there's time

- [ ] Make it a PWA
- [ ] Add Todoist integration

### Improvements for later

- Features
  - [ ] Add global search
- Performance
  - [ ] Add pagination to the log history

## App created from Vite template: React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
