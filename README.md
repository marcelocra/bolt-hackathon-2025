# bolt-hackathon-2025

Code for Bolt's 2025 hackathon, aka World's Largest Hackathon.

## Hackathon Submission

[**What to Submit**](https://worldslargesthackathon.devpost.com/#:~:text=for%20more%20details.-,What%20to%20Submit,-Include%20a%20video):

- [ ] Include a video (about 3 minutes) that demonstrates your submission. Videos must be uploaded to YouTube, Vimeo, or Facebook Video and made public.
  - TODO
- [x] Provide a URL to a publicly available version of the project that is fully functional as described for review and judging.
  - https://janusarc.com
- [x] Confirm usage of Bolt.new to build the project and show the ‘Built with Bolt.new’ badge on your public project.
- [x] Provide the email used to build the project on Bolt.new. This email must be associated with the usage of Bolt.new to built the submitted project.

## To Do

### MVP

1. [x] add a favicon
1. [x] improve the header size, so that the name "Janus Arc" is not cut off nor too close to the login/signup buttons
1. [x] activate the logout/signout button, so it works correctly
1. [x] fix the user recording playback display, which doesn't show the length of the audio correctly, but a `Infinity:NaN`
1. [x] add a slider for the audio, so the user can move around the audio track
1. [x] display what language the user is using for the transcription, allowing them to change it if needed
1. [x] autodetect the user language and add it to the ElevenLabs API call (`language_code`, using 3 letters codes), so it improves the transcriptions
1. [x] review and improve the landing page, focusing on above-the-fold content
1. [x] reduce the gap between landing page sections
1. [x] hide the bolt badge when the user logs in
1. [x] Warn the user that updating the transcription will erase the previous one
1. [x] Fix hover problem for the menu dropdown
1. [x] Add bolt 'powered-by' as [required for the Hackathon](https://worldslargesthackathon.devpost.com/details/badgeguidelines)
1. [x] Deploy to Netlify
   - [x] Add a link to the deployed app in the README
   - [x] Verify that everything is working correctly
1. [x] The favicon should be the same as the logo
1. [x] Remove the "Profile Settings", keeping only "Settings"
1. [x] Create the Settings and the Help and Support pages
   - [x] The Settings page should allow the user to change their language, etc
   - [x] The Help and Support page should provide information on how to use the app, FAQs, and contact information for support
1. [ ] Seek still doesn't work.
1. [x] Modernize the logo without change its idea and use it as favicon
1. [ ] Fix the links in the menu dropdown: clicking on them doesn't take us anywhere. The pages work if we go directly to them, but not from the links.
1. [x] Do not display the language selector before the user records an audio. The selection should appear after the audio is recorded, near the save button, with the user's default/chosen language pre-selected
1. [x] Add robots.txt, sitemap.xml and a meta description to the app, so it can be indexed by search engines
1. [x] Remove the "View transcription" button from the audio playback, as it is not needed

### If there's time

- [ ] Make it a PWA
- [ ] Add Todoist integration

### Improvements for later

Features

1. [ ] Add global search
1. [ ]

Performance

1. [ ] Add pagination to the log history

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
