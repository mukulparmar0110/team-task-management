import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Edit3,
  Filter,
  ListFilter,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "../Api/taskApi";

import api from "../Api/axios";

import { useAuth } from "../context/AuthContext";

import { getErrorMessage } from "../Utils/helpers";

import "./Tasks.css";

const STATUS_OPTIONS = [
  {
    value: "ToDo",
    label: "To Do",
  },
  {
    value: "InProgress",
    label: "In Progress",
  },
  {
    value: "Done",
    label: "Done",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "Low",
    label: "Low",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "High",
    label: "High",
  },
  {
    value: "Critical",
    label: "Critical",
  },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  assignedToId: "",
  teamId: "",
};

const normalizeCollection = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.teams)) {
    return data.teams;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const getId = (item) => {
  return item?.id ?? item?.Id;
};

const getName = (item) => {
  return (
    item?.fullName ??
    item?.FullName ??
    item?.name ??
    item?.Name ??
    ""
  );
};

const getRole = (user) => {
  return user?.role ?? user?.Role ?? "";
};

const getStatusLabel = (status) => {
  const option = STATUS_OPTIONS.find(
    (item) => item.value === status
  );

  return option?.label ?? status;
};

const getPriorityLabel = (priority) => {
  return priority ?? "Medium";
};

const getStatusClass = (status) => {
  switch (status) {
    case "Done":
      return "done";

    case "InProgress":
      return "progress";

    case "ToDo":
    default:
      return "todo";
  }
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case "Critical":
      return "critical";

    case "High":
      return "high";

    case "Medium":
      return "medium";

    case "Low":
    default:
      return "low";
  }
};

const formatDate = (date) => {
  if (!date) {
    return "No due date";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No due date";
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

const isOverdue = (task) => {
  if (!task?.dueDate) {
    return false;
  }

  if (task.status === "Done") {
    return false;
  }

  return (
    new Date(task.dueDate).getTime() <
    Date.now()
  );
};

const getInitials = (name) => {
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

const Tasks = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const role =
    user?.role ??
    user?.Role ??
    "User";

  const canManageTasks =
    role === "Admin" ||
    role === "Manager";

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize] =
    useState(10);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalCount, setTotalCount] =
    useState(0);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [formData, setFormData] =
    useState(EMPTY_FORM);

  const [users, setUsers] =
    useState([]);

  const [teams, setTeams] =
    useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [openMenu, setOpenMenu] =
    useState(null);

  const [updatingTaskId, setUpdatingTaskId] =
    useState(null);

  const [deletingTaskId, setDeletingTaskId] =
    useState(null);

  const loadTasks = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getTasks({
            page,
            pageSize,
            status: statusFilter,
            priority: priorityFilter,
          });

        const returnedTasks =
          response?.tasks ??
          response?.Tasks ??
          [];

        setTasks(returnedTasks);

        setTotalCount(
          response?.totalCount ??
            response?.TotalCount ??
            returnedTasks.length
        );

        setTotalPages(
          response?.totalPages ??
            response?.TotalPages ??
            1
        );
      } catch (err) {
        console.error(
          "Tasks loading failed:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load tasks."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      pageSize,
      statusFilter,
      priorityFilter,
    ]
  );

  const loadOptions = useCallback(
    async () => {
      if (!canManageTasks) {
        return;
      }

      try {
        setLoadingOptions(true);

        const [usersResponse, teamsResponse] =
          await Promise.all([
            api.get("/Users"),
            api.get("/Teams"),
          ]);

        const availableUsers =
          normalizeCollection(
            usersResponse.data
          );

        const availableTeams =
          normalizeCollection(
            teamsResponse.data
          );

        setUsers(availableUsers);
        setTeams(availableTeams);
      } catch (err) {
        console.error(
          "Task creation options loading failed:",
          err
        );
      } finally {
        setLoadingOptions(false);
      }
    },
    [canManageTasks]
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const filteredTasks = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      const title =
        task?.title ??
        task?.Title ??
        "";

      const description =
        task?.description ??
        task?.Description ??
        "";

      const assignedTo =
        task?.assignedToName ??
        task?.AssignedToName ??
        "";

      const team =
        task?.teamName ??
        task?.TeamName ??
        "";

      return [
        title,
        description,
        assignedTo,
        team,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [tasks, search]);

  const handleStatusChange = async (
    task,
    status
  ) => {
    const taskId =
      task?.id ?? task?.Id;

    if (!taskId) {
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      setOpenMenu(null);

      await updateTaskStatus(
        taskId,
        status
      );

      await loadTasks(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to update task status."
        )
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = async (task) => {
    const taskId =
      task?.id ?? task?.Id;

    if (!taskId) {
      return;
    }

    const title =
      task?.title ??
      task?.Title ??
      "this task";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(taskId);
      setOpenMenu(null);

      await deleteTask(taskId);

      if (
        tasks.length === 1 &&
        page > 1
      ) {
        setPage((current) =>
          current - 1
        );
      } else {
        await loadTasks(true);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to delete task."
        )
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleOpenCreate = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowCreateModal(true);
    setOpenMenu(null);
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleCreateTask = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");

    if (!formData.title.trim()) {
      setFormError(
        "Task title is required."
      );
      return;
    }

    if (!formData.teamId) {
      setFormError(
        "Please select a team."
      );
      return;
    }

    try {
      setCreating(true);

      await createTask({
        title: formData.title.trim(),

        description:
          formData.description.trim() ||
          null,

        priority: formData.priority,

        dueDate:
          formData.dueDate
            ? new Date(
                formData.dueDate
              ).toISOString()
            : null,

        assignedToId:
          formData.assignedToId
            ? Number(
                formData.assignedToId
              )
            : null,

        teamId: Number(
          formData.teamId
        ),
      });

      setShowCreateModal(false);
      setFormData(EMPTY_FORM);

      await loadTasks(true);
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          "Unable to create task."
        )
      );
    } finally {
      setCreating(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  };

  const handleStatusFilter = (
    event
  ) => {
    setStatusFilter(
      event.target.value
    );
    setPage(1);
  };

  const handlePriorityFilter = (
    event
  ) => {
    setPriorityFilter(
      event.target.value
    );
    setPage(1);
  };

  const hasFilters =
    Boolean(
      search ||
        statusFilter ||
        priorityFilter
    );

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <span className="tasks-kicker">
            WORK MANAGEMENT
          </span>

          <h2>
            {canManageTasks
              ? "Team tasks"
              : "My tasks"}
          </h2>

          <p>
            {canManageTasks
              ? "Create, assign, and track work across your teams."
              : "Stay on top of the work assigned to you."}
          </p>
        </div>

        <div className="tasks-header-actions">
          <button
            type="button"
            className="tasks-refresh-button"
            onClick={() =>
              loadTasks(true)
            }
            disabled={refreshing}
          >
            <LoaderCircle
              size={16}
              className={
                refreshing
                  ? "tasks-spin"
                  : ""
              }
            />

            <span>
              Refresh
            </span>
          </button>

          {canManageTasks && (
            <button
              type="button"
              className="tasks-create-button"
              onClick={
                handleOpenCreate
              }
            >
              <Plus size={17} />

              <span>
                New task
              </span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="tasks-error"
          role="alert"
        >
          <AlertTriangle size={17} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              loadTasks()
            }
          >
            Try again
          </button>

          <button
            type="button"
            className="tasks-error-close"
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="tasks-toolbar">
        <div className="tasks-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search tasks, people, teams..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="tasks-filters">
          <div className="tasks-filter">
            <ListFilter size={15} />

            <select
              value={statusFilter}
              onChange={
                handleStatusFilter
              }
              aria-label="Filter by status"
            >
              <option value="">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="tasks-filter">
            <Filter size={15} />

            <select
              value={priorityFilter}
              onChange={
                handlePriorityFilter
              }
              aria-label="Filter by priority"
            >
              <option value="">
                All priorities
              </option>

              {PRIORITY_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="tasks-clear-filters"
              onClick={resetFilters}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <div className="tasks-summary">
        <span>
          {totalCount}{" "}
          {totalCount === 1
            ? "task"
            : "tasks"}
        </span>

        {hasFilters && (
          <span className="tasks-filter-active">
            Filters active
          </span>
        )}
      </div>

      {loading ? (
        <div className="tasks-loading">
          <div className="tasks-loading-spinner" />

          <p>
            Loading tasks...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <Check size={23} />
          </div>

          <h3>
            {hasFilters
              ? "No matching tasks"
              : "No tasks yet"}
          </h3>

          <p>
            {hasFilters
              ? "Try adjusting your search or filters."
              : canManageTasks
                ? "Create your first task to get your team moving."
                : "Tasks assigned to you will appear here."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              className="tasks-empty-button"
              onClick={
                resetFilters
              }
            >
              Clear filters
            </button>
          ) : (
            canManageTasks && (
              <button
                type="button"
                className="tasks-empty-button"
                onClick={
                  handleOpenCreate
                }
              >
                <Plus size={16} />
                Create task
              </button>
            )
          )}
        </div>
      ) : (
        <>
          <section className="tasks-table-card">
            <div className="tasks-table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>
                      Task
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Assignee
                    </th>

                    <th>
                      Due
                    </th>

                    <th>
                      Team
                    </th>

                    <th>
                      <span className="sr-only">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map(
                    (task) => {
                      const taskId =
                        task?.id ??
                        task?.Id;

                      const title =
                        task?.title ??
                        task?.Title ??
                        "Untitled task";

                      const description =
                        task?.description ??
                        task?.Description ??
                        "";

                      const priority =
                        task?.priority ??
                        task?.Priority ??
                        "Medium";

                      const status =
                        task?.status ??
                        task?.Status ??
                        "ToDo";

                      const assignedToName =
                        task?.assignedToName ??
                        task?.AssignedToName;

                      const teamName =
                        task?.teamName ??
                        task?.TeamName;

                      const dueDate =
                        task?.dueDate ??
                        task?.DueDate;

                      const overdue =
                        isOverdue({
                          ...task,
                          status,
                          dueDate,
                        });

                      const isUpdating =
                        updatingTaskId ===
                        taskId;

                      const isDeleting =
                        deletingTaskId ===
                        taskId;

                      return (
                        <tr
                          key={taskId}
                          className={
                            overdue
                              ? "task-row overdue-row"
                              : "task-row"
                          }
                        >
                          <td>
                            <button
                              type="button"
                              className="task-title-cell"
                              onClick={() =>
                                navigate(
                                  `/tasks/${taskId}`
                                )
                              }
                            >
                              <span className="task-title">
                                {title}
                              </span>

                              {description && (
                                <span className="task-description">
                                  {description}
                                </span>
                              )}
                            </button>
                          </td>

                          <td>
                            <span
                              className={`priority-badge ${getPriorityClass(
                                priority
                              )}`}
                            >
                              <span className="priority-badge-dot" />

                              {getPriorityLabel(
                                priority
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="status-control">
                              {isUpdating ? (
                                <LoaderCircle
                                  size={15}
                                  className="tasks-spin"
                                />
                              ) : (
                                <Circle
                                  size={10}
                                  fill="currentColor"
                                />
                              )}

                              <select
                                value={status}
                                onChange={(
                                  event
                                ) =>
                                  handleStatusChange(
                                    task,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isUpdating
                                }
                                aria-label={`Change status for ${title}`}
                              >
                                {STATUS_OPTIONS.map(
                                  (
                                    option
                                  ) => (
                                    <option
                                      key={
                                        option.value
                                      }
                                      value={
                                        option.value
                                      }
                                    >
                                      {
                                        option.label
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </td>

                          <td>
                            {assignedToName ? (
                              <div className="assignee-cell">
                                <span className="assignee-avatar">
                                  {getInitials(
                                    assignedToName
                                  )}
                                </span>

                                <span>
                                  {
                                    assignedToName
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="unassigned">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td>
                            <div
                              className={
                                overdue
                                  ? "due-cell overdue"
                                  : "due-cell"
                              }
                            >
                              <CalendarDays
                                size={14}
                              />

                              <span>
                                {formatDate(
                                  dueDate
                                )}
                              </span>

                              {overdue && (
                                <AlertTriangle
                                  size={13}
                                />
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="team-cell">
                              {teamName ??
                                "No team"}
                            </span>
                          </td>

                          <td>
                            <div className="task-actions">
                              <button
                                type="button"
                                className="task-action-button"
                                onClick={() =>
                                  navigate(
                                    `/tasks/${taskId}`
                                  )
                                }
                                aria-label="View task"
                              >
                                <ChevronRight
                                  size={16}
                                />
                              </button>

                              {canManageTasks && (
                                <div className="task-menu-wrapper">
                                  <button
                                    type="button"
                                    className="task-action-button"
                                    onClick={() =>
                                      setOpenMenu(
                                        openMenu ===
                                          taskId
                                          ? null
                                          : taskId
                                      )
                                    }
                                    aria-label="Task actions"
                                  >
                                    <MoreHorizontal
                                      size={16}
                                    />
                                  </button>

                                  {openMenu ===
                                    taskId && (
                                    <div className="task-dropdown">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenu(
                                            null
                                          );
                                          navigate(
                                            `/tasks/${taskId}/edit`
                                          );
                                        }}
                                      >
                                        <Edit3
                                          size={
                                            14
                                          }
                                        />

                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        className="danger"
                                        onClick={() =>
                                          handleDelete(
                                            task
                                          )
                                        }
                                        disabled={
                                          isDeleting
                                        }
                                      >
                                        {isDeleting ? (
                                          <LoaderCircle
                                            size={
                                              14
                                            }
                                            className="tasks-spin"
                                          />
                                        ) : (
                                          <Trash2
                                            size={
                                              14
                                            }
                                          />
                                        )}

                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="tasks-mobile-list">
            {filteredTasks.map(
              (task) => {
                const taskId =
                  task?.id ??
                  task?.Id;

                const title =
                  task?.title ??
                  task?.Title ??
                  "Untitled task";

                const priority =
                  task?.priority ??
                  task?.Priority ??
                  "Medium";

                const status =
                  task?.status ??
                  task?.Status ??
                  "ToDo";

                const assignedToName =
                  task?.assignedToName ??
                  task?.AssignedToName;

                const dueDate =
                  task?.dueDate ??
                  task?.DueDate;

                const overdue =
                  isOverdue({
                    ...task,
                    status,
                    dueDate,
                  });

                return (
                  <article
                    className={`task-mobile-card ${
                      overdue
                        ? "overdue"
                        : ""
                    }`}
                    key={taskId}
                  >
                    <div className="task-mobile-top">
                      <div>
                        <span
                          className={`priority-badge ${getPriorityClass(
                            priority
                          )}`}
                        >
                          <span className="priority-badge-dot" />

                          {priority}
                        </span>

                        <h3>
                          {title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        className="task-mobile-open"
                        onClick={() =>
                          navigate(
                            `/tasks/${taskId}`
                          )
                        }
                        aria-label="Open task"
                      >
                        <ChevronRight
                          size={17}
                        />
                      </button>
                    </div>

                    <div className="task-mobile-meta">
                      <div>
                        <UserRound
                          size={14}
                        />

                        <span>
                          {assignedToName ??
                            "Unassigned"}
                        </span>
                      </div>

                      <div
                        className={
                          overdue
                            ? "overdue"
                            : ""
                        }
                      >
                        <CalendarDays
                          size={14}
                        />

                        <span>
                          {formatDate(
                            dueDate
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="task-mobile-bottom">
                      <select
                        value={status}
                        onChange={(
                          event
                        ) =>
                          handleStatusChange(
                            task,
                            event.target
                              .value
                          )
                        }
                        disabled={
                          updatingTaskId ===
                          taskId
                        }
                      >
                        {STATUS_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>

                      <span className="mobile-team">
                        {task?.teamName ??
                          task?.TeamName ??
                          "No team"}
                      </span>
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {totalPages > 1 && (
            <div className="tasks-pagination">
              <span>
                Page {page} of{" "}
                {totalPages}
              </span>

              <div className="pagination-buttons">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                {Array.from(
                  {
                    length: Math.min(
                      totalPages,
                      5
                    ),
                  },
                  (_, index) => {
                    const pageNumber =
                      index + 1;

                    return (
                      <button
                        type="button"
                        key={
                          pageNumber
                        }
                        className={
                          page ===
                          pageNumber
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }
                      >
                        {
                          pageNumber
                        }
                      </button>
                    );
                  }
                )}

                <button
                  type="button"
                  disabled={
                    page >=
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCreateModal(false);
            }
          }}
        >
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
          >
            <div className="task-modal-header">
              <div>
                <span className="tasks-kicker">
                  NEW WORK ITEM
                </span>

                <h2 id="create-task-title">
                  Create task
                </h2>

                <p>
                  Add a task and assign it
                  to the right person.
                </p>
              </div>

              <button
                type="button"
                className="task-modal-close"
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {formError && (
              <div className="task-form-error">
                <AlertTriangle
                  size={16}
                />

                <span>
                  {formError}
                </span>
              </div>
            )}

            <form
              className="task-form"
              onSubmit={
                handleCreateTask
              }
            >
              <div className="task-form-field full">
                <label htmlFor="task-title">
                  Task title
                </label>

                <input
                  id="task-title"
                  name="title"
                  type="text"
                  placeholder="e.g. Build notification system"
                  value={
                    formData.title
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={creating}
                  autoFocus
                />
              </div>

              <div className="task-form-field full">
                <label htmlFor="task-description">
                  Description
                </label>

                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Describe what needs to be done..."
                  rows="4"
                  value={
                    formData.description
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={creating}
                />
              </div>

              <div className="task-form-grid">
                <div className="task-form-field">
                  <label htmlFor="task-priority">
                    Priority
                  </label>

                  <select
                    id="task-priority"
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={creating}
                  >
                    {PRIORITY_OPTIONS.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="task-form-field">
                  <label htmlFor="task-due-date">
                    Due date
                  </label>

                  <div className="task-input-icon-wrapper">
                    <Clock3 size={16} />

                    <input
                      id="task-due-date"
                      name="dueDate"
                      type="datetime-local"
                      value={
                        formData.dueDate
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>

              <div className="task-form-grid">
                <div className="task-form-field">
                  <label htmlFor="task-team">
                    Team
                  </label>

                  <select
                    id="task-team"
                    name="teamId"
                    value={
                      formData.teamId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      creating ||
                      loadingOptions
                    }
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading teams..."
                        : "Select team"}
                    </option>

                    {teams.map(
                      (team) => (
                        <option
                          key={getId(
                            team
                          )}
                          value={getId(
                            team
                          )}
                        >
                          {getName(
                            team
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="task-form-field">
                  <label htmlFor="task-assignee">
                    Assign to
                  </label>

                  <select
                    id="task-assignee"
                    name="assignedToId"
                    value={
                      formData.assignedToId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      creating ||
                      loadingOptions
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {users
                      .filter(
                        (candidate) =>
                          candidate?.isActive !==
                            false &&
                          candidate?.IsActive !==
                            false
                      )
                      .map(
                        (candidate) => (
                          <option
                            key={getId(
                              candidate
                            )}
                            value={getId(
                              candidate
                            )}
                          >
                            {getName(
                              candidate
                            )}
                            {getRole(
                              candidate
                            )
                              ? ` · ${getRole(
                                  candidate
                                )}`
                              : ""}
                          </option>
                        )
                      )}
                  </select>
                </div>
              </div>

              <div className="task-form-note">
                <AlertTriangle
                  size={14}
                />

                <span>
                  The selected assignee must
                  belong to the selected team.
                </span>
              </div>

              <div className="task-modal-actions">
                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={() =>
                    setShowCreateModal(
                      false
                    )
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="task-submit-button"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="tasks-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />

                      Create task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;