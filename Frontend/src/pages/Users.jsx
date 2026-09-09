import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  Power,
  RefreshCw,
  Search,
  Shield,
  UserCog,
  Users as UsersIcon,
  X,
} from "lucide-react";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../Api/userApi";

import { getErrorMessage } from "../Utils/helpers";

import "./Users.css";

const ROLE_OPTIONS = [
  "Admin",
  "Manager",
  "User",
];

const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const getRoleClass = (role) => {
  switch (role) {
    case "Admin":
      return "admin";

    case "Manager":
      return "manager";

    default:
      return "user";
  }
};

const formatDate = (dateString) => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const Users = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [roleEditingId, setRoleEditingId] =
    useState(null);

  const [statusEditingId, setStatusEditingId] =
    useState(null);

  const [confirmUser, setConfirmUser] =
    useState(null);

  const loadUsers = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const data = await getUsers();

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.fullName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" &&
          user.isActive) ||
        (statusFilter === "Inactive" &&
          !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const activeCount = useMemo(
    () =>
      users.filter(
        (user) => user.isActive
      ).length,
    [users]
  );

  const inactiveCount = useMemo(
    () =>
      users.filter(
        (user) => !user.isActive
      ).length,
    [users]
  );

  const adminCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === "Admin"
      ).length,
    [users]
  );

  const managerCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === "Manager"
      ).length,
    [users]
  );

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      setRoleEditingId(userId);
      setError("");

      const updatedUser =
        await updateUserRole(
          userId,
          role
        );

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                ...(updatedUser || {}),
                role,
              }
            : user
        )
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setRoleEditingId(null);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmUser) {
      return;
    }

    const user = confirmUser;
    const newStatus = !user.isActive;

    try {
      setStatusEditingId(user.id);
      setError("");

      await updateUserStatus(
        user.id,
        newStatus
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: newStatus,
              }
            : item
        )
      );

      setConfirmUser(null);
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setStatusEditingId(null);
    }
  };

  return (
    <div className="users-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="users-header">
        <div>
          <span className="users-eyebrow">
            <UsersIcon size={14} />
            ADMINISTRATION
          </span>

          <h1>Users</h1>

          <p>
            Manage workspace members, roles,
            and account access.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh"
          onClick={() =>
            loadUsers(false)
          }
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2
              size={16}
              className="users-spin"
            />
          ) : (
            <RefreshCw size={16} />
          )}

          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="users-summary">
        <div className="users-summary-card">
          <div className="users-summary-icon total">
            <UsersIcon size={19} />
          </div>

          <div>
            <span>Total users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon active">
            <Check size={19} />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon manager">
            <UserCog size={19} />
          </div>

          <div>
            <span>Managers</span>
            <strong>{managerCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon admin">
            <Shield size={19} />
          </div>

          <div>
            <span>Admins</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon inactive">
            <Power size={19} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="users-error">
          <div className="users-error-icon">
            <X size={17} />
          </div>

          <div>
            <strong>
              Something went wrong
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name or email..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="users-filters">
          <label className="users-select">
            <span>Role</span>

            <div>
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All roles
                </option>

                {ROLE_OPTIONS.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={15} />
            </div>
          </label>

          <label className="users-select">
            <span>Status</span>

            <div>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All statuses
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              <ChevronDown size={15} />
            </div>
          </label>
        </div>
      </div>

      {/* =====================================================
          RESULTS INFO
      ===================================================== */}

      <div className="users-results-info">
        <span>
          Showing{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong>{users.length}</strong>{" "}
          users
        </span>

        {(search ||
          roleFilter !== "All" ||
          statusFilter !== "All") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("All");
              setStatusFilter("All");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="users-loading">
          <Loader2
            size={28}
            className="users-spin"
          />

          <span>
            Loading users...
          </span>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* ===================================================
           EMPTY
        =================================================== */

        <div className="users-empty">
          <div className="users-empty-icon">
            <UsersIcon size={27} />
          </div>

          <h2>
            {users.length === 0
              ? "No users found"
              : "No matching users"}
          </h2>

          <p>
            {users.length === 0
              ? "There are no workspace users to display."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        /* ===================================================
           DESKTOP TABLE
        =================================================== */

        <div className="users-table-card">
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="users-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => (
                    <tr key={user.id}>
                      {/* USER */}

                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {getInitials(
                              user.fullName
                            )}
                          </div>

                          <div className="user-info">
                            <strong>
                              {user.fullName}
                            </strong>

                            <span>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}

                      <td>
                        <div className="role-control">
                          <span
                            className={`role-badge ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>

                          <div className="role-select-wrapper">
                            <select
                              value={
                                user.role
                              }
                              onChange={(
                                event
                              ) =>
                                handleRoleChange(
                                  user.id,
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                roleEditingId ===
                                user.id
                              }
                              aria-label={`Change role for ${user.fullName}`}
                            >
                              {ROLE_OPTIONS.map(
                                (role) => (
                                  <option
                                    key={
                                      role
                                    }
                                    value={
                                      role
                                    }
                                  >
                                    {role}
                                  </option>
                                )
                              )}
                            </select>

                            {roleEditingId ===
                            user.id ? (
                              <Loader2
                                size={14}
                                className="users-spin"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-badge ${
                            user.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span />
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* JOINED */}

                      <td>
                        <span className="joined-date">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className={`status-action ${
                            user.isActive
                              ? "deactivate"
                              : "activate"
                          }`}
                          onClick={() =>
                            setConfirmUser(
                              user
                            )
                          }
                          disabled={
                            statusEditingId ===
                            user.id
                          }
                        >
                          {statusEditingId ===
                          user.id ? (
                            <Loader2
                              size={14}
                              className="users-spin"
                            />
                          ) : (
                            <Power
                              size={14}
                            />
                          )}

                          {user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      {confirmUser && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setConfirmUser(null);
            }
          }}
        >
          <div className="users-modal">
            <button
              type="button"
              className="users-modal-close"
              onClick={() =>
                setConfirmUser(null)
              }
              aria-label="Close dialog"
            >
              <X size={17} />
            </button>

            <div
              className={`users-modal-icon ${
                confirmUser.isActive
                  ? "danger"
                  : "success"
              }`}
            >
              <Power size={22} />
            </div>

            <h2>
              {confirmUser.isActive
                ? "Deactivate user?"
                : "Activate user?"}
            </h2>

            <p>
              You are about to{" "}
              {confirmUser.isActive
                ? "deactivate"
                : "activate"}{" "}
              <strong>
                {confirmUser.fullName}
              </strong>
              's account.
            </p>

            <div className="users-modal-actions">
              <button
                type="button"
                className="users-modal-cancel"
                onClick={() =>
                  setConfirmUser(null)
                }
                disabled={
                  statusEditingId !== null
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={`users-modal-confirm ${
                  confirmUser.isActive
                    ? "danger"
                    : "success"
                }`}
                onClick={
                  handleStatusChange
                }
                disabled={
                  statusEditingId !== null
                }
              >
                {statusEditingId !==
                null ? (
                  <Loader2
                    size={15}
                    className="users-spin"
                  />
                ) : (
                  <Power size={15} />
                )}

                {confirmUser.isActive
                  ? "Deactivate user"
                  : "Activate user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;