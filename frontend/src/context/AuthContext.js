"use client";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");
        if (token && userString) {
            try {
                setUser(JSON.parse(userString));
            } catch (error) {
                console.error("Failed to parse user from localStorage - AuthContext.js:16", error);
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("account", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };
    return(
        <AuthContext.Provider value ={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}