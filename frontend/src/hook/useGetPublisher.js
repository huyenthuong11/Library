"use client";
import { useState, useEffect } from "react";
import api from "../lib/axios";

export default function usePublisherInfo() {
    const [publisherInfo, setPublisherInfo] = useState([]);
    const getPublisherInfo = async () => {
        try{
            const response = await api.get("/publisher/getPublisherProfile")
            const data = response.data;
            setPublisherInfo(data);
        } catch (err) {
            console.error("Failed to fetch publisher info: - usePublisherInfo.js:20", err);
        }
    };

    useEffect(() => {
        console.log("run effect - usePublisherInfo.js:24");
        getPublisherInfo();
    }, []);

    return ({publisherInfo, refreshPublisherInfo: getPublisherInfo});
}