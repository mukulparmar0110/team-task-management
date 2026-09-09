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
  LoaderCircle,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  addTeamMember,
  deleteTeam,
  getTeam,
  getTeamMembers,
  removeTeamMember,
} from "../Api/teamApi";

import {
  getUsers,
} from "../Api/userApi";

import {
  getErrorMessage,
} from "../Utils/helpers";

import {
  useAuth,
} from "../context/AuthContext";

import "./TeamDetails.css";

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

const getUserId = (object) => {
  return getValue(
    object,
    "userId",
    "UserId"
  );
};

const getName = (object) => {
  return (
    getValue(
      object,
      "name",
      "Name"
    ) ??
    getValue(
      object,
      "fullName",
      "FullName"
    ) ??
    ""
  );
};

const getEmail = (object) => {
  return (
    getValue(
      object,
      "email",
      "Email"
    ) ?? ""
  );
};

const getRole = (object) => {
  return (
    getValue(
      object,
      "role",
      "Role"
    ) ?? "User"
  );
};

const getCreatedById = (
  object
) => {
  return getValue(
    object,
    "createdById",
    "CreatedById"
  );
};

const getCreatedByName = (
  object
) => {
  return (
    getValue(
      object,
      "createdByName",
      "CreatedByName"
    ) ?? "Unknown"
  );
};

const getDescription = (
  object
) => {
  return (
    getValue(
      object,
      "description",
      "Description"
    ) ?? ""
  );
};

const getMemberCount = (
  object
) => {
  return (
    getValue(
      object,
      "memberCount",
      "MemberCount"
    ) ?? 0
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const TeamDetails = () => {
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

  const currentUserId =
    Number(
      user?.id ??
      user?.Id
    );

  const isAdmin =
    role === "Admin";

  const isManager =
    role === "Manager";

  const [team, setTeam] =
    useState(null);

  const [members, setMembers] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [memberError, setMemberError] =
    useState("");

  const [showAddMember, setShowAddMember] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [addingMember, setAddingMember] =
    useState(false);

  const [removingUserId, setRemovingUserId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const loadTeam =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            teamResponse,
            membersResponse,
          ] = await Promise.all([
            getTeam(id),
            getTeamMembers(id),
          ]);

          setTeam(
            teamResponse
          );

          setMembers(
            Array.isArray(
              membersResponse
            )
              ? membersResponse
              : []
          );
        } catch (err) {
          console.error(
            "Failed to load team:",
            err
          );

          setError(
            getErrorMessage(
              err,
              "Unable to load team."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    const loadUsers =
      async () => {
        if (
          !isAdmin &&
          !isManager
        ) {
          return;
        }

        try {
          const response =
            await getUsers();

          setUsers(
            Array.isArray(
              response
            )
              ? response
              : Array.isArray(
                  response?.users
                )
              ? response.users
              : []
          );
        } catch (err) {
          console.error(
            "Failed to load users:",
            err
          );
        }
      };

    loadUsers();
  }, [
    isAdmin,
    isManager,
  ]);

  const canManageMembers =
    isAdmin ||
    (
      isManager &&
      Number(
        getCreatedById(
          team
        )
      ) === currentUserId
    );

  const canDelete =
    isAdmin;

  const availableUsers =
    useMemo(() => {
      const memberIds =
        new Set(
          members.map(
            (member) =>
              Number(
                getUserId(
                  member
                )
              )
          )
        );

      return users.filter(
        (userItem) =>
          !memberIds.has(
            Number(
              getId(
                userItem
              )
            )
          )
      );
    }, [
      members,
      users,
    ]);

  const handleAddMember =
    async (event) => {
      event.preventDefault();

      if (!selectedUserId) {
        setMemberError(
          "Please select a user."
        );

        return;
      }

      try {
        setAddingMember(true);
        setMemberError("");

        await addTeamMember(
          id,
          selectedUserId
        );

        setSelectedUserId("");
        setShowAddMember(false);

        await loadTeam();
      } catch (err) {
        console.error(
          "Failed to add member:",
          err
        );

        setMemberError(
          getErrorMessage(
            err,
            "Unable to add this user."
          )
        );
      } finally {
        setAddingMember(false);
      }
    };

  const handleRemoveMember =
    async (userId) => {
      const member =
        members.find(
          (item) =>
            Number(
              getUserId(item)
            ) === Number(userId)
        );

      const memberName =
        getName(member) ||
        "this member";

      const confirmed =
        window.confirm(
          `Remove ${memberName} from this team?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setRemovingUserId(
          userId
        );
        setMemberError("");

        await removeTeamMember(
          id,
          userId
        );

        await loadTeam();
      } catch (err) {
        console.error(
          "Failed to remove member:",
          err
        );

        setMemberError(
          getErrorMessage(
            err,
            "Unable to remove this member."
          )
        );
      } finally {
        setRemovingUserId(
          null
        );
      }
    };

  const handleDeleteTeam =
    async () => {
      const confirmed =
        window.confirm(
          `Delete "${getName(team)}"? This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setDeleteError("");

        await deleteTeam(id);

        navigate(
          "/teams",
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "Failed to delete team:",
          err
        );

        setDeleteError(
          getErrorMessage(
            err,
            "Unable to delete this team."
          )
        );
      } finally {
        setDeleting(false);
      }
    };

  if (loading) {
    return (
      <div className="team-details-page">
        <div className="team-details-loading">
          <LoaderCircle
            size={27}
            className="team-details-spinner"
          />

          <p>
            Loading team...
          </p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-details-page">
        <div className="team-details-error-page">
          <div className="team-details-error-icon">
            <AlertTriangle size={22} />
          </div>

          <h2>
            Team unavailable
          </h2>

          <p>
            {error ||
              "This team could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/teams"
              )
            }
          >
            <ArrowLeft size={15} />
            Back to teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-details-page">
      <div className="team-details-topbar">
        <button
          type="button"
          className="team-details-back"
          onClick={() =>
            navigate(
              "/teams"
            )
          }
        >
          <ArrowLeft size={15} />
          Back to teams
        </button>

        {canDelete && (
          <button
            type="button"
            className="team-delete-button"
            onClick={
              handleDeleteTeam
            }
            disabled={deleting}
          >
            {deleting ? (
              <LoaderCircle
                size={14}
                className="team-details-spinner"
              />
            ) : (
              <Trash2 size={14} />
            )}

            {deleting
              ? "Deleting..."
              : "Delete team"}
          </button>
        )}
      </div>

      {error && (
        <div className="team-details-alert">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {deleteError && (
        <div className="team-details-alert">
          <AlertTriangle size={15} />
          {deleteError}
        </div>
      )}

      <section className="team-hero">
        <div className="team-hero-avatar">
          {getName(team)
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="team-hero-content">
          <div className="team-hero-eyebrow">
            TEAM WORKSPACE
          </div>

          <h1>
            {getName(team)}
          </h1>

          <p>
            {getDescription(team) ||
              "No description provided for this team."}
          </p>

          <div className="team-hero-meta">
            <span>
              <UsersRound size={13} />
              {getMemberCount(team)}{" "}
              {getMemberCount(team) === 1
                ? "member"
                : "members"}
            </span>

            <span>
              <CalendarDays size={13} />
              Created{" "}
              {formatDate(
                getValue(
                  team,
                  "createdAt",
                  "CreatedAt"
                )
              )}
            </span>
          </div>
        </div>

        <div className="team-hero-owner">
          <span>
            TEAM LEAD
          </span>

          <strong>
            {getCreatedByName(team)}
          </strong>

          <small>
            {canManageMembers
              ? "You can manage members"
              : "View-only access"}
          </small>
        </div>
      </section>

      <section className="team-members-card">
        <div className="team-members-header">
          <div>
            <div className="team-section-label">
              PEOPLE
            </div>

            <h2>
              Team members
            </h2>

            <p>
              Everyone currently working
              with this team.
            </p>
          </div>

          {canManageMembers && (
            <button
              type="button"
              className="team-add-button"
              onClick={() => {
                setMemberError("");
                setShowAddMember(true);
              }}
            >
              <Plus size={15} />
              Add member
            </button>
          )}
        </div>

        {memberError && (
          <div className="team-details-alert member-alert">
            <AlertTriangle size={15} />
            {memberError}
          </div>
        )}

        {members.length === 0 ? (
          <div className="team-members-empty">
            <div>
              <UsersRound size={21} />
            </div>

            <h3>
              No members yet
            </h3>

            <p>
              Add people to start
              collaborating with this team.
            </p>

            {canManageMembers && (
              <button
                type="button"
                onClick={() =>
                  setShowAddMember(true)
                }
              >
                <Plus size={14} />
                Add first member
              </button>
            )}
          </div>
        ) : (
          <div className="team-members-list">
            {members.map(
              (member) => {
                const memberId =
                  getUserId(member);

                return (
                  <div
                    className="team-member-row"
                    key={memberId}
                  >
                    <div className="team-member-avatar">
                      {getName(member)
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="team-member-info">
                      <strong>
                        {getName(member)}
                      </strong>

                      <span>
                        <Mail size={11} />
                        {getEmail(member)}
                      </span>
                    </div>

                    <div className="team-member-role">
                      <Shield size={11} />
                      {getRole(member)}
                    </div>

                    <div className="team-member-joined">
                      Joined{" "}
                      {formatDate(
                        getValue(
                          member,
                          "joinedAt",
                          "JoinedAt"
                        )
                      )}
                    </div>

                    {canManageMembers && (
                      <button
                        type="button"
                        className="team-member-remove"
                        title="Remove member"
                        onClick={() =>
                          handleRemoveMember(
                            memberId
                          )
                        }
                        disabled={
                          removingUserId ===
                          memberId
                        }
                      >
                        {removingUserId ===
                        memberId ? (
                          <LoaderCircle
                            size={14}
                            className="team-details-spinner"
                          />
                        ) : (
                          <UserMinus
                            size={14}
                          />
                        )}
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {showAddMember && (
        <div
          className="team-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAddMember(false);
            }
          }}
        >
          <div className="team-modal">
            <div className="team-modal-header">
              <div>
                <div className="team-modal-icon">
                  <UsersRound size={18} />
                </div>

                <h2>
                  Add team member
                </h2>

                <p>
                  Choose someone from your
                  workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddMember(false)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                handleAddMember
              }
              className="team-add-form"
            >
              <label htmlFor="team-member">
                Select user
              </label>

              <select
                id="team-member"
                value={
                  selectedUserId
                }
                onChange={(event) =>
                  setSelectedUserId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select a user
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
                      )}{" "}
                      —{" "}
                      {getEmail(
                        userItem
                      )}
                    </option>
                  )
                )}
              </select>

              {availableUsers.length ===
                0 && (
                <p className="team-no-users">
                  All available users are
                  already members of this team.
                </p>
              )}

              <div className="team-modal-actions">
                <button
                  type="button"
                  className="team-modal-cancel"
                  onClick={() =>
                    setShowAddMember(false)
                  }
                  disabled={addingMember}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="team-modal-submit"
                  disabled={
                    addingMember ||
                    !selectedUserId
                  }
                >
                  {addingMember ? (
                    <LoaderCircle
                      size={14}
                      className="team-details-spinner"
                    />
                  ) : (
                    <Check size={14} />
                  )}

                  {addingMember
                    ? "Adding..."
                    : "Add member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;