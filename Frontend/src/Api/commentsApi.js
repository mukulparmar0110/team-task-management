import api from "./axios";

// =========================================================
// GET COMMENTS FOR A TASK
// GET: /api/Comments/task/{taskId}
// =========================================================

export const getTaskComments = async (taskId) => {
  const response = await api.get(
    `/Comments/task/${taskId}`
  );

  return response.data;
};

// =========================================================
// CREATE COMMENT
// POST: /api/Comments/task/{taskId}
// =========================================================

export const createComment = async (
  taskId,
  content
) => {
  const response = await api.post(
    `/Comments/task/${taskId}`,
    {
      content,
    }
  );

  return response.data;
};

// =========================================================
// UPDATE COMMENT
// PUT: /api/Comments/{id}
// =========================================================

export const updateComment = async (
  commentId,
  content
) => {
  const response = await api.put(
    `/Comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
};

// =========================================================
// DELETE COMMENT
// DELETE: /api/Comments/{id}
// =========================================================

export const deleteComment = async (
  commentId
) => {
  const response = await api.delete(
    `/Comments/${commentId}`
  );

  return response.data;
};