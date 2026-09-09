import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../Api/notificationApi";

import { getErrorMessage } from "../Utils/helpers";

import "./Notifications.css";

const notificationIcons = {
  TaskAssigned: Check,
  TaskStatusChanged: RefreshCw,
};

const formatNotificationDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getNotificationLabel = (type) => {
  switch (type) {
    case "TaskAssigned":
      return "Task assigned";

    case "TaskStatusChanged":
      return "Status updated";

    default:
      return "Notification";
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const data = await getNotifications();

        setNotifications(
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
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;
  }, [notifications]);

  const filteredNotifications =
    useMemo(() => {
      if (filter === "unread") {
        return notifications.filter(
          (notification) =>
            !notification.isRead
        );
      }

      if (filter === "read") {
        return notifications.filter(
          (notification) =>
            notification.isRead
        );
      }

      return notifications;
    }, [notifications, filter]);

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      setActionId(notificationId);
      setError("");

      await markNotificationAsRead(
        notificationId
      );

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAllAsRead =
    async () => {
      if (unreadCount === 0) {
        return;
      }

      try {
        setMarkingAll(true);
        setError("");

        await markAllNotificationsAsRead();

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setMarkingAll(false);
      }
    };

  return (
    <div className="notifications-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="notifications-header">
        <div>
          <span className="page-eyebrow">
            <Bell size={14} />
            WORKSPACE
          </span>

          <h1>Notifications</h1>

          <p>
            Stay up to date with assignments
            and task activity.
          </p>
        </div>

        <button
          type="button"
          className="notifications-refresh"
          onClick={() =>
            loadNotifications(false)
          }
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2
              size={16}
              className="spin"
            />
          ) : (
            <RefreshCw size={16} />
          )}

          Refresh
        </button>
      </div>

      {/* =====================================================
          STATS + FILTERS
      ===================================================== */}

      <div className="notifications-toolbar">
        <div className="notification-stats">
          <div className="notification-stat">
            <span className="notification-stat-icon">
              <Bell size={17} />
            </span>

            <div>
              <strong>
                {notifications.length}
              </strong>

              <span>
                Total notifications
              </span>
            </div>
          </div>

          <div className="notification-stat">
            <span className="notification-stat-icon unread">
              <Clock3 size={17} />
            </span>

            <div>
              <strong>
                {unreadCount}
              </strong>

              <span>
                Unread
              </span>
            </div>
          </div>
        </div>

        <div className="notifications-actions">
          <div className="notification-filters">
            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "unread"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("unread")
              }
            >
              Unread

              {unreadCount > 0 && (
                <span>
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={
                filter === "read"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("read")
              }
            >
              Read
            </button>
          </div>

          <button
            type="button"
            className="mark-all-button"
            onClick={
              handleMarkAllAsRead
            }
            disabled={
              markingAll ||
              unreadCount === 0
            }
          >
            {markingAll ? (
              <Loader2
                size={16}
                className="spin"
              />
            ) : (
              <CheckCheck size={16} />
            )}

            Mark all as read
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="notifications-error">
          <div>
            <X size={17} />
          </div>

          <div>
            <strong>
              Something went wrong
            </strong>

            <span>
              {error}
            </span>
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
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="notifications-loading">
          <Loader2
            size={28}
            className="spin"
          />

          <span>
            Loading notifications...
          </span>
        </div>
      ) : filteredNotifications.length ===
        0 ? (
        /* ===================================================
           EMPTY STATE
        =================================================== */

        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={28} />
          </div>

          <h2>
            {filter === "unread"
              ? "You're all caught up"
              : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
          </h2>

          <p>
            {filter === "unread"
              ? "There are no unread notifications waiting for you."
              : filter === "read"
                ? "Notifications you have read will appear here."
                : "Task assignments and status updates will appear here."}
          </p>
        </div>
      ) : (
        /* ===================================================
           NOTIFICATION LIST
        =================================================== */

        <div className="notifications-list">
          {filteredNotifications.map(
            (notification) => {
              const Icon =
                notificationIcons[
                  notification.type
                ] || Bell;

              return (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.isRead
                      ? "read"
                      : "unread"
                  }`}
                >
                  {/* ICON */}

                  <div
                    className={`notification-icon ${
                      notification.type ===
                      "TaskAssigned"
                        ? "assigned"
                        : "status"
                    }`}
                  >
                    <Icon size={19} />
                  </div>

                  {/* CONTENT */}

                  <div className="notification-content">
                    <div className="notification-card-top">
                      <div>
                        <span className="notification-type">
                          {getNotificationLabel(
                            notification.type
                          )}
                        </span>

                        {!notification.isRead && (
                          <span className="new-badge">
                            New
                          </span>
                        )}
                      </div>

                      <time>
                        {formatNotificationDate(
                          notification.createdAt
                        )}
                      </time>
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <div className="notification-meta">
                      {notification.taskId && (
                        <span>
                          <ShieldCheck
                            size={14}
                          />

                          Task #
                          {
                            notification.taskId
                          }
                        </span>
                      )}

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification.id
                            )
                          }
                          disabled={
                            actionId ===
                            notification.id
                          }
                        >
                          {actionId ===
                          notification.id ? (
                            <Loader2
                              size={14}
                              className="spin"
                            />
                          ) : (
                            <Check size={14} />
                          )}

                          Mark as read
                        </button>
                      )}

                      {notification.isRead && (
                        <span className="read-label">
                          <CheckCheck
                            size={14}
                          />

                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;