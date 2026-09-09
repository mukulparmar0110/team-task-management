import api from "./axios";

export const getTasks = async (filters = {}) => {
  const params = {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
  };

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
    filters.assignedToId !== undefined &&
    filters.assignedToId !== null &&
    filters.assignedToId !== ""
  ) {
    params.assignedToId =
      filters.assignedToId;
  }

  if (
    filters.teamId !== undefined &&
    filters.teamId !== null &&
    filters.teamId !== ""
  ) {
    params.teamId = filters.teamId;
  }

  const response = await api.get(
    "/Tasks",
    {
      params,
    }
  );

  return response.data;
};

export const getTask = async (taskId) => {
  const response = await api.get(
    `/Tasks/${taskId}`
  );

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post(
    "/Tasks",
    taskData
  );

  return response.data;
};

export const updateTask = async (
  taskId,
  taskData
) => {
  const response = await api.put(
    `/Tasks/${taskId}`,
    taskData
  );

  return response.data;
};

export const updateTaskStatus = async (
  taskId,
  status
) => {
  const response = await api.put(
    `/Tasks/${taskId}/status`,
    {
      status,
    }
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(
    `/Tasks/${taskId}`
  );

  return response.data;
};