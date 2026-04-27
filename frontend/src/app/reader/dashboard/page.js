"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,
    LibraryBooksOutlined } 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import api from "@/lib/axios";
import { format } from 'date-fns';
import BookDesModal from "./bookDesModal";
import Chatbot from "@/app/chatbot/page";
import ViolationModal from "./ViolationModal";

export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { fullName, avatar, readerId } = useReaderInfo(account?.id);
    const [borrowedBooks, setBorrowedBooks] = useState(null);
    const [recommendBooks, setRecommendBooks] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [now, setNow] = useState(Date.now());
    
    // Khởi tạo State với giá trị mặc định an toàn
    const [statusCount, setStatusCount] = useState({
        overdue: 0,
        reserved: 0
    });

    const [violations, setViolations] = useState([]);
    const [totalUnpaid, setTotalUnpaid] = useState(0);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);

    // Xử lý gọi API lấy dữ liệu nộp phạt
    useEffect(() => {
        if (!readerId) return; 

        const fetchViolations = async () => {
            try {
                const res = await api.get(`/violation/my-violations?readerId=${readerId}`);
                setViolations(res.data);
                
                const unpaidAmount = res.data
                    .filter(v => v.status === "unpaid" || !v.status)
                    .reduce((sum, v) => sum + (v.fineAmount || 0), 0);
                    
                setTotalUnpaid(unpaidAmount);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu phạt:", error);
            }
        };
        
        fetchViolations();
    }, [readerId]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    // Xử lý gọi API lấy sách mượn
    const getBorrowedBooks = async() => {
        if(!readerId) return;
        try {
            const res = await api.get(`/reader/borrowedBooks/${readerId}`);
            const data = res.data.data;
            const sC = res.data.statusCount;
            setBorrowedBooks(data);
            
            // Chỉ cập nhật trạng thái nếu API trả về sC hợp lệ
            if (sC) {
                setStatusCount(sC);
            }
        } catch (err) {
            console.error('Lỗi tải sách đang mượn:', err);
        }
    };

    // Xử lý gọi API gợi ý sách
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

    // Timer cập nhật thời gian thực
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
    
    // LOGIC ĐÃ SỬA: Tính toán sách quá hạn thực tế (trễ từ 1 NGÀY trở lên) để đồng bộ với Modal
    const actualOverdueBooks = borrowedBooks?.filter(book => {
        if (!book.locations?.dueDate) return false;
        const daysLate = Math.floor((Date.now() - new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24));
        return daysLate > 0 && (book.locations.status === "borrowed" || book.locations.status === "overdue");
    }) || [];

    const hasOverdueRealtime = actualOverdueBooks.length > 0;
    const overdueCount = actualOverdueBooks.length;

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
                    <a> <HomeOutlined />Trang chủ</a>
                    <p onClick={() => router.push("/reader/availableBooks")}>
                        <CollectionsBookmarkOutlined />
                        Kho sách thư viện
                    </p>
                    <p onClick={() => router.push("/reader/ebook")}>
                        <LibraryBooksOutlined/>
                        Kho Ebook
                    </p>
                    <p onClick={() => router.push("/reader/borrowedBooks")}>
                        <LibraryAddCheckOutlined />
                        Giá sách của bạn
                    </p>
                    <p onClick={() => router.push("/reader/history")}>
                        <HistoryOutlined />
                        Lịch sử mượn sách
                    </p>
                    <p onClick={() => router.push("/reader/setinfo")}>
                        <PermIdentityOutlined />
                        Hồ sơ cá nhân
                    </p>
                    <p onClick={() => router.push("/reader/ask")}>
                        <HelpOutlineOutlined />
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
                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                            Sách Đặt Trước: {statusCount?.reserved || 0}
                        </div>
                        {/* ĐÃ SỬA: Số đếm trên Header giờ cũng đợi đủ 24h mới nhảy */}
                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                            Sách Quá Hạn: {overdueCount}
                        </div>
                    </div>
                </div>

                {/* KHỐI HIỂN THỊ CẢNH BÁO PHẠT HOẶC QUÁ HẠN > 1 NGÀY */}
                {(totalUnpaid > 0 || hasOverdueRealtime) ? (
                    <div style={{
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        padding: "15px 20px",
                        borderRadius: "8px",
                        marginTop: "20px",
                        width: "95%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontFamily: "Quicksand",
                        border: "1px solid #ef5350"
                    }}>
                        <span style={{ fontSize: "16px" }}>
                            CẢNH BÁO: {hasOverdueRealtime ? `Bạn có ${overdueCount} sách nộp muộn.` : ""} {totalUnpaid > 0 ? `Cần thanh toán ${totalUnpaid.toLocaleString('vi-VN')} VNĐ tiền phạt!` : "Vui lòng trả sách sớm!"}
                        </span>
                        <button
                            onClick={() => setIsViolationModalOpen(true)}
                            style={{
                                backgroundColor: "#c62828",
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontFamily: "Quicksand"
                            }}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "15px 20px",
                        borderRadius: "8px",
                        marginTop: "20px",
                        width: "95%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: "bold",
                        fontFamily: "Quicksand",
                        border: "1px solid #4caf50"
                    }}>
                        <span style={{ fontSize: "16px" }}>
                            Bạn không có khoản tiền phạt nào cần thanh toán!
                        </span>
                        <button
                            onClick={() => setIsViolationModalOpen(true)}
                            style={{
                                backgroundColor: "#2e7d32",
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontFamily: "Quicksand"
                            }}
                        >
                            Lịch sử vi phạm
                        </button>
                    </div>
                )}

                <div style={{
                    color: "white",
                    marginTop: "10px",
                    fontFamily: "Quicksand",
                    fontSize: "20px",
                    width: "95%",
                    fontWeight: "500",
                    marginBottom: "10px"
                }}>
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
                                <div style={{
                                    height: "94%", 
                                    width: "67%", 
                                    fontSize: "17px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent:"center",
                                    alignContent: "center"
                                }}>
                                    <div className={styles.bookAuthor}>Tên sách: {book.title}</div>
                                    <div className={styles.bookAuthor}>Tác giả: {book.author}</div>
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
                                            Đã muộn {Math.floor((Date.now() - new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((Date.now() - new Date(book.locations.dueDate)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((Date.now() - new Date(book.locations.dueDate)) % (1000 * 60 * 60)) / (1000 * 60))} phút
                                        </div>
                                    ) : Math.floor((Date.now() - new Date(book.locations.dueDate))) < 0 && book.locations.status === "reserved" ? (
                                        <div>
                                            Còn {Math.floor((new Date(book.locations.dueDate) - Date.now()) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((new Date(book.locations.dueDate) - Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((new Date(book.locations.dueDate) - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))} phút để nhận
                                        </div>
                                    ) : Math.floor((Date.now() - new Date(book.locations.dueDate))) < 0 && book.locations.status === "borrowed" && (
                                        <div>
                                            Đang mượn - còn {Math.floor((new Date(book.locations.dueDate) - Date.now()) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((new Date(book.locations.dueDate) - Date.now()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((new Date(book.locations.dueDate) - Date.now()) % (1000 * 60 * 60)) / (1000 * 60))} phút 
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{
                    color: "white",
                    marginTop: "10px",
                    fontFamily: "Quicksand",
                    fontSize: "20px",
                    width: "95%",
                    fontWeight: "500",
                    marginBottom: "10px"
                }}>
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
                                <div style={{
                                    height: "94%", 
                                    width: "67%", 
                                    fontSize: "17px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent:"center",
                                    alignContent: "center"
                                }}>
                                    <div>Tên sách: {book.title}</div>
                                    <div>Tác giả: {book.author}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {readerId && (
                        <Chatbot readerId={readerId} />
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
        
        {selectedBook && (
            <BookDesModal
                image={selectedBook.image}
                category={selectedBook.category} 
                publisher={selectedBook.publisherId.name} 
                title={selectedBook.title} 
                publishDate={selectedBook.publishDate}
                author={selectedBook.author}
                description={selectedBook.description} 
                language={selectedBook.language} 
                pages={selectedBook.pages} 
                availableCopies={selectedBook.availableCopies}
                handleClose={() => setSelectedBook(null)}
            />
        )}
        
        {isViolationModalOpen && (
            <ViolationModal
                violations={violations}
                borrowedBooks={borrowedBooks} 
                handleClose={() => setIsViolationModalOpen(false)}
            />
        )}
    </div>
    </>
  )
}