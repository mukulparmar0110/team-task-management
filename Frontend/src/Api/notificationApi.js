import api from "./axios";

export const getNotifications = async () => {
  const response = await api.get("/Notifications");

  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/Notifications/unread");

  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(
    `/Notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put(
    "/Notifications/read-all"
  );

  return response.data;
};