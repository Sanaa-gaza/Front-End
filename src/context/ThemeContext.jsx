import React, { createContext, useContext } from "react";
import useDarkMode from "../hooks/useDarkMode";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const { theme, toggleTheme } = useDarkMode();
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
