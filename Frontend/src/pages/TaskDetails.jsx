import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Edit3,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteTask,
  getTask,
  updateTaskStatus,
} from "../Api/taskApi";

import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "../Api/commentsApi";

import { useAuth } from "../context/AuthContext";

import { getErrorMessage } from "../Utils/helpers";

import "./TaskDetails.css";

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

const getStatusLabel = (status) => {
  return (
    STATUS_OPTIONS.find(
      (item) => item.value === status
    )?.label ?? status
  );
};

const getStatusClass = (status) => {
  if (status === "Done") {
    return "done";
  }

  if (status === "InProgress") {
    return "progress";
  }

  return "todo";
};

const getPriorityClass = (priority) => {
  if (priority === "Critical") {
    return "critical";
  }

  if (priority === "High") {
    return "high";
  }

  if (priority === "Medium") {
    return "medium";
  }

  return "low";
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

const formatDateTime = (date) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
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

const normalizeComments = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.comments)) {
    return data.comments;
  }

  if (Array.isArray(data?.Comments)) {
    return data.Comments;
  }

  return [];
};

const TaskDetails = () => {
  const {
    id,
  } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const currentUserId = Number(
    user?.id ??
      user?.Id ??
      0
  );

  const role =
    user?.role ??
    user?.Role ??
    "User";

  const canManage =
    role === "Admin" ||
    role === "Manager";

  const [task, setTask] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [commentsLoading, setCommentsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [commentError, setCommentError] =
    useState("");

  const [commentText, setCommentText] =
    useState("");

  const [submittingComment, setSubmittingComment] =
    useState(false);

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [savingCommentId, setSavingCommentId] =
    useState(null);

  const [deletingCommentId, setDeletingCommentId] =
    useState(null);

  const [changingStatus, setChangingStatus] =
    useState(false);

  const [deletingTask, setDeletingTask] =
    useState(false);

  const [showActions, setShowActions] =
    useState(false);

  const loadTask = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getTask(id);

        setTask(response);
      } catch (err) {
        console.error(
          "Task loading failed:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load this task."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const loadComments = useCallback(
    async () => {
      try {
        setCommentsLoading(true);
        setCommentError("");

        const response =
          await getTaskComments(id);

        setComments(
          normalizeComments(response)
        );
      } catch (err) {
        console.error(
          "Comments loading failed:",
          err
        );

        setCommentError(
          getErrorMessage(
            err,
            "Unable to load comments."
          )
        );
      } finally {
        setCommentsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadTask();
    loadComments();
  }, [
    loadTask,
    loadComments,
  ]);

  const taskId = useMemo(
    () =>
      getValue(
        task,
        "id",
        "Id"
      ),
    [task]
  );

  const title = useMemo(
    () =>
      getValue(
        task,
        "title",
        "Title"
      ) ?? "Untitled task",
    [task]
  );

  const description = useMemo(
    () =>
      getValue(
        task,
        "description",
        "Description"
      ),
    [task]
  );

  const priority =
    getValue(
      task,
      "priority",
      "Priority"
    ) ?? "Medium";

  const status =
    getValue(
      task,
      "status",
      "Status"
    ) ?? "ToDo";

  const dueDate = getValue(
    task,
    "dueDate",
    "DueDate"
  );

  const assignedToId =
    getValue(
      task,
      "assignedToId",
      "AssignedToId"
    );

  const assignedToName =
    getValue(
      task,
      "assignedToName",
      "AssignedToName"
    );

  const teamName =
    getValue(
      task,
      "teamName",
      "TeamName"
    );

  const createdByName =
    getValue(
      task,
      "createdByName",
      "CreatedByName"
    );

  const createdAt =
    getValue(
      task,
      "createdAt",
      "CreatedAt"
    );

  const updatedAt =
    getValue(
      task,
      "updatedAt",
      "UpdatedAt"
    );

  const isOverdue =
    Boolean(
      dueDate &&
        status !== "Done" &&
        new Date(dueDate).getTime() <
          Date.now()
    );

  const canChangeStatus =
    role === "Admin" ||
    assignedToId ===
      currentUserId ||
    role === "Manager";

  const handleStatusChange =
    async (event) => {
      const nextStatus =
        event.target.value;

      if (
        !taskId ||
        nextStatus === status
      ) {
        return;
      }

      try {
        setChangingStatus(true);
        setError("");

        const updated =
          await updateTaskStatus(
            taskId,
            nextStatus
          );

        setTask(updated);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Unable to update task status."
          )
        );
      } finally {
        setChangingStatus(false);
      }
    };

  const handleDeleteTask =
    async () => {
      if (!taskId) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingTask(true);

        await deleteTask(taskId);

        navigate("/tasks");
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Unable to delete task."
          )
        );
      } finally {
        setDeletingTask(false);
      }
    };

  const handleCreateComment =
    async (event) => {
      event.preventDefault();

      const content =
        commentText.trim();

      if (!content) {
        setCommentError(
          "Comment cannot be empty."
        );
        return;
      }

      try {
        setSubmittingComment(true);
        setCommentError("");

        await createComment(
          taskId,
          content
        );

        setCommentText("");

        await loadComments();
      } catch (err) {
        setCommentError(
          getErrorMessage(
            err,
            "Unable to add comment."
          )
        );
      } finally {
        setSubmittingComment(false);
      }
    };

  const startEditingComment =
    (comment) => {
      const commentId =
        getValue(
          comment,
          "id",
          "Id"
        );

      const content =
        getValue(
          comment,
          "content",
          "Content"
        ) ?? "";

      setEditingCommentId(
        commentId
      );

      setEditingCommentText(
        content
      );
    };

  const cancelEditingComment =
    () => {
      setEditingCommentId(null);
      setEditingCommentText("");
    };

  const handleUpdateComment =
    async (commentId) => {
      const content =
        editingCommentText.trim();

      if (!content) {
        setCommentError(
          "Comment cannot be empty."
        );
        return;
      }

      try {
        setSavingCommentId(
          commentId
        );
        setCommentError("");

        await updateComment(
          commentId,
          content
        );

        cancelEditingComment();

        await loadComments();
      } catch (err) {
        setCommentError(
          getErrorMessage(
            err,
            "Unable to update comment."
          )
        );
      } finally {
        setSavingCommentId(null);
      }
    };

  const handleDeleteComment =
    async (comment) => {
      const commentId =
        getValue(
          comment,
          "id",
          "Id"
        );

      if (!commentId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this comment?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingCommentId(
          commentId
        );

        await deleteComment(
          commentId
        );

        await loadComments();
      } catch (err) {
        setCommentError(
          getErrorMessage(
            err,
            "Unable to delete comment."
          )
        );
      } finally {
        setDeletingCommentId(null);
      }
    };

  if (loading) {
    return (
      <div className="task-details-page">
        <div className="task-details-loading">
          <div className="task-details-spinner" />

          <p>
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-details-page">
        <div className="task-details-error-page">
          <div className="task-details-error-icon">
            <AlertTriangle
              size={24}
            />
          </div>

          <h2>
            Task unavailable
          </h2>

          <p>
            {error ||
              "We couldn't find this task."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/tasks")
            }
          >
            <ArrowLeft size={16} />
            Back to tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-details-page">
      <div className="task-details-topbar">
        <button
          type="button"
          className="task-back-button"
          onClick={() =>
            navigate("/tasks")
          }
        >
          <ArrowLeft size={16} />
          Back to tasks
        </button>

        <div className="task-details-actions">
          {canManage && (
            <>
              <button
                type="button"
                className="task-secondary-action"
                onClick={() =>
                  navigate(
                    `/tasks/${taskId}/edit`
                  )
                }
              >
                <Edit3 size={15} />
                Edit
              </button>

              <div className="task-detail-menu">
                <button
                  type="button"
                  className="task-secondary-icon"
                  onClick={() =>
                    setShowActions(
                      (current) =>
                        !current
                    )
                  }
                  aria-label="More actions"
                >
                  <MoreHorizontal
                    size={17}
                  />
                </button>

                {showActions && (
                  <div className="task-detail-dropdown">
                    <button
                      type="button"
                      className="danger"
                      onClick={
                        handleDeleteTask
                      }
                      disabled={
                        deletingTask
                      }
                    >
                      {deletingTask ? (
                        <LoaderCircle
                          size={14}
                          className="task-spin"
                        />
                      ) : (
                        <Trash2
                          size={14}
                        />
                      )}

                      Delete task
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="task-details-error">
          <AlertTriangle size={16} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="task-details-layout">
        <main>
          <section className="task-main-card">
            <div className="task-main-header">
              <div>
                <div className="task-main-badges">
                  <span
                    className={`priority-badge-large ${getPriorityClass(
                      priority
                    )}`}
                  >
                    <span />
                    {priority}
                  </span>

                  <span
                    className={`status-badge-large ${getStatusClass(
                      status
                    )}`}
                  >
                    {status ===
                      "Done" && (
                      <Check
                        size={13}
                      />
                    )}

                    {status ===
                      "InProgress" && (
                      <Clock3
                        size={13}
                      />
                    )}

                    {status ===
                      "ToDo" && (
                      <span className="status-dot" />
                    )}

                    {getStatusLabel(
                      status
                    )}
                  </span>
                </div>

                <h1>
                  {title}
                </h1>

                <p className="task-main-meta">
                  Created{" "}
                  {formatDateTime(
                    createdAt
                  )}
                </p>
              </div>
            </div>

            <div className="task-description-section">
              <h3>
                Description
              </h3>

              {description ? (
                <p>
                  {description}
                </p>
              ) : (
                <p className="task-no-description">
                  No description has been
                  added to this task.
                </p>
              )}
            </div>

            <div className="task-status-section">
              <div>
                <h3>
                  Task status
                </h3>

                <p>
                  Keep the task progress
                  up to date.
                </p>
              </div>

              {canChangeStatus ? (
                <div className="task-status-select">
                  {changingStatus && (
                    <LoaderCircle
                      size={15}
                      className="task-spin"
                    />
                  )}

                  <select
                    value={status}
                    onChange={
                      handleStatusChange
                    }
                    disabled={
                      changingStatus
                    }
                  >
                    {STATUS_OPTIONS.map(
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
              ) : (
                <span
                  className={`status-badge-large ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusLabel(
                    status
                  )}
                </span>
              )}
            </div>
          </section>

          <section className="comments-card">
            <div className="comments-header">
              <div>
                <span className="comments-kicker">
                  COLLABORATION
                </span>

                <h2>
                  Comments
                </h2>
              </div>

              <span className="comments-count">
                {comments.length}
              </span>
            </div>

            <form
              className="comment-form"
              onSubmit={
                handleCreateComment
              }
            >
              <div className="comment-avatar">
                {getInitials(
                  user?.fullName ??
                    user?.FullName ??
                    user?.name ??
                    "You"
                )}
              </div>

              <div className="comment-input-area">
                <textarea
                  value={commentText}
                  onChange={(event) => {
                    setCommentText(
                      event.target.value
                    );

                    if (commentError) {
                      setCommentError(
                        ""
                      );
                    }
                  }}
                  placeholder="Write a comment..."
                  rows="3"
                  disabled={
                    submittingComment
                  }
                />

                <div className="comment-form-bottom">
                  <span>
                    Share an update with
                    your team.
                  </span>

                  <button
                    type="submit"
                    disabled={
                      submittingComment ||
                      !commentText.trim()
                    }
                  >
                    {submittingComment ? (
                      <LoaderCircle
                        size={15}
                        className="task-spin"
                      />
                    ) : (
                      <Send
                        size={15}
                      />
                    )}

                    Comment
                  </button>
                </div>
              </div>
            </form>

            {commentError && (
              <div className="comment-error">
                <AlertTriangle
                  size={15}
                />

                {commentError}
              </div>
            )}

            {commentsLoading ? (
              <div className="comments-loading">
                <div className="task-details-spinner small" />
                <span>
                  Loading comments...
                </span>
              </div>
            ) : comments.length ===
              0 ? (
              <div className="comments-empty">
                <div>
                  <MessageCircle
                    size={20}
                  />
                </div>

                <h3>
                  No comments yet
                </h3>

                <p>
                  Start the conversation
                  around this task.
                </p>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map(
                  (comment) => {
                    const commentId =
                      getValue(
                        comment,
                        "id",
                        "Id"
                      );

                    const commentUserId =
                      getValue(
                        comment,
                        "userId",
                        "UserId"
                      );

                    const commentUserName =
                      getValue(
                        comment,
                        "userName",
                        "UserName"
                      ) ??
                      getValue(
                        comment,
                        "fullName",
                        "FullName"
                      ) ??
                      "Team member";

                    const content =
                      getValue(
                        comment,
                        "content",
                        "Content"
                      ) ?? "";

                    const commentCreatedAt =
                      getValue(
                        comment,
                        "createdAt",
                        "CreatedAt"
                      );

                    const isOwnComment =
                      Number(
                        commentUserId
                      ) ===
                      currentUserId;

                    const isEditing =
                      editingCommentId ===
                      commentId;

                    return (
                      <article
                        className="comment-item"
                        key={
                          commentId
                        }
                      >
                        <div className="comment-avatar">
                          {getInitials(
                            commentUserName
                          )}
                        </div>

                        <div className="comment-content">
                          <div className="comment-heading">
                            <div>
                              <strong>
                                {
                                  commentUserName
                                }
                              </strong>

                              <span>
                                {formatDateTime(
                                  commentCreatedAt
                                )}
                              </span>
                            </div>

                            {isOwnComment &&
                              !isEditing && (
                                <div className="comment-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingComment(
                                        comment
                                      )
                                    }
                                  >
                                    <Edit3
                                      size={
                                        13
                                      }
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() =>
                                      handleDeleteComment(
                                        comment
                                      )
                                    }
                                    disabled={
                                      deletingCommentId ===
                                      commentId
                                    }
                                  >
                                    {deletingCommentId ===
                                    commentId ? (
                                      <LoaderCircle
                                        size={
                                          13
                                        }
                                        className="task-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={
                                          13
                                        }
                                      />
                                    )}
                                  </button>
                                </div>
                              )}
                          </div>

                          {isEditing ? (
                            <div className="comment-edit-box">
                              <textarea
                                value={
                                  editingCommentText
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditingCommentText(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                rows="3"
                                autoFocus
                              />

                              <div>
                                <button
                                  type="button"
                                  className="comment-edit-cancel"
                                  onClick={
                                    cancelEditingComment
                                  }
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  className="comment-edit-save"
                                  onClick={() =>
                                    handleUpdateComment(
                                      commentId
                                    )
                                  }
                                  disabled={
                                    savingCommentId ===
                                    commentId
                                  }
                                >
                                  {savingCommentId ===
                                  commentId ? (
                                    <LoaderCircle
                                      size={
                                        13
                                      }
                                      className="task-spin"
                                    />
                                  ) : (
                                    <Check
                                      size={
                                        13
                                      }
                                    />
                                  )}

                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p>
                              {content}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </main>

        <aside className="task-sidebar">
          <section className="task-info-card">
            <div className="task-info-card-header">
              <h3>
                Task information
              </h3>
            </div>

            <div className="task-info-list">
              <div className="task-info-row">
                <span className="task-info-label">
                  <UserRound
                    size={15}
                  />
                  Assignee
                </span>

                <div className="task-info-value user">
                  <span className="info-avatar">
                    {getInitials(
                      assignedToName
                    )}
                  </span>

                  <span>
                    {assignedToName ??
                      "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="task-info-row">
                <span className="task-info-label">
                  <Users
                    size={15}
                  />
                  Team
                </span>

                <span className="task-info-value">
                  {teamName ??
                    "No team"}
                </span>
              </div>

              <div className="task-info-row">
                <span className="task-info-label">
                  <CalendarDays
                    size={15}
                  />
                  Due date
                </span>

                <span
                  className={
                    isOverdue
                      ? "task-info-value overdue"
                      : "task-info-value"
                  }
                >
                  {isOverdue && (
                    <AlertTriangle
                      size={13}
                    />
                  )}

                  {formatDate(
                    dueDate
                  )}
                </span>
              </div>

              <div className="task-info-row">
                <span className="task-info-label">
                  Created by
                </span>

                <span className="task-info-value">
                  {createdByName ??
                    "Unknown"}
                </span>
              </div>

              {updatedAt && (
                <div className="task-info-row">
                  <span className="task-info-label">
                    Last updated
                  </span>

                  <span className="task-info-value">
                    {formatDateTime(
                      updatedAt
                    )}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="task-progress-card">
            <div className="task-progress-icon">
              <Check size={17} />
            </div>

            <div>
              <strong>
                {status ===
                "Done"
                  ? "Task completed"
                  : status ===
                      "InProgress"
                    ? "Work in progress"
                    : "Ready to start"}
              </strong>

              <p>
                {status ===
                "Done"
                  ? "Great work. This task is complete."
                  : "Keep the status updated as work moves forward."}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TaskDetails;