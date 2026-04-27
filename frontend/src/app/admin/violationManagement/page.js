"use client";
import styles from "./page.module.css"; 
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Chip, IconButton } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, ReceiptLongOutlined, EditSquare, GroupOutlined,
    PermIdentityOutlined, AssignmentIndOutlined, AddHomeWorkOutlined
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/axios";
import { format } from 'date-fns';
import EditViolationModal from "./EditViolationModal";

export default function AdminViolationManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    
    // Nếu bạn có hook useAdminInfo thì có thể thay vào đây, 
    // tạm thời mình dùng account email làm mặc định hiển thị
    const fullName = account?.fullName || "Quản trị viên";
    const avatar = account?.avatar || "";

    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho việc sửa
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);

    const fetchViolations = async () => {
        try {
            const res = await api.get("/violation/all");
            setViolations(res.data);
        } catch (error) { console.error("Lỗi:", error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchViolations(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu phạt này không?")) return;
        try {
            await api.delete(`/violation/delete/${id}`);
            alert("Đã xóa thành công!");
            fetchViolations();
        } catch (error) { alert("Lỗi khi xóa!"); }
    };

    const handleLogout = () => { logout(); router.push("/"); };
    const getImageUrl = (path) => path?.startsWith("http") ? path : `http://localhost:5000/${path}`;

    return (
        <div className="container">
            <div className="main">
                {/* HEADER */}
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        {avatar ? (
                            <Avatar alt="Admin Avatar" src={avatar} sx={{ objectFit: 'cover', border: '1px solid rgba(150, 149, 149, 0.65)' }} />
                        ) : (
                            <Avatar></Avatar>
                        )}
                        <span>{fullName || account?.email || "Admin"}</span>
                        <div className="sign"><a onClick={handleLogout}>Đăng xuất</a></div>
                    </div>
                </div>

                {/* SIDEBAR DÀNH RIÊNG CHO ADMIN */}
                <aside className="sidebar">
                    <div style={{marginTop:10}}>
                        <div className="webicon">
                            <div className="logo"></div>
                            <div className="websiteName">LMS Admin</div>
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
                        <a className="active">
                            <ReceiptLongOutlined/> 
                            Quản lý vi phạm
                        </a>
                        <p onClick={() => router.push("/admin/readerManagement")}>
                            <PermIdentityOutlined/>
                            Quản lý người đọc
                        </p>
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

                {/* NỘI DUNG CHÍNH */}
                <div className={styles.main}>
                    <div className={styles.header}>
                        <div className={styles.mainHeader}><h2>QUẢN LÝ PHIẾU PHẠT VI PHẠM</h2></div>
                    </div>

                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th>Ngày tạo</th>
                                <th>Độc giả</th>
                                <th>Ảnh bìa</th>
                                <th>Sách</th>
                                <th style={{width: '250px'}}>Lý do</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && violations.map((v) => (
                                <tr key={v._id} className={styles.desBar}>
                                    <td>{format(new Date(v.createdAt), 'dd-MM-yyyy')}</td>
                                    <td style={{textAlign: 'left', paddingLeft: '10px'}}><strong>{v.readerId?.fullName}</strong></td>
                                    <td>{v.documentId?.image && <img src={getImageUrl(v.documentId.image)} className={styles.bookCover} alt="cover" />}</td>
                                    <td style={{fontWeight: "bold"}}>{v.documentId?.title}</td>
                                    <td style={{textAlign: "left"}}>{v.reason}</td>
                                    <td style={{fontWeight: "bold", color: "#c62828"}}>{v.fineAmount?.toLocaleString('vi-VN')} đ</td>
                                    <td>
                                        <Chip 
                                            label={v.status === 'unpaid' ? "Chưa nộp" : "Đã nộp"} 
                                            color={v.status === 'unpaid' ? "error" : "success"} 
                                            size="small" 
                                        />
                                    </td>
                                    <td>
                                        <IconButton color="primary" onClick={() => { setSelectedViolation(v); setIsEditOpen(true); }}>
                                            <EditSquare fontSize="small" />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(v._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER */}
            <div className="footer">
                <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
                <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
                <div className={styles.word}>Contact: 0912 xxx xxx</div>
                <div className={styles.word}>Copyright © Library System</div>
            </div>

            {/* Modal chỉnh sửa */}
            {isEditOpen && (
                <EditViolationModal 
                    violation={selectedViolation} 
                    handleClose={() => setIsEditOpen(false)} 
                    onSuccess={fetchViolations} 
                />
            )}
        </div>
    );
}