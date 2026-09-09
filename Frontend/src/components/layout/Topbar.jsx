import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Here's what's happening with your work today.",
  },

  "/tasks": {
    title: "Tasks",
    description:
      "Manage, organize, and track your team's work.",
  },

  "/teams": {
    title: "Teams",
    description:
      "Manage your teams and team members.",
  },

  "/notifications": {
    title: "Notifications",
    description:
      "Stay updated on important task activity.",
  },

  "/users": {
    title: "Users",
    description:
      "Manage users and their access.",
  },

  "/settings": {
    title: "Settings",
    description:
      "Manage your workspace preferences.",
  },
};

const Topbar = () => {
  const location = useLocation();

  const { user } = useAuth();

  const page =
    pageTitles[location.pathname] ?? {
      title: "TaskFlow",
      description:
        "Manage your team's work.",
    };

  const getUserName = () => {
    return (
      user?.fullName ??
      user?.FullName ??
      user?.name ??
      "User"
    );
  };

  const getInitials = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  const userName = getUserName();

  return (
    <header className="topbar">
      <div className="topbar-mobile-menu">
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>
      </div>

      <div className="topbar-page-info">
        <h1>
          {page.title}
        </h1>

        <p>
          {page.description}
        </p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />

          <kbd>
            ⌘ K
          </kbd>
        </div>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="topbar-notification-dot" />
        </button>

        <div className="topbar-divider" />

        <button
          type="button"
          className="topbar-profile"
        >
          <span className="topbar-avatar">
            {getInitials(userName)}
          </span>

          <span className="topbar-profile-name">
            {userName}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;