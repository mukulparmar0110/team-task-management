import api from "./axios";

export const loginUser = async (credentials) => {
  const response = await api.post("/Auth/login", credentials);

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/Auth/register", userData);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/Auth/me");

  return response.data;
};