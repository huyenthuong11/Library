"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined, 
    LibraryBooksOutlined} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import useAvailableBooks from "@/hook/useAvailableBooks";
import { useState } from "react";
import BookDesModal from "./bookDesModal";
import api from "@/lib/axios";
import Chatbot from "@/app/chatbot/page";


export default function AvailableBook() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar, readerId, borrowTurn, refreshReaderInfo} = useReaderInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [choosenCategory, setChoosenCategory] = useState("");
    const {availableBooks, totalPages, loading, refreshAvailableBooks} = useAvailableBooks(currentPage, choosenCategory, search);
    const categoryList = [
        { value: [""], label: "Tất cả" },
        { value: ["technology"], label: "Công nghệ" },
        { value: ["science"], label: "Khoa học" },
        { value: ["mathematics"], label: "Toán học" },
        { value: ["history"], label: "Lịch sử" },
        { value: ["geography"], label: "Địa lý" },
        { value: ["politics"], label: "Chính trị" },
        { value: ["philosophy"], label: "Triết học" },
        { value: ["psychology"], label: "Tâm lý học" },
        { value: ["religion"], label: "Tôn giáo / Tâm linh" },
        { value: ["business"], label: "Kinh doanh" },
        { value: ["finance"], label: "Tài chính / Đầu tư" },
        { value: ["marketing"], label: "Marketing / Bán hàng" },
        { value: ["economics"], label: "Kinh tế học" },
        { value: ["education"], label: "Giáo dục / Học tập" },
        { value: ["language"], label: "Ngôn ngữ / Ngoại ngữ" },
        { value: ["exam_prep"], label: "Luyện thi" },
        { value: ["literature"], label: "Văn học" },
        { value: ["novel"], label: "Tiểu thuyết" },
        { value: ["children"], label: "Thiếu nhi" },
        { value: ["comics"], label: "Truyện tranh / Manga" },
        { value: ["self_help"], label: "Phát triển bản thân" },
        { value: ["health"], label: "Sức khỏe / Y học" },
        { value: ["art"], label: "Nghệ thuật / Thiết kế" },
        { value: ["cooking"], label: "Ẩm thực / Nấu ăn" },
        { value: ["travel"], label: "Du lịch / Khám phá" },
        { value: ["biography"], label: "Tiểu sử / Hồi ký" },
        { value: ["general"], label: "Tổng hợp"}
    ];
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 

    const handleSubmit = async(id) => {
        try {
            const response = await api.post(`reader/borrowBook/${id}`, {
                readerId: readerId
            });
            refreshAvailableBooks();
            refreshReaderInfo();
            if(response.status === 200) alert("Mượn sách thành công! Bạn có 3 ngày để đến nhận sách.");
        } catch (err) {
            alert(err.response?.data?.message || "Đã có lỗi xảy ra khi hệ thống xử lý yêu cầu thêm sách");
        }
    }

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
                    <p onClick={() => router.push("/reader/ebook")}>
                        <LibraryBooksOutlined/>
                        Kho Ebook
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
                    <select
                        className={styles.searchFilter}
                        value={choosenCategory}
                        onChange={(e) => {
                            setChoosenCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        {categoryList.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
                <div
                    style={{
                        borderRadius: "8px",
                        background: "white",
                        color: "#580101",
                        marginTop: "10px",
                        marginLeft:"35px",
                        padding: "5px",
                        fontWeight: "bold",
                        width: "fit-content",
                        fontSize: "15px",
                        fontFamily: "Quicksand, sans-serif"
                    }}
                >
                    Còn: {borrowTurn} lượt mượn sách
                </div>
                {loading && (
                    <div 
                        style={{
                            color: "white",
                            fontSize: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignContent: "center",
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        Đang tải trang...
                    </div>
                )} 
                <div className={styles.grid}>
                    {availableBooks.length > 0 && (
                        availableBooks.map((availableBook) => (
                            <div 
                                className={styles.card} 
                                key={availableBook._id}
                            >
                                <div 
                                    onClick={() =>  setSelectedBook(availableBook)}  
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: "650px"
                                    }}
                                >
                                    <img
                                        src={getImageUrl(availableBook.image)}
                                        className={styles.bookImage}
                                    />
                                    <div className={styles.bookDescription}>
                                        <div>
                                            Tên sách: {availableBook.title}
                                        </div>
                                        <div>
                                            Thể loại: {   
                                                categoryList
                                                .filter(c => Array.isArray(c.value) && c.value.some(v => availableBook.category.includes(v)))
                                                .map(c => c.label)
                                                .join(', ')
                                            }
                                        </div> 

                                        <div style={{color: '#8a0d0d', fontWeight: "bolder"}}>
                                            Còn: {availableBook.availableCopies} cuốn
                                        </div>
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
                                            }}
                                            onClick={() => handleSubmit(availableBook._id)}
                                        >
                                            Mượn sách
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="contained"
                                            sx={{
                                                background: '#525050',
                                                color: '#f6f8f9',
                                                height: "80%",
                                                width:"60%",
                                                margin: "auto",
                                                fontSize: "14px"
                                            }}
                                            disabled
                                        >
                                            Hết sách
                                        </Button>
                                    )
                                    }
                                </div>
                            </div>
                            ))
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
        