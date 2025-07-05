/**
 * Settings utility functions for managing user preferences
 */

const SETTINGS_KEY = "janusarc-settings";

export interface UserSettings {
  defaultLanguage: string;
  autoDetectLanguage: boolean;
  notifications: boolean;
  highQualityAudio: boolean;
  autoSaveRecordings: boolean;
}

export const defaultSettings: UserSettings = {
  defaultLanguage: "eng",
  autoDetectLanguage: true,
  notifications: true,
  highQualityAudio: true,
  autoSaveRecordings: true,
};

export const getUserSettings = (): UserSettings => {
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  if (savedSettings) {
    try {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    } catch (error) {
      console.error("Failed to parse saved settings:", error);
    }
  }
  return defaultSettings;
};

export const saveUserSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};
