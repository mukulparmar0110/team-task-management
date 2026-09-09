import {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    /*
     * Theme switching is currently disabled.
     * The application always uses the light theme.
     */

    localStorage.setItem("theme", "light");

    document.documentElement.setAttribute(
      "data-theme",
      "light"
    );
  }, []);

  const value = useMemo(
    () => ({
      theme: "light",
      appliedTheme: "light",

      // Kept for compatibility with existing Settings code.
      // Theme switching is intentionally disabled.
      setTheme: () => {},
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
};