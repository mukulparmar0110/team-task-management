import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../Api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  const saveSession = useCallback(
    (sessionToken, sessionUser) => {
      localStorage.setItem("token", sessionToken);

      localStorage.setItem(
        "user",
        JSON.stringify(sessionUser)
      );

      setToken(sessionToken);
      setUser(sessionUser);
    },
    []
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginUser(credentials);

      const sessionToken =
        data.token ?? data.accessToken;

      const sessionUser =
        data.user ?? data;

      if (!sessionToken) {
        throw new Error(
          "Login succeeded but no authentication token was returned."
        );
      }

      saveSession(sessionToken, sessionUser);

      return sessionUser;
    },
    [saveSession]
  );

  const register = useCallback(async (userData) => {
    return registerUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return null;
    }

    try {
      const currentUser = await getCurrentUser();

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );

      setUser(currentUser);

      return currentUser;
    } catch {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};