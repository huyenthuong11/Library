"use client";
import styles from "./page.module.css";
import { useState,useEffect } from "react";
import api from "@/lib/axios";

export default function Top5MostBorrowed() {
    const [top5MostBorrowedBooks, setTop5MostBorrowedtBooks] = useState([]);
    const getTop5MostBorrowedtBooks = async () => {
        try {    
            const response = await api.get("books/mostBorrowedBooks?limit=5");
            const data = response.data.data;
            setTop5MostBorrowedtBooks(data);
        } catch (err) {
            console.error("Failed to fetch books: - useAvailableBooks.js:20", err);
        }
    }
    
    useEffect(() => {
        getTop5MostBorrowedtBooks();
    }, []);

    const getImageUrl = (path) => {
        if(!path) return "http://localhost:5000/default-book-cover.jpg";
        if (path.startsWith("http") || path.startsWith("https")) return path;
        return `http://localhost:5000/${path}`;
    };

    return (
        <div className={styles.bookGrid}>
            {top5MostBorrowedBooks.map((book, idx) => (
                <div key={idx} className={styles.bookItem}>
                    <div className={styles.rankWrapper}>
                        <span className={styles.rankNumber}>{idx + 1}</span>
                        <div
                            className={styles.bookCover}
                        >
                            <img src = {getImageUrl(book.image)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}