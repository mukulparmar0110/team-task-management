import api from "./axios";

// =========================================================
// GET ALL TEAMS
// GET: /api/Teams
// =========================================================

export const getTeams = async () => {
  const response = await api.get("/Teams");

  return response.data;
};

// =========================================================
// GET SINGLE TEAM
// GET: /api/Teams/{id}
// =========================================================

export const getTeam = async (teamId) => {
  const response = await api.get(
    `/Teams/${teamId}`
  );

  return response.data;
};

// =========================================================
// CREATE TEAM
// POST: /api/Teams
// =========================================================

export const createTeam = async (teamData) => {
  const response = await api.post(
    "/Teams",
    teamData
  );

  return response.data;
};

// =========================================================
// GET TEAM MEMBERS
// GET: /api/Teams/{id}/members
// =========================================================

export const getTeamMembers = async (teamId) => {
  const response = await api.get(
    `/Teams/${teamId}/members`
  );

  return response.data;
};

// =========================================================
// ADD TEAM MEMBER
// POST: /api/Teams/{id}/members
// =========================================================

export const addTeamMember = async (
  teamId,
  userId
) => {
  const response = await api.post(
    `/Teams/${teamId}/members`,
    {
      userId: Number(userId),
    }
  );

  return response.data;
};

// =========================================================
// REMOVE TEAM MEMBER
// DELETE: /api/Teams/{id}/members/{userId}
// =========================================================

export const removeTeamMember = async (
  teamId,
  userId
) => {
  const response = await api.delete(
    `/Teams/${teamId}/members/${userId}`
  );

  return response.data;
};

// =========================================================
// DELETE TEAM
// DELETE: /api/Teams/{id}
// =========================================================

export const deleteTeam = async (teamId) => {
  const response = await api.delete(
    `/Teams/${teamId}`
  );

  return response.data;
};