"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, QrCodeScannerOutlined,
    LibraryBooksOutlined } 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import BorrowModal from "./BorrowModal";

export default function HistoryBoard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const {fullName, avatar, readerId} = useReaderInfo(account?.id);
    const [borrowedHistory, setBorrowedHistory] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const getBorrowedHistory = async() => {
        if(!readerId) return;
        try {
            const res = await api.get(`/reader/borrowedHistory/${readerId}?page=${currentPage}`, {
                params: {search}
            });
            const data = res.data.data;
            const totalP = res.data.totalPages;
            setBorrowedHistory(data);
            setTotalPages(totalP);
        } catch (error) {
            console.log(error);
        }
    }

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };

    useEffect(() => {
        if(!readerId) return;
        getBorrowedHistory();
    }, [readerId, search, currentPage]);

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
    
    return (
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
                        
                        <p onClick={() => router.push("/reader/ebook")}>
                            <LibraryBooksOutlined/>
                            Kho Ebook
                        </p>
                        <p onClick={() => router.push("/reader/borrowedBooks")}>
                            <LibraryAddCheckOutlined></LibraryAddCheckOutlined>
                            Giá sách của bạn
                        </p>
                        <a>
                            <HistoryOutlined></HistoryOutlined>
                            Lịch sử mượn sách
                        </a>
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
                        {borrowedHistory && (
                            borrowedHistory.map((copy) => (
                                <div 
                                    className={styles.card} 
                                    key={copy._id}
                                >
                                    <div 
                                        onClick={() =>  setSelectedBook(copy)}  
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            height: "650px"
                                        }}
                                    >
                                        {copy.type === "physical" ? (
                                            <div>
                                                <img
                                                    src={getImageUrl(copy.bookInfo.image)}
                                                    className={styles.bookImage}
                                                />
                                                <div className={styles.bookDescription}>
                                                    <div>
                                                        Mã sách: {copy.bookInfo.isbn}
                                                    </div>
                                                    <div>
                                                        Mã copy: {formatShortId(copy._id)}
                                                    </div>
                                                    <div className={styles.bookAuthor}>
                                                        Tên sách: {copy.bookInfo.title}
                                                    </div>
                                                    <div className={styles.bookAuthor}>
                                                        Tên tác giả: {copy.bookInfo.author}
                                                    </div>
                                                    <div>
                                                        Loại sách: Sách giấy
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className={styles.bookImage}>
                                                    {(() => {
                                                        const eStyle = getEbookStyle(copy.bookInfo.title);
                                                        return (
                                                            <div
                                                                className={styles.bookCoverBox}
                                                                style={{
                                                                    backgroundColor: eStyle.backgroundColor,
                                                                    borderColor: eStyle.borderColor,
                                                                    color: eStyle.color
                                                                }}
                                                            >
                                                                <div className={styles.bookTitleOnCover}>
                                                                    {copy.bookInfo.title}
                                                                </div>
                                                                <div className={styles.ebookAuthorOnCover}>
                                                                    {copy.bookInfo.author}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                    <div className={styles.bookDescription}>
                                                    <div>
                                                        Mã sách: {formatShortId(copy._id)}
                                                    </div>
                                                    <div className={styles.bookAuthor}>
                                                        Tên sách: {copy.bookInfo.title}
                                                    </div>
                                                    <div className={styles.bookAuthor}>
                                                        Tên tác giả: {copy.bookInfo.author}
                                                    </div>
                                                    <div>
                                                        Loại sách: Sách điện tử
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
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
            {
                selectedBook && (
                    <BorrowModal
                        data = {selectedBook}
                        handleClose = {() => setSelectedBook(null)}
                    />
                )
            }
        </div>
    )
}
