"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined } 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import api from "@/lib/axios";
import { format } from 'date-fns';
import BookDesModal from "./bookDesModal";
import Chatbot from "@/app/chatbot/page";
export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const {fullName, avatar, readerId} = useReaderInfo(account?.id);
    const [borrowedBooks, setBorrowedBooks] = useState(null);
    const [recommendBooks, setRecommendBooks] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [statusCount, setStatusCount] = useState({
        overdue: 0,
        reserved: 0
    })
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getBorrowedBooks = async() => {
        if(!readerId) return;
        try {
            const res = await api.get(`/reader/borrowedBooks/${readerId}`);
            const data = res.data.data;
            const sC = res.data.statusCount;
            setBorrowedBooks(data);
            setStatusCount(sC);
        } catch (err) {
            console.error('Lỗi tải sách đang mượn:', err);
        }
    };

    const getRecommendBooks = async() => {
        if(!readerId) return;
        try {
            const res = await api.get(`/recommend/recommendedBooks/${readerId}`);
            const data = res.data;
            setRecommendBooks(data);
        } catch (error) {
            console.error('Lỗi tải danh sách gợi ý:', error);
        }
    }

    useEffect(() => {
        if(!readerId) return;
        getBorrowedBooks();
        getRecommendBooks();
    }, [readerId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now()); 
        }, 60000); 

        return () => clearInterval(timer); 
    }, []);

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 
    

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
                    <a> <HomeOutlined></HomeOutlined>Trang chủ</a>
                    <p onClick={() => router.push("/reader/availableBooks")}>
                        <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                        Kho sách thư viện
                    </p>
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
                <div className={styles.banner}>
                    <div className="bannerFill">
                        <div className="headerBanner">KHÁM PHÁ THẾ GIỚI TRI THỨC</div>
                        <div className="fullName">Hệ thống Quản lý thư viện</div>
                    </div>
                </div>
                <div className={styles.headliner}>
                    <div style={{
                        fontSize: "25px",
                        fontWeight: "bold",
                        fontFamily: "QuickSand"
                    }}>
                        Chào Mừng Bạn, {fullName}!
                    </div>
                    <div style={{
                        gap: "40px", 
                        fontSize: "18px", 
                        fontWeight: "light", 
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        fontFamily: "QuickSand"
                    }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignContent: "center",
                            }}
                        >
                            Sách Đặt Trước: {statusCount.reserved}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignContent: "center",
                            }}
                        >
                            Sách Quá Hạn: {statusCount.overdue}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        color: "white",
                        marginTop: "10px",
                        fontFamily: "Quicksand",
                        fontSize: "20px",
                        width: "95%",
                        fontWeight: "500",
                        marginBottom: "10px"
                    }}
                >
                    Sách Đang Mượn
                </div>
                <div className={styles.grid}>
                    {borrowedBooks && (
                        borrowedBooks.map((book) => (
                            <div key={book.locations._id} className={`${styles['card']} ${styles[`${book.locations.status}`]}`}>
                                <img
                                    style={{height: "100%", width: "32%"}}
                                    src={getImageUrl(book.image)}
                                />
                                <div
                                    style={{
                                        height: "94%", 
                                        width: "67%", 
                                        fontSize: "17px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent:"center",
                                        alignContent: "center"
                                    }}
                                >
                                    <div>Tên sách: {book.title}</div>
                                    <div>Tác giả: {book.author}</div>
                                    <div>Ngày mượn: {
                                        book.locations.createdAt
                                        ? format(new Date(book.locations.createdAt), 'dd-MM-yyyy')
                                        : ""
                                    }</div>
                                    <div>Hạn trả: {
                                        book.locations.dueDate 
                                        ? format(new Date(book.locations.dueDate), 'dd-MM-yyyy')
                                        : ""
                                    }
                                    </div>
                                    {Math.floor((Date.now() - new Date(book.locations.dueDate))) > 0 ? (
                                        <div>
                                            Đã muộn {Math.floor((Date.now() - 
                                            new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((Date.now() - 
                                            new Date(book.locations.dueDate)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((Date.now() - 
                                            new Date(book.locations.dueDate)) % (1000 * 60 * 60)) / (1000 * 60))} phút
                                        </div>
                                    ) : Math.floor((Date.now() - new Date(book.locations.dueDate))) < 0 && book.locations.status === "reserved" ? (
                                        <div>
                                            Còn {Math.floor((new Date(book.locations.dueDate) - 
                                            Date.now()) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((new Date(book.locations.dueDate) - 
                                            Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((new Date(book.locations.dueDate) - 
                                            Date.now()) % (1000 * 60 * 60)) / (1000 * 60))} phút để nhận
                                        </div>
                                    ) : Math.floor((Date.now() - new Date(book.locations.dueDate))) < 0 && book.locations.status === "borrowed" && (
                                        <div>
                                            Đang mượn - còn {Math.floor((new Date(book.locations.dueDate) - 
                                            Date.now()) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((new Date(book.locations.dueDate) - 
                                            Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((new Date(book.locations.dueDate) - 
                                            Date.now()) % (1000 * 60 * 60)) / (1000 * 60))} phút 
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div
                    style={{
                        color: "white",
                        marginTop: "10px",
                        fontFamily: "Quicksand",
                        fontSize: "20px",
                        width: "95%",
                        fontWeight: "500",
                        marginBottom: "10px"
                    }}
                >
                    Sách Gợi Ý
                </div>
                <div className={styles.grid2}>
                    {recommendBooks && (
                        recommendBooks.map((book) => (
                            <div 
                                key={book._id} 
                                className={styles.card2}
                                onClick={() =>  setSelectedBook(book)}  
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <img
                                    style={{height: "100%", width: "32%"}}
                                    src={getImageUrl(book.image)}
                                />
                                <div
                                    style={{
                                        height: "94%", 
                                        width: "67%", 
                                        fontSize: "17px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent:"center",
                                        alignContent: "center"
                                    }}
                                >
                                    <div>Tên sách: {book.title}</div>
                                    <div>Tác giả: {book.author}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {fullName && (
                    <Chatbot
                        userName = {fullName}
                    />
                    )}
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
                <BookDesModal
                    image = {selectedBook.image}
                    category = {selectedBook.category} 
                    publisher = {selectedBook.publisherId.name} 
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