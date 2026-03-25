"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import useAvailableBooks from "@/hook/useAvailableBooks";
import { useState } from "react";
import BookDesModal from "./bookDesModal";

import { format } from 'date-fns';
export default function AvailableBook() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const {fullName, avatar} = useReaderInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const {availableBooks, totalPages, refreshAvailableBooks} = useAvailableBooks(currentPage);
    const [selectedBook, setSelectedBook] = useState(null);
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    console.log("RENDER AvailableBook - page.js:30");
    useEffect(() => {
        console.log("selectedBook:", selectedBook);
    }, [selectedBook]);
  return (
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
                    <a>
                        <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                        Kho sách thư viện
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
                    <p onClick={() => router.push("/reader/ask")}>
                        <HelpOutlineOutlined></HelpOutlineOutlined>
                        Yêu cầu
                    </p>
                </nav>
            </aside>
            <div className={styles.main}>
                <div className={styles.header}>
                    <input
                        className={styles.search}
                        placeholder="Tìm kiếm sách..."
                    />
                    <select id="searchFilter" className={styles.searchFilter}>
                        <option value="all">Tất cả</option>
                        <option value="title">Tên sách</option>
                        <option value="author">Tác giả</option>
                        <option value="publisher">Nhà xuất bản</option>
                    </select>
                    <Button component="span"
                        sx={{
                            background: '#083d5e',
                            color: '#f6f8f9',
                            fontSize: '13px',
                            textAlign: "center",
                            height: "70%",
                            width:"10%",
                            margin: "auto"
                        }}>
                        Tìm kiếm
                    </Button>
                </div>
                <div className={styles.grid}>
                    {availableBooks.length > 0 ? (
                        availableBooks.map((availableBook) => (
                            <div 
                                className={styles.card} 
                                key={availableBook._id}
                                onClick={() =>  setSelectedBook(availableBook)}  
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <img
                                    src={availableBook.image}
                                    className={styles.bookImage}
                                />
                                <div className={styles.bookDescription}>
                                    <div>
                                        Tên sách: {availableBook.title}
                                    </div>
                                    <div>
                                        Tác giả: {availableBook.author}
                                    </div>
                                    <div style={{color: '#8a0d0d', fontWeight: "bold"}}>
                                        Còn: {availableBook.availableCopies} cuốn
                                    </div>
                                </div>
                                <div className={styles.pagination}>
                                    {availableBook.availableCopies != 0 ? (
                                        <Button 
                                            variant="contained"
                                            sx={{
                                                background: '#083d5e',
                                                color: '#f6f8f9',
                                                height: "80%",
                                                width:"60%",
                                                margin: "auto",
                                                fontSize: "14px"
                                            }}>
                                            Mượn sách
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="contained"
                                            sx={{
                                                background: '#5e0809',
                                                color: '#f6f8f9',
                                                height: "80%",
                                                width:"60%",
                                                margin: "auto",
                                                fontSize: "14px"
                                            }}>
                                            Đặt trước
                                        </Button>
                                    )
                                    }
                                </div>
                            </div>
                            ))
                        ) : (
                            <div>
                                Không còn cuốn sách nào trong kho!
                            </div>
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
        {
            selectedBook && (
                <BookDesModal
                    image = {selectedBook.image}
                    category = {selectedBook.category} 
                    publisher = {selectedBook.publisher} 
                    title = {selectedBook.title} 
                    publishDate = {selectedBook.publishDate}
                    author = {selectedBook.author}
                    description = {selectedBook.description} 
                    language = {selectedBook.language} 
                    pages = {selectedBook.pages} 
                    availableCopies = {selectedBook.availableCopies}
                    handleClose = {() => setSelectedBook(null)}
                />
            )
        }
    </div>
    </>
  )
}
        