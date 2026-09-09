import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Save,
  UserRound,
  Users,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTask,
  updateTask,
} from "../Api/taskApi";

import {
  getTeams,
} from "../Api/teamApi";

import {
  getUsers,
} from "../Api/userApi";

import { useAuth } from "../context/AuthContext";

import {
  getErrorMessage,
} from "../Utils/helpers";

import "./EditTask.css";

const PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.Items)) {
    return data.Items;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.Users)) {
    return data.Users;
  }

  if (Array.isArray(data?.teams)) {
    return data.teams;
  }

  if (Array.isArray(data?.Teams)) {
    return data.Teams;
  }

  return [];
};

const getValue = (
  object,
  camel,
  pascal
) => {
  return (
    object?.[camel] ??
    object?.[pascal]
  );
};

const getId = (object) => {
  return getValue(
    object,
    "id",
    "Id"
  );
};

const getName = (object) => {
  return (
    getValue(
      object,
      "fullName",
      "FullName"
    ) ??
    getValue(
      object,
      "name",
      "Name"
    ) ??
    ""
  );
};

const formatDateForInput = (
  date
) => {
  if (!date) {
    return "";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  const year =
    parsed.getFullYear();

  const month =
    String(
      parsed.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      parsed.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const EditTask = () => {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const role =
    user?.role ??
    user?.Role ??
    "User";

  const canManage =
    role === "Admin" ||
    role === "Manager";

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [task, setTask] =
    useState(null);

  const [teams, setTeams] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignedToId: "",
      teamId: "",
    });

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            taskResponse,
            teamsResponse,
            usersResponse,
          ] = await Promise.all([
            getTask(id),
            getTeams(),
            getUsers(),
          ]);

          const loadedTask =
            taskResponse;

          const loadedTeams =
            normalizeArray(
              teamsResponse
            );

          const loadedUsers =
            normalizeArray(
              usersResponse
            );

          setTask(
            loadedTask
          );

          setTeams(
            loadedTeams
          );

          setUsers(
            loadedUsers
          );

          setFormData({
            title:
              getValue(
                loadedTask,
                "title",
                "Title"
              ) ?? "",

            description:
              getValue(
                loadedTask,
                "description",
                "Description"
              ) ?? "",

            priority:
              getValue(
                loadedTask,
                "priority",
                "Priority"
              ) ?? "Medium",

            dueDate:
              formatDateForInput(
                getValue(
                  loadedTask,
                  "dueDate",
                  "DueDate"
                )
              ),

            assignedToId:
              getValue(
                loadedTask,
                "assignedToId",
                "AssignedToId"
              )?.toString() ?? "",

            teamId:
              getValue(
                loadedTask,
                "teamId",
                "TeamId"
              )?.toString() ?? "",
          });
        } catch (err) {
          console.error(
            "Edit task loading failed:",
            err
          );

          setError(
            getErrorMessage(
              err,
              "Unable to load task information."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    if (!canManage) {
      navigate(
        `/tasks/${id}`,
        {
          replace: true,
        }
      );

      return;
    }

    loadData();
  }, [
    canManage,
    id,
    loadData,
    navigate,
  ]);

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]: value,
        })
      );

      if (error) {
        setError("");
      }
    };

  const availableUsers =
    formData.teamId
      ? users
      : users;

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !formData.title.trim()
      ) {
        setError(
          "Task title is required."
        );
        return;
      }

      if (
        !formData.teamId
      ) {
        setError(
          "Please select a team."
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          title:
            formData.title.trim(),

          description:
            formData.description.trim() ||
            null,

          priority:
            formData.priority,

          dueDate:
            formData.dueDate
              ? `${formData.dueDate}T18:00:00`
              : null,

          assignedToId:
            formData.assignedToId
              ? Number(
                  formData.assignedToId
                )
              : null,

          teamId:
            Number(
              formData.teamId
            ),
        };

        await updateTask(
          id,
          payload
        );

        navigate(
          `/tasks/${id}`
        );
      } catch (err) {
        console.error(
          "Task update failed:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to update task."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  if (!canManage) {
    return null;
  }

  if (loading) {
    return (
      <div className="edit-task-page">
        <div className="edit-task-loading">
          <div className="edit-task-spinner" />

          <p>
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="edit-task-page">
        <div className="edit-task-error-page">
          <div className="edit-task-error-icon">
            <AlertTriangle
              size={23}
            />
          </div>

          <h2>
            Unable to edit task
          </h2>

          <p>
            {error ||
              "The task could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/tasks"
              )
            }
          >
            <ArrowLeft
              size={15}
            />
            Back to tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-task-page">
      <div className="edit-task-header">
        <div>
          <button
            type="button"
            className="edit-task-back"
            onClick={() =>
              navigate(
                `/tasks/${id}`
              )
            }
          >
            <ArrowLeft
              size={15}
            />
            Back to task
          </button>

          <div className="edit-task-heading">
            <span>
              TASK MANAGEMENT
            </span>

            <h1>
              Edit task
            </h1>

            <p>
              Update the details and
              ownership of this task.
            </p>
          </div>
        </div>

        <div className="edit-task-header-status">
          <Check size={14} />

          Changes are saved to
          your workspace
        </div>
      </div>

      {error && (
        <div className="edit-task-error">
          <AlertTriangle
            size={16}
          />

          <span>
            {error}
          </span>
        </div>
      )}

      <form
        className="edit-task-form"
        onSubmit={
          handleSubmit
        }
      >
        <div className="edit-task-main">
          <section className="edit-task-card">
            <div className="edit-task-card-header">
              <div className="edit-task-card-icon">
                <FileText
                  size={17}
                />
              </div>

              <div>
                <h2>
                  Task details
                </h2>

                <p>
                  Define what needs to
                  be done.
                </p>
              </div>
            </div>

            <div className="edit-task-fields">
              <div className="edit-task-field full">
                <label htmlFor="title">
                  Task title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Build authentication module"
                  maxLength={200}
                />
              </div>

              <div className="edit-task-field full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Add context, requirements, or useful information..."
                  rows="7"
                  maxLength={2000}
                />

                <small>
                  Keep your team aligned
                  with useful context.
                </small>
              </div>
            </div>
          </section>

          <section className="edit-task-card">
            <div className="edit-task-card-header">
              <div className="edit-task-card-icon">
                <Users
                  size={17}
                />
              </div>

              <div>
                <h2>
                  Ownership
                </h2>

                <p>
                  Choose the team and
                  person responsible.
                </p>
              </div>
            </div>

            <div className="edit-task-fields">
              <div className="edit-task-field">
                <label htmlFor="teamId">
                  Team
                  <span>*</span>
                </label>

                <div className="edit-task-select">
                  <Users
                    size={15}
                  />

                  <select
                    id="teamId"
                    name="teamId"
                    value={
                      formData.teamId
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select team
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

                  <ChevronDown
                    size={14}
                  />
                </div>
              </div>

              <div className="edit-task-field">
                <label htmlFor="assignedToId">
                  Assignee
                </label>

                <div className="edit-task-select">
                  <UserRound
                    size={15}
                  />

                  <select
                    id="assignedToId"
                    name="assignedToId"
                    value={
                      formData.assignedToId
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {availableUsers.map(
                      (userItem) => (
                        <option
                          key={getId(
                            userItem
                          )}
                          value={getId(
                            userItem
                          )}
                        >
                          {getName(
                            userItem
                          )}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                  />
                </div>

                <small>
                  The assignee must be a
                  member of the selected
                  team.
                </small>
              </div>
            </div>
          </section>
        </div>

        <aside className="edit-task-sidebar">
          <section className="edit-task-card">
            <div className="edit-task-card-header compact">
              <div className="edit-task-card-icon">
                <CalendarDays
                  size={17}
                />
              </div>

              <div>
                <h2>
                  Priority & deadline
                </h2>

                <p>
                  Set task urgency.
                </p>
              </div>
            </div>

            <div className="edit-task-sidebar-fields">
              <div className="edit-task-field">
                <label htmlFor="priority">
                  Priority
                </label>

                <div className="edit-task-select">
                  <select
                    id="priority"
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {PRIORITIES.map(
                      (priority) => (
                        <option
                          key={
                            priority
                          }
                          value={
                            priority
                          }
                        >
                          {priority}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                  />
                </div>
              </div>

              <div className="edit-task-field">
                <label htmlFor="dueDate">
                  Due date
                </label>

                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={
                    formData.dueDate
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>
          </section>

          <section className="edit-task-tip">
            <div>
              <Check size={15} />
            </div>

            <div>
              <strong>
                Keep it current
              </strong>

              <p>
                Accurate ownership and
                deadlines help everyone
                know what to work on next.
              </p>
            </div>
          </section>
        </aside>

        <div className="edit-task-footer">
          <button
            type="button"
            className="edit-task-cancel"
            onClick={() =>
              navigate(
                `/tasks/${id}`
              )
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-task-save"
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle
                size={15}
                className="edit-task-spin"
              />
            ) : (
              <Save size={15} />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;