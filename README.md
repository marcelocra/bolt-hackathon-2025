# Janus Arc: The AI Log for Startup Founders

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
1. [x] Fix audio player to work correctly. We have an AudioPlayer component, but it is not integrated with HistoryList and when we tried to integrate, the seek functionality wouldn't work and the slider wouldn't show the correct length of the audio.
1. [x] Modernize the logo without change its idea and use it as favicon
1. [x] Fix the links in the menu dropdown: clicking on them doesn't take us anywhere. The pages work if we go directly to them, but not from the links.
1. [x] Do not display the language selector before the user records an audio. The selection should appear after the audio is recorded, near the save button, with the user's default/chosen language pre-selected
1. [x] Add robots.txt, sitemap.xml and a meta description to the app, so it can be indexed by search engines
1. [x] Remove the "View transcription" button from the audio playback, as it is not needed
1. [x] Fix settings page:
   - [x] Should have a link back to the previous page.
   - [x] Should persist the user settings at least locally. If global state management is neecessary, use Zustand.
   - [x] User language setting should be used when requesting the transcription from ElevenLabs, with fallback.
1. [x] Fix audio player: it still shows a second play button after the first one in the HistoryList item is clicked. Also, the HistoryList item shows exactly the same information that the audio player, aside from the audio duration, the transcript and the menu with actions. We need to:
   - [x] Rename the HistoryList component to AudioLogs.
   - [x] Create the AudioLog component, merging the HistoryList item with the AudioPlayer. That way we have a single component responsible for all audio-related functionality, including playback, transcription, and actions.
1. [x] Improve the Recorder component. Right now, it takes most of the screen height on mobile devices. Find a better design for the component, perhaps moving some of the text ("Founders Tips") to the faq or a later onboarding screen.
1. [ ] Add light mode support, consistent with the current dark mode. Add a toggle at the dropdown menu to switch between light and dark modes.
1. [ ] Add search functionality, placing an input search field above the Recorder component. When the user starts typing, only display audio logs with transcriptions that match the search query (semantically).

### Next Steps

1. [ ] Make it a PWA
1. [ ] Add pagination to the log history

### Ideas for later discussions (do not implement yet)

1. [ ] Add Todoist integration
1. [ ] Should be possible to update the transcript using a different language. Currently, it is, but only changing the user preferred language in the settings. Perhaps would be good to do that through the update transcript UI?

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
