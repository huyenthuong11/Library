"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined 
} from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import api from "@/lib/axios";
import { format } from "date-fns";

export default function BookStore() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar, readerId} = useReaderInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [borrowedBookList, setBorrowedBookList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [choosenCategory, setChoosenCategory] = useState("");
    const [activeFilter, setActiveFilter] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [loadingId, setLoadingId] = useState(null);

    const getBorrowedBookList = async () => {
        if(!readerId) return;
        setLoading(true);
        try {
            const response = await api.get(`/reader/bookStore/${readerId}?page=${currentPage}`, {
                params: {choosenCategory, search}
            });
            const data = response.data;
            setBorrowedBookList(data);
        } catch (err) {
            alert("Lỗi tải danh sách sách đang mượn")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(!readerId) return;
        
        getBorrowedBookList();
        
    }, [readerId, currentPage, choosenCategory, search]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now()); 
        }, 60000); 

        return () => clearInterval(timer); 
    }, []);

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

    const statusList = [
        {value: null, label: "Tất cả"},
        {value: "reserved", label: "Đặt trước"},
        {value: "borrowed", label: "Đang mượn"},
        {value: "overdue", label: "Quá hạn"}
    ];

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 
    
    const filteredBook = borrowedBookList?.filter((book) => {
        if (!activeFilter) return true;
        return book.locations.status === activeFilter;
    }); 

    const handleExtendBorrowedDueDate = async (copyId) => {
        if(!readerId) return;
        setLoadingId(copyId);
        try {
            const response = await api.patch(`/reader/extendBorrowedDueDate/${readerId}/${copyId}`);
            if(response.status === 200) getBorrowedBookList();
        } catch (error) {
            alert(error.response?.data?.message ||"Đã có lỗi xảy ra khi gia hạn sách!")
        } finally {
            setLoadingId(null);
        }
    }

    const handleCancelReserved = async (copyId) => {
        if(!readerId) return;
        setLoadingId(copyId);
        try {
            const response = await api.patch(`/reader/cancelReserved/${readerId}/${copyId}`);
            if(response.status === 200) getBorrowedBookList();
        } catch (error) {
            alert(error.response?.data?.message ||"Hủy mượn sách thất bại!")
        } finally {
            setLoadingId(null);
        }
    }

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };

    return(
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
                            <LibraryAddCheckOutlined></LibraryAddCheckOutlined>
                            Giá sách của bạn
                        </a>
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
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm sách (Tên, Tác giả, ISBN...)"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <select
                            className={styles.searchFilter}
                            value={choosenCategory}
                            onChange={(e) => {
                                setChoosenCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {categoryList.map((c) => (
                                <option key={c.value.join(",")} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.tableFilters}>
                            <ul>
                                {
                                    statusList.map((status) => (
                                        <li
                                            key={status.value}
                                            className={`${activeFilter === status.value ? styles.active : ""}`}
                                            onClick={() => setActiveFilter(status.value)}
                                        >
                                            {status.label}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th>Mã sách</th>
                                <th>Ảnh bìa</th>
                                <th>Tên sách</th>
                                <th>Tác giả</th>
                                <th>Trạng thái</th>
                                <th>Thông tin</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            { (!loading && filteredBook?.length > 0) ? (
                                filteredBook?.map((book) => (
                                    <tr key={book.locations._id} className={styles.desBar}>
                                        <td>{formatShortId(book.locations._id)}</td>
                                        <td>
                                            <img
                                                src={getImageUrl(book.image)}
                                                className={styles.bookCover}
                                            />
                                        </td>
                                        <td>
                                            <span className={styles.bookTitle}>
                                                {book.title}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.bookAuthor}>
                                                {book.author}
                                            </span>
                                        </td>
                                        <td>
                                            {Math.floor((Date.now() - new Date(book.locations.dueDate))) > 0 && book.locations.dueDate ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <div className={`${styles['status']} ${styles[`${"overdue"}`]}`}>
                                                    </div>
                                                    Quá hạn
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <div className={`${styles['status']} ${styles[`${book.locations.status}`]}`}></div>
                                                    {(() => {
                                                        const matchedStatus = statusList.find(
                                                            s => s.value === book.locations.status
                                                        );
                                                        return matchedStatus ? matchedStatus.label : book.locations.status;
                                                    })()}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div>
                                                Vào lúc: {
                                                    book.locations.createdAt
                                                    ? format(new Date(book.locations.createdAt), 'dd-MM-yyyy HH:mm')
                                                    :""
                                                }
                                            </div>
                                            <div>
                                                Hạn trả: {
                                                    book.locations.dueDate
                                                    ? format(new Date(book.locations.dueDate), 'dd-MM-yyyy HH:mm')
                                                    :""
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
                                        </td>
                                        {
                                            book.locations.status === "borrowed" ? (
                                                <td>
                                                    <Button
                                                        sx={{
                                                            color: "white",
                                                            backgroundColor: "#0b485e", 
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                        disabled={loadingId === book.locations._id}
                                                        onClick={() => {
                                                            handleExtendBorrowedDueDate(book.locations._id)
                                                        }}   
                                                    >
                                                        {loadingId === book.locations._id ? "Đang xử lý..." : "Gia hạn"}
                                                    </Button>
                                                </td>
                                            ) : book.locations.status === "reserved" ? (
                                                <td>
                                                    <Button
                                                        sx={{
                                                            color: "white",
                                                            backgroundColor: "#0b485e", 
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                        disabled={loadingId === book.locations._id}
                                                        onClick={() => {
                                                            handleCancelReserved(book.locations._id)
                                                        }}   
                                                    >
                                                        Hủy
                                                    </Button>
                                                </td>
                                            ) : (
                                                <td>
                                                    {/* ĐÂY LÀ DÒNG FIX LỖI: Sửa l.dueDate thành book.locations.dueDate */}
                                                    Đã muộn {Math.floor((Date.now() - new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24))} ngày
                                                </td>
                                            )
                                        }
                                    </tr>
                                ))
                            ) : null }
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="footer">
                <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
                <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
                <div className={styles.word}>Contact: 0912 xxx xxx</div>
                <div className={styles.word}>Copyright © Library System</div>
            </div>
        </div>
    )
}