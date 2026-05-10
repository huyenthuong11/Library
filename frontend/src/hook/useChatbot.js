import { useState, useEffect } from "react";
import api from "../lib/axios";


export default function useChatbot(readerId, newestMessage) {
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [chatMessage, setChatMessage] = useState({
        message: "",
        role: "",
        createdAt: ""
    });
    const getChatbotRep = async () => {
        setIsBotTyping(true);
        try {
            const response = await api.post(`/recommend/chatbot/${readerId}`, {
                userMessage: newestMessage
            })

            setChatMessage(response.data);
        } catch (err) {
            console.error("AI reply error:  useSuggestion.js:56 - useChatbot.js:22", err);
        } finally {
            setIsBotTyping(false);
        }
    };
    
    useEffect(() => {
        if (!readerId || !newestMessage) {
            return;
        }
        getChatbotRep();
    }, [readerId, newestMessage]);


    return { chatMessage, isBotTyping };
}