"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { Avatar, Button } from "@mui/material";
import {
    HomeOutlined,
    CollectionsBookmarkOutlined,
    MedicalInformationOutlined,
    ReceiptLongOutlined,
    SearchOutlined,
    PermIdentityOutlined,
    AssignmentIndOutlined
} from "@mui/icons-material";
import { useContext, useEffect, useState, useRef } from "react";
import useLibrarianInfo from "@/hook/useLibrarianInfo";
import api from "@/lib/axios";
import { User, BookOpen, CheckCircle } from "lucide-react";
import api2 from "@/lib/axios2";

export default function ReaderCheck() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { fullName, avatar } = useLibrarianInfo(account?.id);
    const [search, setSearch] = useState("");
    const [pendingData, setPendingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const isScanning = useRef(false);

    const onScanSuccess = async (readerId) => {
        setLoading(true);
        try {
            const res = await api.get(`/books/pendingBorrow/${readerId}`);
            console.log(res.data);
            if (res.data.data && res.data.data.length > 0) {
                setPendingData({
                    readerId,
                    books: res.data.data,
                    readerName: res.data.reader.fullName || "Chưa cập nhật",
                    avatar: res.data.reader.avatar || "https://www.pinterest.com/minhanh_ptbk/avt-m%E1%BA%B7c-%C4%91%E1%BB%8Bnh-fb/",
                    phoneNumber: res.data.reader.phoneNumber || "Chưa cập nhật",
                    totalBorrow: res.data.reader.totalBorrow || 0,
                    dateOfBirth: res.data.reader.dateOfBirth
                    ? new Date(res.data.reader.dateOfBirth).toLocaleDateString("vi-VN") 
                    : "Chưa cập nhật",
                    borrowTurn: res.data.reader.borrowTurn || 0,
                    violate: res.data.violate
                });
            } else {
                alert("Không có sách nào đang chờ mượn!");
                setPendingData(null);
            }
        } catch (err) {
            console.error("Lỗi:", err);
            alert("Lỗi truy xuất thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const confirmBorrow = async () => {
        await api.patch(`/books/confirmByCard/${pendingData.readerId}`);
        alert("Xác nhận mượn thành công!");
        setPendingData(null);
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getImageUrl = (path) => {
        if(!path) return;
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };

    useEffect(() => {
        if (pendingData) return;
        const interval = setInterval(async() => {
            if (isScanning.current || pendingData) return;
            try {
                const res = await api2.get("/scanResult");
                if (res.data) {
                    isScanning.current = true;
                    await onScanSuccess(res.data);
                    await api2.delete("/scanResult");
                    isScanning.current = false;
                }
            } catch (err) {

            }
        }, 2000);
        return () => clearInterval(interval);
    }, [pendingData]);

    return (
        <div className="container">
            <div className="main">
                <div className="header">
                        <div className="webicon">
                        </div>
                        <div className="user">
                            {avatar ? (
                                <Avatar
                                    alt="User Avatar"
                                    src={avatar}
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
                        <p onClick={() => router.push("/librarian/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Tổng quan
                        </p>
                        <p onClick={() => router.push("/librarian/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/librarian/ebookManagement")}>
                            <MedicalInformationOutlined></MedicalInformationOutlined>
                            Kho Ebook
                        </p>
                        <a>
                            <AssignmentIndOutlined/>
                            Thông tin người đọc
                        </a>
                        <p onClick={() => router.push("/librarian/violationManagement")}>
                            <ReceiptLongOutlined></ReceiptLongOutlined>
                            Quản lý vi phạm
                        </p>
                    </nav>
                </aside>

                <div className={styles.main}>
                    <div className={styles.header}>
                        <div className={styles.mainHeader}>
                            <h2>KIỂM TRA THÔNG TIN NGƯỜI DÙNG</h2>
                        </div>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                placeholder="Nhập ID người dùng..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                }}
                            />
                            <Button
                                style={{
                                    background: "white"
                                }}
                                onClick={() => onScanSuccess(search)}
                            >
                                <SearchOutlined/>
                            </Button>
                        </div>
                    </div>
                    {pendingData && (
                        <div style={{display: 'flex', flex: '1', marginBottom: '20px', gap: '20px'}}>
                            <div className={styles.readerInfo}>
                                <div style={{fontSize: '20px', fontWeight: '500'}}>
                                    THÔNG TIN NGƯỜI DÙNG
                                </div>
                                <div className={styles.cardAvatarImg}>
                                    <Avatar
                                        alt="User Avatar"
                                        src={getImageUrl(pendingData.avatar)}
                                        sx={{
                                            width: 'clamp(180px, 10vw, 200px)',
                                            height: 'clamp(180px, 10vw, 200px)',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(150, 149, 149, 0.65)'
                                        }}
                                    />
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
                                    <div style={{fontSize: '15px'}}>
                                        <strong>Tên người dùng:</strong> {pendingData.readerName}
                                    </div>
                                    <div style={{fontSize: '15px'}}>
                                        <strong>Ngày sinh:</strong> {pendingData.dateOfBirth}
                                    </div>
                                    <div style={{fontSize: '15px'}}>
                                        <strong>Số điện thoại:</strong> {pendingData.phoneNumber}
                                    </div>
                                    <div style={{fontSize: '15px'}}>
                                        <strong>Tổng số lượt mượn:</strong> {pendingData.totalBorrow}
                                    </div>
                                    <div style={{fontSize: '15px'}}>
                                        <strong>Thông tin nợ:</strong>
                                        {
                                            pendingData.violate.length > 0 ? (
                                                pendingData.violate.map((v) => (
                                                    <div>
                                                        <div>
                                                            Người dùng đang nợ {v.fineAmount} đồng do {v.reason} 
                                                        </div>
                                                        <div>
                                                            Sách: {v.documentId.title} mã {formatShortId(v.copyId)}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>
                                                    Người dùng không có khoản nợ nào.
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className={styles.reaservedBook}>
                                <div style={{fontSize: '20px', fontWeight: '500'}}>
                                    YÊU CẦU MƯỢN SÁCH CỦA NGƯỜI DÙNG
                                </div>
                                <div className={styles.books}>
                                {pendingData.books.map((book) => (
                                    <div key={book._id} className={styles.card}>
                                        <img src={getImageUrl(book.image)} className={styles.bookImage}/>
                                        <div className={styles.bookDescription}>
                                            <div>Mã ISBN: {book.isbn}</div>
                                            <div className={styles.bookAuthor}>Tên sách: {book.title}</div>
                                            <div className={styles.bookAuthor}>Tác giả: {book.author}</div>
                                            {book.reservedCopies.length > 0 && (
                                                book.reservedCopies.map((c) => (
                                                    <div key={c.copyId}>
                                                        <div>Mã bản sao: {formatShortId(c.copyId)}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                                </div>  
                                <Button
                                    style={{
                                        background: "#1b4764",
                                        color: "white"
                                    }}
                                    onClick={() => confirmBorrow()}
                                >
                                    Xác Nhận
                                </Button>
                            </div>
                        </div>
                    )}
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