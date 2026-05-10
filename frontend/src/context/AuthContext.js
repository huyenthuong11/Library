"use client";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export default function AuthProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        const accountString = localStorage.getItem("account");
        if (token && accountString) {
            try {
                setAccount(JSON.parse(accountString));
            } catch (error) {
                console.error("Failed to parse account from localStorage - AuthContext.js:16", error);
                localStorage.removeItem("account");
            }
        }
        setLoading(false);
    }, []);

    const login = (accountData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("account", JSON.stringify(accountData));
        setAccount(accountData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("account");
        setAccount(null);
    };
    return(
        <AuthContext.Provider value ={{ account, setAccount, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}