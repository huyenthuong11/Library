"use client";
import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import useChatHistory from '@/hook/useChatHistory';
import useChatbot from '@/hook/useChatbot';

export default function Chatbot({readerId}) {
    const { chatHistory, loading, refreshHistory } = useChatHistory(readerId, 10);
    const [userMessage, setUserMessage] = useState("");
    const [ newestMessage, setNewestMessage] = useState("");
    const { chatMessage, isBotTyping } = useChatbot(readerId, newestMessage);
    const [isOpen, setIsOpen] = useState(false);
    const [displayMessages, setDisplayMessages] = useState([]);
    const scrollRef = useRef(null);
    
    useEffect(() => {
        setDisplayMessages(chatHistory);
    }, [chatHistory]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayMessages, isBotTyping]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!userMessage.trim()) return;

        const optimisticMsg = { 
            id: Date.now(), 
            message: userMessage, 
            role: "user" 
        };
        setDisplayMessages(prev => [...prev, optimisticMsg]);

        setNewestMessage(userMessage);
        setUserMessage("");
    };

    useEffect(() => {
        if(!readerId) return;
        if (chatMessage) {
            refreshHistory();
        }
    }, [readerId, chatMessage]);

    return (
        <div className={styles.chatbotContainer}>
        {!isOpen ? (
            <button className={styles.chatTrigger} onClick={() => setIsOpen(true)}>
            </button>
        ) : (
            <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
                <div className={styles.botInfo}>
                <div className={styles.botAvatar}></div>
                <span style={{ fontWeight: 600 }}>Thủ thư Mộc</span>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div className={styles.chatBody} ref={scrollRef}>
                {displayMessages.map((msg) => (
                <div key={msg.id|| msg._id} className={`${styles.message} ${msg.role === "bot" ? styles.botMessage : styles.userMessage}`}>
                    {msg.message}
                </div>
                ))}
                {isBotTyping && (
                    <div className={`${styles.message} ${styles.botMessage}`}>
                        <span className={styles.typingDots}>Mộc đang tìm sách...</span>
                    </div>
                )}
            </div>

            <div className={styles.chatInputArea}>
                <input 
                className={styles.inputField}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Mộc..."
                />
                <button className={styles.sendBtn} onClick={handleSend}>Gửi</button>
            </div>
            </div>
        )}
        </div>
    );
}