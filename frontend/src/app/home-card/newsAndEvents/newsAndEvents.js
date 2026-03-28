"use client";
import styles from "./newsAndEvents.module.css";
import { useState,useEffect } from "react";
import api from "@/lib/axios";
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { format } from 'date-fns';

export default function NewsAndEvents() {
    const [news, setNews] = useState([]);
    const getNews = async () => {
        try {    
            const response = await api.get("news/getNews");
            const data = response.data.data;
            setNews(data);
        } catch (err) {
            console.error("Failed to fetch books: - useAvailableBooks.js:20", err);
        }
    }

    
    console.log(news.map((newestBook) => (newestBook.image)));

    useEffect(() => {
        getNews();
    }, []);
 return (
    <>
        <div className={styles.cardMain}>
            {
                news.map((n) => (
                    <div 
                        className={styles.card}
                        key={n._id}
                    >
                        <div className={styles.newsImage}>
                            <img
                                src={n.image}
                            />
                        </div>
                        <div className={styles.newsContent}>
                            <div className={styles.title}>
                                {n.title}
                            </div>
                            <div className={styles.content}>
                                {n.content[0]}
                            </div>
                            <div className={styles.footer}>
                                <TimerOutlinedIcon
                                    sx = {{
                                        fontSize: "18px"
                                    }}
                                ></TimerOutlinedIcon>
                                {
                                    n.createdAt
                                    ? format(new Date(n.createdAt), 'dd-MM-yyyy')
                                    :""
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    </>
 )
}