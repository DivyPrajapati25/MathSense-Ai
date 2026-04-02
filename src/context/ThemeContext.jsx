import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const STORAGE_KEY = "mathsense-theme";

const getSystemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getInitialPreference = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
  } catch {}
  return "system";
};

const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(getInitialPreference);
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const pref = getInitialPreference();
    return pref === "system" ? getSystemTheme() : pref;
  });

  // Apply theme to DOM and persist preference
  useEffect(() => {
    const theme = preference === "system" ? getSystemTheme() : preference;
    setResolvedTheme(theme);
    applyThemeToDOM(theme);
    try { localStorage.setItem(STORAGE_KEY, preference); } catch {}
  }, [preference]);

  // Listen for OS theme changes when preference is "system"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const theme = e.matches ? "dark" : "light";
      setResolvedTheme(theme);
      applyThemeToDOM(theme);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setTheme = useCallback((newPref) => setPreference(newPref), []);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const current = prev === "system" ? getSystemTheme() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, preference, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
