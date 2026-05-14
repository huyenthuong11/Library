"use client";
import { AuthContext } from "@/context/AuthContext";
import { useState, useEffect, useContext } from "react";
import api from "../lib/axios";

export default function useLibrarianInfo(accountId) {
    const [librarianInfo, setLibrarianInfo] = useState([]);
    const { account } = useContext(AuthContext);
    const getLibrarianInfo = async () => {
        try {
            const response = await api.get("/librarian/librarianProfile", {
                params: {
                    accountId: account?.id,
                }
            });
            const data = response.data;
            setLibrarianInfo(data);
            console.log("DATA:  page.js:52 - useLibrarianInfo.js:18", data);
        } catch (err) {
            console.error("Failed to fetch librarian info:  page.js:54 - useLibrarianInfo.js:20", err);
        }
    }

    useEffect(() => {
        if(!accountId) {
            return;
        }
        getLibrarianInfo();
    }, [accountId]);

    const fullName = librarianInfo.fullName;
    const avatar = librarianInfo.avatar;
    return {fullName, avatar, refreshLibrarianInfo: getLibrarianInfo};
}