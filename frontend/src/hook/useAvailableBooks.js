"use client";
import { useState, useEffect} from "react";
import api from "../lib/axios";
import { set } from "date-fns";

export default function useAvailableBooks(page, category, search, status) {
    
    const [availableBooks, setAvailableBooks] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(1)
    const [inventorySummary, setInventorySummary] = useState({
        totalCopies: 0,
        available: 0,
        borrowed: 0,
        overdue: 0,
        reserved: 0
    });
            

    const getAvailableBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/books/availableBook?page=${page}`, {
                params: {category, search, status}
            });
            const data = response.data.data;
            const totalPage = response.data.totalPages;
            const iS = response.data.inventorySum;
            const t = response.data.totalBook;
            setAvailableBooks(data);
            setTotalPages(totalPage);
            setInventorySummary(iS);
            setTotal(t);
        } catch (err) {
            console.error("Failed to fetch available books: - useAvailableBooks.js:20", err);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const delay = setTimeout(() => {
            getAvailableBooks();
        }, 400);

        return () => clearTimeout(delay);
    }, [page, category, search, status]);
    return (
        {availableBooks, loading, totalPages, inventorySummary, total, refreshAvailableBooks: getAvailableBooks}
    );
}