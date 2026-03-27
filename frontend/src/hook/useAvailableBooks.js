"use client";
import { useState, useEffect} from "react";
import api from "../lib/axios";
import { set } from "date-fns";

export default function useAvailableBooks(page, category, search) {
    
    const [availableBooks, setAvailableBooks] = useState([]);
    const [totalPages, setTotalPages] = useState();
    const getAvailableBooks = async () => {
        
        try {
            
            const response = await api.get(`/books/availableBook?page=${page}`, {
                params: {category, search}
            });
            const data = response.data.data;
            const totalPage = response.data.totalPages;
            setAvailableBooks(data);
            setTotalPages(totalPage);
        } catch (err) {
            console.error("Failed to fetch available books: - useAvailableBooks.js:20", err);
        }
    }
    useEffect(() => {
        console.log("run effect - useAvailableBooks.js:24");
        getAvailableBooks();
    }, [page, category, search]);
    return (
        {availableBooks, totalPages, refreshAvailableBooks: getAvailableBooks}
    );
}