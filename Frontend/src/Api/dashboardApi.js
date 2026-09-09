import api from "./axios";

export const getDashboard = async (filters = {}) => {
  const params = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.priority) {
    params.priority = filters.priority;
  }

  if (filters.dueAfter) {
    params.dueAfter = filters.dueAfter;
  }

  if (filters.dueBefore) {
    params.dueBefore = filters.dueBefore;
  }

  if (
    filters.teamId !== undefined &&
    filters.teamId !== null &&
    filters.teamId !== ""
  ) {
    params.teamId = filters.teamId;
  }

  if (
    filters.assignedToId !== undefined &&
    filters.assignedToId !== null &&
    filters.assignedToId !== ""
  ) {
    params.assignedToId =
      filters.assignedToId;
  }

  const response = await api.get(
    "/Dashboard",
    {
      params,
    }
  );

  return response.data;
};