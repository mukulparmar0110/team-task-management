import { useEffect, useRef, useState } from "react";

import {
  Bell,
  CheckSquare,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  Users,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const mobileItems = [
  {
    label: "Home",
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
    label: "Alerts",
    path: "/notifications",
    icon: Bell,
  },
];

const MobileNav = () => {
  const { user } = useAuth();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreRef = useRef(null);

  const userRole =
    user?.role ??
    user?.Role ??
    "User";

  const isAdmin = userRole === "Admin";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        moreRef.current &&
        !moreRef.current.contains(event.target)
      ) {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [isMoreOpen]);

  return (
    <>
      {isMoreOpen && (
        <div
          className="mobile-more-backdrop"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {mobileItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `mobile-nav-item ${
                    isActive ? "active" : ""
                  }`
                }
                onClick={() => setIsMoreOpen(false)}
              >
                <span className="mobile-nav-icon">
                  <Icon size={20} />
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* More */}
          <div
            className="mobile-more-wrapper"
            ref={moreRef}
          >
            <button
              type="button"
              className={`mobile-nav-item ${
                isMoreOpen ? "active" : ""
              }`}
              onClick={() =>
                setIsMoreOpen((current) => !current)
              }
              aria-expanded={isMoreOpen}
              aria-label="Open more options"
            >
              <span className="mobile-nav-icon">
                {isMoreOpen ? (
                  <X size={20} />
                ) : (
                  <MoreHorizontal size={20} />
                )}
              </span>

              <span>
                More
              </span>
            </button>

            {isMoreOpen && (
              <div className="mobile-more-menu">
                <div className="mobile-more-header">
                  <div>
                    <strong>
                      More
                    </strong>

                    <span>
                      Quick access
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mobile-more-close"
                    onClick={() =>
                      setIsMoreOpen(false)
                    }
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Settings */}
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `mobile-more-link ${
                      isActive ? "active" : ""
                    }`
                  }
                  onClick={() =>
                    setIsMoreOpen(false)
                  }
                >
                  <span className="mobile-more-link-icon">
                    <Settings size={19} />
                  </span>

                  <span>
                    Settings
                  </span>
                </NavLink>

                {/* Users - Admin Only */}
                {isAdmin && (
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `mobile-more-link ${
                        isActive ? "active" : ""
                      }`
                    }
                    onClick={() =>
                      setIsMoreOpen(false)
                    }
                  >
                    <span className="mobile-more-link-icon">
                      <Users size={19} />
                    </span>

                    <span>
                      Users
                    </span>
                  </NavLink>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;