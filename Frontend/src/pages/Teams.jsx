import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  LoaderCircle,
  Plus,
  Search,
  Shield,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  createTeam,
  getTeams,
} from "../Api/teamApi";

import {
  getErrorMessage,
} from "../Utils/helpers";

import {
  useAuth,
} from "../context/AuthContext";

import "./Teams.css";

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
      "name",
      "Name"
    ) ?? ""
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

const Teams = () => {
  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const role =
    user?.role ??
    user?.Role ??
    "User";

  const canCreateTeam =
    role === "Admin" ||
    role === "Manager";

  const [teams, setTeams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
    });

  const loadTeams =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getTeams();

          setTeams(
            Array.isArray(response)
              ? response
              : []
          );
        } catch (err) {
          console.error(
            "Failed to load teams:",
            err
          );

          setError(
            getErrorMessage(
              err,
              "Unable to load teams."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const filteredTeams =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return teams;
      }

      return teams.filter(
        (team) => {
          const name =
            getName(
              team
            ).toLowerCase();

          const description =
            getDescription(
              team
            ).toLowerCase();

          return (
            name.includes(term) ||
            description.includes(term)
          );
        }
      );
    },
    [search, teams]);

  const handleCreateChange =
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

      setCreateError("");
    };

  const handleCreateTeam =
    async (event) => {
      event.preventDefault();

      if (
        !formData.name.trim()
      ) {
        setCreateError(
          "Team name is required."
        );

        return;
      }

      try {
        setCreating(true);
        setCreateError("");

        await createTeam({
          name:
            formData.name.trim(),

          description:
            formData.description.trim() ||
            null,
        });

        setFormData({
          name: "",
          description: "",
        });

        setShowCreate(false);

        await loadTeams();
      } catch (err) {
        console.error(
          "Failed to create team:",
          err
        );

        setCreateError(
          getErrorMessage(
            err,
            "Unable to create team."
          )
        );
      } finally {
        setCreating(false);
      }
    };

  return (
    <div className="teams-page">
      <header className="teams-header">
        <div>
          <div className="teams-eyebrow">
            <Sparkles size={12} />
            WORKSPACE
          </div>

          <h1>
            Teams
          </h1>

          <p>
            Organize people around the
            work that matters.
          </p>
        </div>

        {canCreateTeam && (
          <button
            type="button"
            className="teams-create-button"
            onClick={() =>
              setShowCreate(true)
            }
          >
            <Plus size={16} />
            Create team
          </button>
        )}
      </header>

      <section className="teams-toolbar">
        <div className="teams-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="teams-count">
          <UsersRound size={15} />

          {teams.length}{" "}
          {teams.length === 1
            ? "team"
            : "teams"}
        </div>
      </section>

      {error && (
        <div className="teams-alert error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="teams-loading">
          <LoaderCircle
            size={26}
            className="teams-spinner"
          />

          <p>
            Loading your teams...
          </p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="teams-empty">
          <div className="teams-empty-icon">
            <UsersRound size={25} />
          </div>

          <h2>
            {search
              ? "No teams found"
              : "No teams yet"}
          </h2>

          <p>
            {search
              ? "Try a different search term."
              : "Create your first team to start organizing your workspace."}
          </p>

          {!search &&
            canCreateTeam && (
              <button
                type="button"
                onClick={() =>
                  setShowCreate(true)
                }
              >
                <Plus size={15} />
                Create your first team
              </button>
            )}
        </div>
      ) : (
        <section className="teams-grid">
          {filteredTeams.map(
            (team) => {
              const teamId =
                getId(team);

              return (
                <article
                  className="team-card"
                  key={teamId}
                  onClick={() =>
                    navigate(
                      `/teams/${teamId}`
                    )
                  }
                >
                  <div className="team-card-top">
                    <div className="team-avatar">
                      {getName(
                        team
                      )
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <span className="team-card-arrow">
                      <ArrowRight
                        size={15}
                      />
                    </span>
                  </div>

                  <div className="team-card-body">
                    <h2>
                      {getName(
                        team
                      )}
                    </h2>

                    <p>
                      {getDescription(
                        team
                      ) ||
                        "No description provided for this team."}
                    </p>
                  </div>

                  <div className="team-card-divider" />

                  <div className="team-card-footer">
                    <div className="team-card-stat">
                      <UsersRound
                        size={14}
                      />

                      <span>
                        {getMemberCount(
                          team
                        )}{" "}
                        {getMemberCount(
                          team
                        ) === 1
                          ? "member"
                          : "members"}
                      </span>
                    </div>

                    <div className="team-card-owner">
                      <span>
                        Managed by
                      </span>

                      <strong>
                        {getCreatedByName(
                          team
                        )}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      {showCreate && (
        <div
          className="teams-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCreate(false);
            }
          }}
        >
          <div className="teams-modal">
            <div className="teams-modal-header">
              <div>
                <div className="teams-modal-icon">
                  <UsersRound
                    size={18}
                  />
                </div>

                <h2>
                  Create a team
                </h2>

                <p>
                  Give your team a clear
                  identity.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="teams-alert error modal-alert">
                <AlertTriangle
                  size={15}
                />
                {createError}
              </div>
            )}

            <form
              className="teams-create-form"
              onSubmit={
                handleCreateTeam
              }
            >
              <div className="teams-field">
                <label htmlFor="team-name">
                  Team name
                  <span>*</span>
                </label>

                <input
                  id="team-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Product Engineering"
                  value={
                    formData.name
                  }
                  onChange={
                    handleCreateChange
                  }
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="teams-field">
                <label htmlFor="team-description">
                  Description
                </label>

                <textarea
                  id="team-description"
                  name="description"
                  placeholder="What does this team work on?"
                  value={
                    formData.description
                  }
                  onChange={
                    handleCreateChange
                  }
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="teams-modal-actions">
                <button
                  type="button"
                  className="teams-cancel-button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teams-save-button"
                  disabled={creating}
                >
                  {creating ? (
                    <LoaderCircle
                      size={15}
                      className="teams-spinner"
                    />
                  ) : (
                    <Check
                      size={15}
                    />
                  )}

                  {creating
                    ? "Creating..."
                    : "Create team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;