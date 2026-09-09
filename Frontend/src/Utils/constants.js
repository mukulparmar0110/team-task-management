export const API_BASE_URL = "http://localhost:5138/api";

export const USER_ROLES = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  USER: "User",
};

export const TASK_STATUS = {
  TODO: "ToDo",
  IN_PROGRESS: "InProgress",
  DONE: "Done",
};

export const TASK_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const NAVIGATION_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: "CheckSquare",
  },
  {
    label: "Teams",
    path: "/teams",
    icon: "Users",
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: "Bell",
  },
];