"use client";
import styles from "./top3mostBorrowed.module.css";
import { useState,useEffect } from "react";
import api from "@/lib/axios";

export default function Top3MostBorrowed() {
    const [top3MostBorrowedBooks, setTop3MostBorrowedtBooks] = useState([]);
    const getTop3MostBorrowedtBooks = async () => {
        try {    
            const response = await api.get("books/mostBorrowedBooks?limit=3");
            const data = response.data.data;
            setTop3MostBorrowedtBooks(data);
        } catch (err) {
            console.error("Failed to fetch books: - useAvailableBooks.js:20", err);
        }
    }
    
    console.log(top3MostBorrowedBooks.map((newestBook) => (newestBook.image)));
    useEffect(() => {
        getTop3MostBorrowedtBooks();
    }, []);

    const getImageUrl = (path) => {
        if(!path) return "";
        if (path.startsWith("http") || path.startsWith("https")) return path;
        return `http://localhost:5000/${path}`;
    };

    return (
        <>
            <div className={styles.cardMain}>
                {top3MostBorrowedBooks?.length > 0 &&  (
                <>
                    <div className={styles.bookCard1}>
                        <img
                            src={getImageUrl(top3MostBorrowedBooks[1]?.image)}
                            referrerPolicy="no-referrer"
                            key={top3MostBorrowedBooks[1]?.image}
                        />
                        <div>{top3MostBorrowedBooks[1]?.title}</div>
                    </div>
                    <div className={styles.bookCard2}>
                        <img
                            src={getImageUrl(top3MostBorrowedBooks[0]?.image)}
                        />
                        <div>{top3MostBorrowedBooks[0]?.title}</div>
                    </div>
                    <div className={styles.bookCard1}>
                        <img
                            src={getImageUrl(top3MostBorrowedBooks[2]?.image)}
                        />
                        <div>{top3MostBorrowedBooks[2]?.title}</div>
                    </div>
                </>
                )}
            </div>
        </>
    )
}