import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListTodo,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { getDashboard } from "../Api/dashboardApi";

import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

const statusConfig = {
  ToDo: {
    label: "To Do",
    className: "todo",
  },
  InProgress: {
    label: "In Progress",
    className: "progress",
  },
  Done: {
    label: "Done",
    className: "done",
  },
};

const getStatusConfig = (status) => {
  return (
    statusConfig[status] ?? {
      label: status,
      className: "todo",
    }
  );
};

const formatRole = (role) => {
  if (!role) {
    return "User";
  }

  return role;
};

const Dashboard = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });

  const loadDashboard = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await getDashboard(filters);

        setDashboard(data);
      } catch (err) {
        console.error(
          "Dashboard loading failed:",
          err
        );

        setError(
          err?.response?.data?.message ??
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFilterChange = (event) => {
    const { name, value } =
      event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
    });
  };

  const statusSummary =
    dashboard?.statusSummary ?? [];

  const userSummary =
    dashboard?.userSummary ?? [];

  const totalTasks =
    dashboard?.totalTasks ?? 0;

  const toDoTasks =
    dashboard?.toDoTasks ?? 0;

  const inProgressTasks =
    dashboard?.inProgressTasks ?? 0;

  const doneTasks =
    dashboard?.doneTasks ?? 0;

  const overdueTasks =
    dashboard?.overdueTasks ?? 0;

  const highPriorityTasks =
    dashboard?.highPriorityTasks ?? 0;

  const criticalPriorityTasks =
    dashboard?.criticalPriorityTasks ?? 0;

  const completionPercentage = useMemo(() => {
    if (!totalTasks) {
      return 0;
    }

    return Math.round(
      (doneTasks / totalTasks) * 100
    );
  }, [doneTasks, totalTasks]);

  const maxStatusCount = Math.max(
    ...statusSummary.map(
      (item) => item.count
    ),
    1
  );

  const getUserInitials = (name) => {
    if (!name) {
      return "?";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner" />

          <p>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-kicker">
            {formatRole(user?.role)}
            {" "}WORKSPACE
          </span>

          <h2>
            Welcome back
            {user?.fullName
              ? `, ${user.fullName.split(" ")[0]}`
              : ""}
            .
          </h2>

          <p>
            Here's a clear overview of your
            team's work and progress.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "spinning"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {error && (
        <div
          className="dashboard-error"
          role="alert"
        >
          <AlertTriangle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
            }
          >
            Try again
          </button>
        </div>
      )}

      <div className="dashboard-filters">
        <div className="dashboard-filter-heading">
          <span>FILTERS</span>

          <strong>
            Refine dashboard
          </strong>
        </div>

        <div className="dashboard-filter-controls">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            aria-label="Filter by status"
          >
            <option value="">
              All statuses
            </option>

            <option value="ToDo">
              To Do
            </option>

            <option value="InProgress">
              In Progress
            </option>

            <option value="Done">
              Done
            </option>
          </select>

          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            aria-label="Filter by priority"
          >
            <option value="">
              All priorities
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

            <option value="Critical">
              Critical
            </option>
          </select>

          {(filters.status ||
            filters.priority) && (
            <button
              type="button"
              className="dashboard-clear-filter"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon purple">
            <ListTodo size={19} />
          </div>

          <div className="dashboard-stat-content">
            <span>Total tasks</span>

            <strong>{totalTasks}</strong>

            <small>
              Across your workspace
            </small>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon amber">
            <Clock3 size={19} />
          </div>

          <div className="dashboard-stat-content">
            <span>To do</span>

            <strong>{toDoTasks}</strong>

            <small>
              Waiting to be started
            </small>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon blue">
            <TrendingUp size={19} />
          </div>

          <div className="dashboard-stat-content">
            <span>In progress</span>

            <strong>
              {inProgressTasks}
            </strong>

            <small>
              Currently being worked on
            </small>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div className="dashboard-stat-content">
            <span>Completed</span>

            <strong>{doneTasks}</strong>

            <small>
              {completionPercentage}% completion
            </small>
          </div>
        </article>

        <article className="dashboard-stat-card danger-card">
          <div className="dashboard-stat-icon red">
            <AlertTriangle size={19} />
          </div>

          <div className="dashboard-stat-content">
            <span>Overdue</span>

            <strong>{overdueTasks}</strong>

            <small>
              Need attention
            </small>
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">
                PROGRESS
              </span>

              <h3>
                Task status
              </h3>
            </div>

            <div className="completion-badge">
              {completionPercentage}%
            </div>
          </div>

          <div className="status-chart">
            {statusSummary.length === 0 ? (
              <div className="dashboard-empty">
                No status data available.
              </div>
            ) : (
              statusSummary.map(
                (item) => {
                  const config =
                    getStatusConfig(
                      item.status
                    );

                  const width =
                    Math.max(
                      (item.count /
                        maxStatusCount) *
                        100,
                      item.count > 0
                        ? 8
                        : 0
                    );

                  return (
                    <div
                      className="status-row"
                      key={item.status}
                    >
                      <div className="status-row-top">
                        <div className="status-name">
                          <span
                            className={`status-dot ${config.className}`}
                          />

                          <span>
                            {config.label}
                          </span>
                        </div>

                        <strong>
                          {item.count}
                        </strong>
                      </div>

                      <div className="status-track">
                        <div
                          className={`status-bar ${config.className}`}
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="dashboard-panel-label">
                PRIORITY
              </span>

              <h3>
                Priority overview
              </h3>
            </div>
          </div>

          <div className="priority-overview">
            <div className="priority-item">
              <div className="priority-item-left">
                <span className="priority-dot high" />

                <span>
                  High priority
                </span>
              </div>

              <strong>
                {highPriorityTasks}
              </strong>
            </div>

            <div className="priority-item">
              <div className="priority-item-left">
                <span className="priority-dot critical" />

                <span>
                  Critical priority
                </span>
              </div>

              <strong>
                {criticalPriorityTasks}
              </strong>
            </div>

            <div className="priority-summary">
              <div>
                <span>
                  Tasks needing attention
                </span>

                <strong>
                  {highPriorityTasks +
                    criticalPriorityTasks}
                </strong>
              </div>

              <AlertTriangle size={20} />
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-panel workload-panel">
        <div className="dashboard-panel-header">
          <div>
            <span className="dashboard-panel-label">
              TEAM
            </span>

            <h3>
              Workload by user
            </h3>
          </div>

          <span className="dashboard-panel-count">
            {userSummary.length}{" "}
            {userSummary.length === 1
              ? "member"
              : "members"}
          </span>
        </div>

        {userSummary.length === 0 ? (
          <div className="dashboard-empty">
            No assigned tasks found.
          </div>
        ) : (
          <div className="workload-table-wrapper">
            <table className="workload-table">
              <thead>
                <tr>
                  <th>
                    Team member
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    To Do
                  </th>

                  <th>
                    In Progress
                  </th>

                  <th>
                    Done
                  </th>

                  <th>
                    Overdue
                  </th>
                </tr>
              </thead>

              <tbody>
                {userSummary.map(
                  (member) => (
                    <tr
                      key={member.userId}
                    >
                      <td>
                        <div className="member-cell">
                          <span className="member-avatar">
                            {getUserInitials(
                              member.userName
                            )}
                          </span>

                          <span>
                            {member.userName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {member.totalTasks}
                        </strong>
                      </td>

                      <td>
                        <span className="table-status todo">
                          {member.toDoTasks}
                        </span>
                      </td>

                      <td>
                        <span className="table-status progress">
                          {member.inProgressTasks}
                        </span>
                      </td>

                      <td>
                        <span className="table-status done">
                          {member.doneTasks}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            member.overdueTasks >
                            0
                              ? "table-status overdue"
                              : "table-status neutral"
                          }
                        >
                          {member.overdueTasks}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;