import api from "./axios";

// =========================================================
// GET ALL USERS
// GET: /api/Users
// Admin only
// =========================================================

export const getUsers = async () => {
  const response = await api.get(
    "/Users"
  );

  return response.data;
};

// =========================================================
// GET SINGLE USER
// GET: /api/Users/{id}
// Admin or current user
// =========================================================

export const getUser = async (userId) => {
  const response = await api.get(
    `/Users/${userId}`
  );

  return response.data;
};

// =========================================================
// UPDATE USER ROLE
// PUT: /api/Users/{id}/role
// Admin only
// =========================================================

export const updateUserRole = async (
  userId,
  role
) => {
  const response = await api.put(
    `/Users/${userId}/role`,
    {
      role,
    }
  );

  return response.data;
};

// =========================================================
// UPDATE USER STATUS
// PUT: /api/Users/{id}/status?isActive=true/false
// Admin only
// =========================================================

export const updateUserStatus = async (
  userId,
  isActive
) => {
  const response = await api.put(
    `/Users/${userId}/status`,
    null,
    {
      params: {
        isActive,
      },
    }
  );

  return response.data;
};