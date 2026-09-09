import {
  Bell,
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Teams",
    path: "/teams",
    icon: Users,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const getUserName = () => {
    return (
      user?.fullName ??
      user?.FullName ??
      user?.name ??
      "User"
    );
  };

  const getUserRole = () => {
    return (
      user?.role ??
      user?.Role ??
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
  const userRole = getUserRole();

  const isAdmin = userRole === "Admin";
  const isManager = userRole === "Manager";

  return (
    <aside className="sidebar">
      {/* =====================================================
          SIDEBAR HEADER
      ===================================================== */}

      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="sidebar-logo-mark">
            <Zap
              size={19}
              strokeWidth={2.5}
            />
          </span>

          <span className="sidebar-logo-text">
            TaskFlow
          </span>
        </div>

        <button
          type="button"
          className="sidebar-mobile-close"
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      </div>

      {/* =====================================================
          WORKSPACE NAVIGATION
      ===================================================== */}

      <div className="sidebar-section">
        <span className="sidebar-section-label">
          WORKSPACE
        </span>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>

                {item.label ===
                  "Notifications" && (
                  <span className="sidebar-nav-dot" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          MANAGEMENT
          
          Users = ADMIN ONLY
          Settings = ADMIN + MANAGER
      ===================================================== */}

      {(isAdmin || isManager) && (
        <div className="sidebar-section sidebar-admin-section">
          <span className="sidebar-section-label">
            MANAGEMENT
          </span>

          <nav className="sidebar-nav">

            {/* -------------------------------------------------
                USERS
                ADMIN ONLY
            ------------------------------------------------- */}

            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <UserRound size={19} />

                <span>
                  Users
                </span>
              </NavLink>
            )}

            {/* -------------------------------------------------
                SETTINGS
                ADMIN + MANAGER
            ------------------------------------------------- */}

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `sidebar-nav-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <Settings size={19} />

              <span>
                Settings
              </span>
            </NavLink>
          </nav>
        </div>
      )}

      {/* =====================================================
          SPACER
      ===================================================== */}

      <div className="sidebar-spacer" />

      {/* =====================================================
          CURRENT USER
      ===================================================== */}

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {getInitials(userName)}
        </div>

        <div className="sidebar-user-info">
          <strong>
            {userName}
          </strong>

          <span>
            {userRole}
          </span>
        </div>

        <button
          type="button"
          className="sidebar-user-menu"
          aria-label="User menu"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <LogOut size={18} />

        <span>
          Sign out
        </span>
      </button>
    </aside>
  );
};

export default Sidebar;