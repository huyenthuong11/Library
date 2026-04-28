"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { Avatar, Button, IconButton} from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, QrCodeScannerOutlined,
    LibraryBooksOutlined, MenuBookOutlined, Delete} 
    from '@mui/icons-material';
import { useContext, useEffect, useState } from "react";
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
        {value: "overdue", label: "Quá hạn"},
        {value: "ebook", label: "Sách điện tử"}
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
        if(book.locations) {
            return book.locations.status === activeFilter;
        } else if (activeFilter === "ebook") {
            return !book.locations
        }
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

    const handleDelete = async (id) => {
        if(!readerId) return;
        try {
            await api.patch(`/ebooks/return/${readerId}/${id}`);
            alert("Xóa sách khỏi kệ thành công!");
            getBorrowedBookList();
        } catch (error) {
            alert("Xóa sách khỏi kệ thất bại!")
        }
    }


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
                        <p onClick={() => router.push("/reader/ebook")}>
                            <LibraryBooksOutlined/>
                            Kho Ebook
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
                        <p onClick={() => router.push("/reader/card")}>
                            <QrCodeScannerOutlined/>
                            Thẻ mượn sách
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
                                <th style={{'width': '300px'}}>Tên sách</th>
                                <th>Tác giả</th>
                                <th style={{'width': '200px'}}>Trạng thái</th>
                                <th>Thông tin</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                          {!loading && filteredBook?.length > 0 ? (
                            filteredBook.map((book) => (
                              <tr key={book.locations?._id || book._id} className={styles.desBar}>
                                {/* ID */}
                                <td>{formatShortId(book.type === "physical" ? book.locations._id : book._id)}</td>

                                {/* Ảnh bìa */}
                                <td>
                                  {book.type === "physical" ? (
                                    <img
                                      src={getImageUrl(book.image)}
                                      className={styles.bookCover}
                                      alt={book.title}
                                    />
                                  ) : (
                                    (() => {
                                      const eStyle = getEbookStyle(book.title);
                                      return (
                                        <div
                                          className={styles.bookCoverBox}
                                          style={{
                                            backgroundColor: eStyle.backgroundColor,
                                            borderColor: eStyle.borderColor,
                                            color: eStyle.color,
                                          }}
                                        >
                                          <div className={styles.bookTitleOnCover}>{book.title}</div>
                                          <div className={styles.ebookAuthorOnCover}>{book.author}</div>
                                        </div>
                                      );
                                    })()
                                  )}
                                </td>

                                {/* Tiêu đề */}
                                <td>
                                  <span className={styles.bookTitle}>{book.title}</span>
                                </td>

                                {/* Tác giả */}
                                <td>
                                  <span className={styles.bookAuthor}>{book.author}</span>
                                </td>

                                {/* Trạng thái & Thời gian */}
                                <td>
                                    {book.type === "physical" ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div
                                            className={`${styles["status"]} ${
                                            styles[
                                                Math.floor(Date.now() - new Date(book.locations.dueDate)) > 0
                                                ? "overdue"
                                                : book.locations.status
                                            ]
                                            }`}
                                        ></div>
                                        <span>
                                            {Math.floor(Date.now() - new Date(book.locations.dueDate)) > 0
                                            ? "Quá hạn"
                                            : statusList.find((s) => s.value === book.locations.status)?.label ||
                                                book.locations.status}
                                        </span>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div className={`${styles["status"]} ${styles["borrowed"]}`}></div>
                                        <span>Đang mượn (Ebook)</span>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    <div>
                                        {book.type === "physical" ? (
                                        <>
                                            <div>Vào lúc: {book.locations.createdAt ? format(new Date(book.locations.createdAt), "dd-MM-yyyy HH:mm") : ""}</div>
                                            <div>Hạn trả: {book.locations.dueDate ? format(new Date(book.locations.dueDate), "dd-MM-yyyy HH:mm") : ""}</div>
                                            
                                            {(() => {
                                            const diff = Date.now() - new Date(book.locations.dueDate);
                                            const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
                                            const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                            const mins = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));

                                            if (diff > 0) {
                                                return <div>Đã muộn {days} ngày {hours} giờ {mins} phút</div>;
                                            } else if (book.locations.status === "reserved") {
                                                return <div>Còn {days} ngày {hours} giờ {mins} phút để nhận</div>;
                                            } else if (book.locations.status === "borrowed") {
                                                return <div>Đang mượn - còn {days} ngày {hours} giờ {mins} phút</div>;
                                            }
                                            return null;
                                            })()}
                                        </>
                                        ) : (
                                        <div>Vĩnh viễn</div>
                                        )}
                                    </div>
                                </td>

                                {/* Hành động (Actions) */}
                                <td>
                                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    {book.type === "physical" ? (
                                      book.locations.status === "borrowed" ? (
                                        <Button
                                          sx={{ color: "white", backgroundColor: "#0b485e", width: "100px" }}
                                          disabled={loadingId === book.locations._id}
                                          onClick={() => handleExtendBorrowedDueDate(book.locations._id)}
                                        >
                                          {loadingId === book.locations._id ? "..." : "Gia hạn"}
                                        </Button>
                                      ) : book.locations.status === "reserved" ? (
                                        <Button
                                          sx={{ color: "white", backgroundColor: "#9d0303", width: "100px" }}
                                          disabled={loadingId === book.locations._id}
                                          onClick={() => handleCancelReserved(book.locations._id)}
                                        >
                                          Hủy
                                        </Button>
                                      ) : null
                                    ) : (
                                      <>
                                        <IconButton 
                                          sx={{ color: "#0b485e" }} 
                                          onClick={() => router.push(`/reader/eBookDetails/${book._id}`)}
                                        >
                                          <MenuBookOutlined />
                                        </IconButton>
                                        <IconButton 
                                          sx={{ color: "#9d0303" }} 
                                          onClick={() => handleDelete(book._id)}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : null}
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