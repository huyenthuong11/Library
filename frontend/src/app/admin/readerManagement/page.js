"use client"

import useReaderList from "@/hook/useGetReaderList";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, ReceiptLongOutlined,
    NewspaperOutlined
} 
    from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { ListRounded } from "@mui/icons-material";

export default function ReaderManagement() {
    const {readerList} = useReaderList();
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <div className="container">
            <div className="main">
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        <Avatar></Avatar>
                        <span>{account?.email || "Email"}</span>
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
                        <p onClick={() => router.push("/admin/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Trang chủ
                        </p>
                        <p onClick={() => router.push("/admin/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/admin/upNewsandEvents")}>
                            <NewspaperOutlined/>
                            Đăng thông báo 
                        </p>
                        <p onClick={() => router.push("/admin/violationManagement")}>
                            <ReceiptLongOutlined />
                            Quản lý vi phạm
                        </p>
                        <a className="active">
                            <PermIdentityOutlined/>
                            Quản lý người đọc
                        </a>
                        <p onClick={() => router.push("/admin/librarianManagement")}>
                            <AssignmentIndOutlined/>
                            Quản lý thủ thư
                        </p>
                        <p onClick={() => router.push("/admin/publisherManagement")}>
                            <AddHomeWorkOutlined/>
                            Nhà xuất bản
                        </p>
                    </nav>
                </aside>

                <div className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <div className={styles.mainHeader}>
                                <h2>QUẢN LÝ ĐỘC GIẢ</h2>
                            </div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm độc giả..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PHẦN BẢNG DANH SÁCH ĐỘC GIẢ (ĐÃ GẮN KEY CHUẨN) */}
                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th>Mã Độc Giả</th>
                                <th>Họ và Tên</th>
                                <th>Email</th>
                                <th>Số Điện Thoại</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readerList && readerList.length > 0 ? (
                                readerList.map((reader, index) => (
                                    <tr key={reader._id || index} className={styles.desBar}>
                                        <td>{reader._id ? reader._id.slice(-7).toUpperCase() : "N/A"}</td>
                                        <td style={{ fontWeight: "bold" }}>{reader.fullName}</td>
                                        <td>{reader.email}</td>
                                        <td>{reader.phoneNumber || "Chưa cập nhật"}</td>
                                        <td style={{ color: "green" }}>Đang hoạt động</td>
                                        <td>
                                            <Button sx={{ color: "#0b485e" }}>
                                                <ListRounded />
                                            </Button>
                                            <Button sx={{ color: "error.main" }}>
                                                <DeleteIcon />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                        Không tìm thấy độc giả nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}