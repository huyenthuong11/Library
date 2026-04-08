"use client";
import { useState, useEffect } from "react";
import api from "../lib/axios";

export default function useLocationList() {
    const [locationList, setLocationList] = useState([]);
    const getLocationList = async () => {
        try{
            const response = await api.get("/admin/availableLocationList")
            const data = response.data;
            setLocationList(data);
        } catch (err) {
            console.error("Failed to fetch publisher info: - useLocationList.js:20", err);
        }
    };

    useEffect(() => {
        console.log("run effect - useLocationList.js:24");
        getLocationList();
    }, []);

    return ({locationList, refreshLocationList: getLocationList});
}