export const formatDate = (date) => {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === "Done") {
    return false;
  }

  return new Date(dueDate) < new Date();
};

export const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export const capitalize = (value = "") => {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.title) {
    return error.response.data.title;
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};