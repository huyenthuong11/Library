"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, QrCodeScannerOutlined, 
    LibraryBooksOutlined} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import { useState } from "react";
import api from "@/lib/axios";
import Chatbot from "@/app/chatbot/page";


export default function Ebook() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar, readerId, refreshReaderInfo} = useReaderInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [eBooks, setEBooks] = useState(null);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getEBooks = async () => {
        if(!readerId) return;
        try {
            const response = await api.get(`/ebooks/availableEBooks/${readerId}?page=${currentPage}`, {
                params: {search}
            });
            const data = response.data.data;
            const totalPage = response.data.totalPages;
            setEBooks(data);
            setTotalPages(totalPage);
        } catch (error) {
            console.log("Lỗi tải danh sách ebook");
        }
    }

    const borrowBooks = async(id) => {
        try {
            const response = await api.post(`/ebooks/borrowBook/${readerId}/${id}`)
            if(response.status === 200) {
                alert("Mượn sách thành công!");
                getEBooks();
            }
        } catch (error) {
            alert(error.response?.data || "Lỗi xảy ra khi đang mượn sách.");
        }
    }

    useEffect(() => {
        if(!readerId) return;
        const delay = setTimeout(() => {
            getEBooks();
        }, 40);

        return () => clearTimeout(delay);
    }, [readerId, currentPage, search]);

    const getEbookStyle = (title) => {
        let hash = 0; 
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }

        const h = Math.abs(hash % 360);
        const s = 30;
        const l = 90;

        return {
            backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
            color: `hsl(${h}, ${s}%, 20%)`,
            borderColor: `hsl(${h}, ${s}%, 80%)`
        }
    };
    
    return(
        <>
        <div className="container">
            <div className="main">
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        {avatar ? (
                            <Avatar
                                alt="User Avatar"
                                src={`http://localhost:5000/${avatar}`}
                                sx={{
                                    objectFit: 'cover',
                                    border: '1px solid rgba(150, 149, 149, 0.65)'
                                }}
                            />
                        ) : (
                            <Avatar></Avatar>
                        )}
                        {fullName ? (
                            <span>{fullName}</span>
                        ):(
                            <span>{account?.email || "Email"}</span>
                        )}
                        <div className="sign">
                            <a onClick={handleLogout}>Đăng xuất</a>
                        </div>
                    </div>
                </div>
                <aside className="sidebar">
                    <div style={{marginTop:10}}>
                        <div className="webicon">
                            <div className="logo"></div>
                            <div className="websiteName">LMS</div>
                        </div>
                    </div>
                    <nav>
                        <p onClick={() => router.push("/reader/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Trang chủ
                        </p>
                        <p onClick={() => router.push("/reader/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <a>
                            <LibraryBooksOutlined/>
                            Kho Ebook
                        </a>
                        <p onClick={() => router.push("/reader/borrowedBooks")}>
                            <LibraryAddCheckOutlined></LibraryAddCheckOutlined>
                            Giá sách của bạn
                        </p>
                        <p onClick={() => router.push("/reader/history")}>
                            <HistoryOutlined></HistoryOutlined>
                            Lịch sử mượn sách
                        </p>
                        <p onClick={() => router.push("/reader/setinfo")}>
                            <PermIdentityOutlined></PermIdentityOutlined>
                            Hồ sơ cá nhân
                        </p>
                        
                        <p onClick={() => router.push("/reader/card")}>
                            <QrCodeScannerOutlined/>
                            Thẻ mượn sách
                        </p>
                    </nav>
                </aside>
                <div className={styles.main}>
                    <div className={styles.header}>
                        <input
                            className={styles.search}
                            placeholder="Tìm kiếm sách..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className={styles.grid}>
                        {eBooks?.length > 0 && (
                            eBooks.map((book) => {
                                const eStyle = getEbookStyle(book.title);
                                return (
                                    <div
                                        className={styles.card} 
                                        key={book._id}
                                    >
                                        <div 
                                            onClick={() =>  setSelectedBook(book)}  
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <div 
                                                className={styles.bookCoverBox}
                                                style={{
                                                    backgroundColor: eStyle.backgroundColor,
                                                    borderColor: eStyle.borderColor,
                                                    color: eStyle.color
                                                }}
                                            >
                                                <div className={styles.bookTitleOnCover}>
                                                    {book.title}
                                                </div>
                                                <div className={styles.ebookAuthorOnCover}>
                                                    {book.author}
                                                </div>
                                            </div>
                                        </div>
                                        <div 
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItem: "center",
                                                justifyContent: "center",
                                                gap: "5px"
                                            }}
                                        >
                                            <Button 
                                                variant="contained"
                                                sx={{
                                                    background: '#083d5e',
                                                    color: '#f6f8f9',
                                                    height: "fit-content",
                                                    width:"70%",
                                                    margin: "auto",
                                                    fontSize: "14px",
                                                    marginTop: "30px"
                                                }}
                                                onClick={() => borrowBooks(book._id)}
                                            >
                                                Mượn sách
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }) 
                        )}
                        {readerId && (
                            <Chatbot
                                readerId = {readerId}
                            />
                        )}
                    </div>
                    <div className={styles.pagination}>
                        <Button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Trang trước
                        </Button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <Button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Trang sau
                        </Button>
                    </div>
                </div>
            </div>
            <div className="footer">
                <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
                <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
                <div className={styles.word}>Contact: 0912 xxx xxx</div>
                <div className={styles.word}>Copyright © Library System</div>
            </div>
        </div>
        </>
    )
}