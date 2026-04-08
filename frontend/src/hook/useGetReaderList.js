"use client";
import { useState, useEffect } from "react";
import api from "../lib/axios";

export default function useReaderList() {
    const [readerList, setReaderList] = useState([]);
    const getReaderList = async () => {
        try{
            const response = await api.get("/admin/readerProfile")
            const data = response.data;
            setReaderList(data);
        } catch (err) {
            console.error("Failed to fetch reader list: - useReaderList.js:20", err);
        }
    };

    useEffect(() => {
        console.log("run effect - useReaderList.js:24");
        getReaderList();
    }, []);

    return ({readerList, refreshReaderList: getReaderList});
}