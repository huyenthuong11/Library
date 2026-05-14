import api from "../lib/axios";
import { useState, useEffect } from "react";
export default function useChatHistory(readerId, limit) {
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const getChatHistory = async () => {
        if (!readerId) return;
        setLoading(true); 
        try{
            const response = await api.get(`/recommend/getChatHistory/${readerId}`, {
                params: {limit}
            });
            setChatHistory(response.data);
        } catch (err) {
            console.error("Get history error - useChatHistory.js:13", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(!readerId) {
            setChatHistory([]);
            setLoading(false);
            return;
        }
        getChatHistory();
    }, [readerId]);

    return { chatHistory, loading, refreshHistory: getChatHistory };
}