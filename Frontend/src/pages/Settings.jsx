import {
  Bell,
  Check,
  Info,
  LogOut,
  Moon,
  Monitor,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Sun,
  Volume2,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import "./Settings.css";

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("notificationSound") !== "false"
  );

  const [desktopNotifications, setDesktopNotifications] =
    useState(
      localStorage.getItem("desktopNotifications") !== "false"
    );

  const [compactMode, setCompactMode] = useState(
    localStorage.getItem("compactMode") === "true"
  );

  const handleSoundChange = () => {
    const newValue = !soundEnabled;

    setSoundEnabled(newValue);

    localStorage.setItem(
      "notificationSound",
      String(newValue)
    );
  };

  const handleDesktopNotificationsChange = () => {
    const newValue = !desktopNotifications;

    setDesktopNotifications(newValue);

    localStorage.setItem(
      "desktopNotifications",
      String(newValue)
    );
  };

  const handleCompactModeChange = () => {
    const newValue = !compactMode;

    setCompactMode(newValue);

    localStorage.setItem(
      "compactMode",
      String(newValue)
    );
  };

  const resetPreferences = () => {
    localStorage.removeItem("notificationSound");
    localStorage.removeItem("desktopNotifications");
    localStorage.removeItem("compactMode");

    localStorage.setItem("theme", "light");

    setSoundEnabled(true);
    setDesktopNotifications(true);
    setCompactMode(false);

    document.documentElement.setAttribute(
      "data-theme",
      "light"
    );
  };

  const themeOptions = [
    {
      id: "light",
      label: "Light",
      description: "Clean and bright appearance",
      icon: Sun,
      enabled: true,
    },
    {
      id: "dark",
      label: "Dark",
      description: "Currently unavailable",
      icon: Moon,
      enabled: false,
    },
    {
      id: "system",
      label: "System",
      description: "Currently unavailable",
      icon: Monitor,
      enabled: false,
    },
  ];

  return (
    <div className="settings-page page-container fade-in">
      {/* ================================================
          HEADER
      ================================================ */}

      <div className="settings-header">
        <div>
          <div className="settings-title-row">
            <div className="settings-title-icon">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h1>Settings</h1>

              <p>
                Manage your workspace preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================
          PROFILE
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Info size={19} />
          </div>

          <div>
            <h2>Profile</h2>

            <p>
              Your account information
            </p>
          </div>
        </div>

        <div className="settings-profile">
          <div className="settings-avatar">
            {(user?.fullName ||
              user?.FullName ||
              "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="settings-profile-info">
            <h3>
              {user?.fullName ||
                user?.FullName ||
                "User"}
            </h3>

            <p>
              {user?.email ||
                user?.Email ||
                "No email available"}
            </p>
          </div>

          <div className="settings-role">
            {user?.role ||
              user?.Role ||
              "User"}
          </div>
        </div>
      </section>

      {/* ================================================
          APPEARANCE
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Palette size={19} />
          </div>

          <div>
            <h2>Appearance</h2>

            <p>
              Light theme is currently enabled.
            </p>
          </div>
        </div>

        <div className="theme-options">
          {themeOptions.map((option) => {
            const Icon = option.icon;

            const isSelected =
              option.id === theme;

            return (
              <button
                key={option.id}
                type="button"
                className={`theme-option ${
                  isSelected
                    ? "selected"
                    : ""
                } ${
                  !option.enabled
                    ? "disabled"
                    : ""
                }`}
                disabled={!option.enabled}
                aria-disabled={!option.enabled}
                aria-pressed={isSelected}
              >
                <div className="theme-option-icon">
                  <Icon size={21} />
                </div>

                <div className="theme-option-content">
                  <strong>
                    {option.label}
                  </strong>

                  <span>
                    {option.description}
                  </span>
                </div>

                <div className="theme-option-check">
                  {isSelected && (
                    <Check size={16} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================
          NOTIFICATIONS
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Bell size={19} />
          </div>

          <div>
            <h2>Notifications</h2>

            <p>
              Control how you receive notifications
            </p>
          </div>
        </div>

        <div className="settings-list">
          <div className="settings-row">
            <div className="settings-row-icon">
              <Volume2 size={19} />
            </div>

            <div className="settings-row-content">
              <strong>
                Notification sounds
              </strong>

              <span>
                Play a sound when a new notification arrives.
              </span>
            </div>

            <button
              type="button"
              className={`settings-switch ${
                soundEnabled
                  ? "active"
                  : ""
              }`}
              onClick={handleSoundChange}
              aria-label="Toggle notification sounds"
              aria-pressed={soundEnabled}
            >
              <span />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-row-icon">
              <Bell size={19} />
            </div>

            <div className="settings-row-content">
              <strong>
                Desktop notifications
              </strong>

              <span>
                Allow notifications to appear on your desktop.
              </span>
            </div>

            <button
              type="button"
              className={`settings-switch ${
                desktopNotifications
                  ? "active"
                  : ""
              }`}
              onClick={
                handleDesktopNotificationsChange
              }
              aria-label="Toggle desktop notifications"
              aria-pressed={
                desktopNotifications
              }
            >
              <span />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          INTERFACE
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Monitor size={19} />
          </div>

          <div>
            <h2>Interface</h2>

            <p>
              Adjust the density of the application
            </p>
          </div>
        </div>

        <div className="settings-list">
          <div className="settings-row">
            <div className="settings-row-icon">
              <Monitor size={19} />
            </div>

            <div className="settings-row-content">
              <strong>
                Compact mode
              </strong>

              <span>
                Use a more compact layout to display more
                information on screen.
              </span>
            </div>

            <button
              type="button"
              className={`settings-switch ${
                compactMode
                  ? "active"
                  : ""
              }`}
              onClick={handleCompactModeChange}
              aria-label="Toggle compact mode"
              aria-pressed={compactMode}
            >
              <span />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================
          PREFERENCES
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <RotateCcw size={19} />
          </div>

          <div>
            <h2>Preferences</h2>

            <p>
              Reset your local application preferences
            </p>
          </div>
        </div>

        <div className="settings-action">
          <div>
            <strong>
              Reset preferences
            </strong>

            <p>
              Restore notification and interface
              preferences to their defaults.
            </p>
          </div>

          <button
            type="button"
            className="settings-secondary-button"
            onClick={resetPreferences}
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>
      </section>

      {/* ================================================
          ACCOUNT
      ================================================ */}

      <section className="settings-card card">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <LogOut size={19} />
          </div>

          <div>
            <h2>Account</h2>

            <p>
              Manage your current session
            </p>
          </div>
        </div>

        <div className="settings-action">
          <div>
            <strong>
              Sign out
            </strong>

            <p>
              Sign out from this Team Task Management account.
            </p>
          </div>

          <button
            type="button"
            className="settings-danger-button"
            onClick={logout}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </section>

      {/* ================================================
          FOOTER
      ================================================ */}

      <div className="settings-footer">
        <span>
          Team Task Management
        </span>

        <span>•</span>

        <span>
          Version 1.0.0
        </span>
      </div>
    </div>
  );
};

export default Settings;