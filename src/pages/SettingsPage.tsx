import React, { useState } from "react";
import {
  Settings,
  User,
  Mic,
  Languages,
  Bell,
  Shield,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Settings page for user preferences and app configuration
 */

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    autoDetectLanguage: true,
    notifications: true,
    highQualityAudio: true,
    autoSaveRecordings: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    // TODO: Save settings to backend/localStorage
    console.log(`Setting ${key} changed to:`, value);
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-slate-400">
            Manage your account preferences and app configuration
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Account</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="px-3 py-2 bg-slate-700 rounded-lg text-slate-400">
                  {user?.email || "Not logged in"}
                </div>
              </div>
            </div>
          </div>

          {/* Audio & Recording Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Mic className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Audio & Recording</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    High Quality Audio
                  </h3>
                  <p className="text-sm text-slate-400">
                    Record audio at higher quality (uses more storage)
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "highQualityAudio",
                      !settings.highQualityAudio
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highQualityAudio ? "bg-blue-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highQualityAudio
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Auto-save Recordings
                  </h3>
                  <p className="text-sm text-slate-400">
                    Automatically save recordings to your history
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "autoSaveRecordings",
                      !settings.autoSaveRecordings
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSaveRecordings ? "bg-blue-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSaveRecordings
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Languages className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">
                Language & Transcription
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Auto-detect Language
                  </h3>
                  <p className="text-sm text-slate-400">
                    Automatically detect the language being spoken
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "autoDetectLanguage",
                      !settings.autoDetectLanguage
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoDetectLanguage ? "bg-blue-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoDetectLanguage
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Language
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    handleSettingChange("defaultLanguage", e.target.value)
                  }
                  disabled={settings.autoDetectLanguage}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                {settings.autoDetectLanguage && (
                  <p className="text-xs text-slate-400 mt-1">
                    Language will be automatically detected when auto-detect is
                    enabled
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-slate-400">
                    Receive notifications about transcription completion
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      !settings.notifications
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? "bg-blue-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </div>

            <div className="space-y-4">
              <button className="flex items-center space-x-3 px-4 py-3 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400 hover:bg-red-600/20 transition-colors w-full text-left">
                <Trash2 className="w-5 h-5" />
                <div>
                  <div className="font-medium">Delete All Recordings</div>
                  <div className="text-sm text-red-400/70">
                    Permanently delete all your recordings and transcripts
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
