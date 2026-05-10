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
        const interval = setInterval(getTop5MostBorrowedtBooks, 15000);
        return () => clearInterval(interval);
    }, []);

    const getImageUrl = (path) => {
        if(!path) return "http://localhost:5000/default-book-cover.jpg";
        if (path.startsWith("http") || path.startsWith("https")) return path;
        return `http://localhost:5000/${path}`;
    };

    return(
        <>
        <div className={styles.container}>
            <div className={styles.bookList}>
                {top5MostBorrowedBooks.map((book, idx) =>(
                    <div
                        key={book._id}
                        className={styles.bookItem}
                    >
                        <div className={styles.bookRank}>{idx + 1}</div>
                        <img 
                            src={getImageUrl(book.image)}
                            alt={book.title}
                            className={styles.bookCover}
                        />
                        <div className={styles.bookInfo}>
                            <div className={styles.bookName}>{book.title}</div>
                            <div className={styles.bookAuthor}>Tác giả: {book.author}</div>
                            <div className={styles.bookCount}>Số lần mượn: <strong>{book.borrowedCount}</strong></div>
                            <div className={styles.bookCount}>Số sách còn trong kho: <strong>{book.availableCopies}</strong></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    )
}