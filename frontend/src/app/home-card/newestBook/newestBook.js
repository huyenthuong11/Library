"use client";
import styles from "./newestBook.module.css";
import { useState,useEffect } from "react";
import api from "@/lib/axios";

export default function NewestBooks() {
    const [newestBooks, setNewestBooks] = useState([]);
    const getNewestBooks = async () => {
        try {    
            const response = await api.get("books/10newestBooks");
            const data = response.data.data;
            setNewestBooks(data);
        } catch (err) {
            console.error("Failed to fetch books: - useAvailableBooks.js:20", err);
        }
    }
    
    console.log(newestBooks.map((newestBook) => (newestBook.image)));
    useEffect(() => {
        getNewestBooks();
    }, []);

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    };

    return (
        <>
            <div className={styles.cardMain}>
                <div className={styles.scrollContent}>
                    {
                        newestBooks.map((newestBook) => (
                            
                            <div 
                                className={styles.bookImage}
                                key={newestBook._id}
                            >
                                <img
                                    src={getImageUrl(newestBook.image)}
                                    alt={newestBook.title}
                                />
                                <div>{newestBook.title}</div>
                            </div>
                        ))
                    }
                    {
                        newestBooks.map((newestBook) => (
                            
                            <div 
                                className={styles.bookImage}
                                key={`copy-${newestBook._id}`}
                            >
                                <img
                                    src={newestBook.image}
                                />
                                <div>{newestBook.title}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}