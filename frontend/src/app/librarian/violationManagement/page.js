"use client";
import styles from "../availableBooks/page.module.css"; 
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Chip, IconButton } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, ReceiptLongOutlined, EditSquare, MedicalInformationOutlined
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import useLibrarianInfo from "@/hook/useLibrarianInfo";
import api from "@/lib/axios";
import { format } from 'date-fns';
import EditViolationModal from "./EditViolationModal";

export default function ViolationManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { fullName, avatar } = useLibrarianInfo(account?.id);
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
                {/* PHẦN HEADER BÊ TỪ DASHBOARD SANG */}
                <div className="header">
                    <div className="webicon"></div>
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

                {/* SIDEBAR BÊN TRÁI */}
                <aside className="sidebar">
                    <div style={{marginTop:10}}>
                        <div className="webicon">
                            <div className="logo"></div>
                            <div className="websiteName">LMS</div>
                        </div>
                    </div>
                    <nav>
                        <p onClick={() => router.push("/librarian/dashboard")}><HomeOutlined/> Tổng quan</p>
                        <p onClick={() => router.push("/librarian/availableBooks")}><CollectionsBookmarkOutlined/> Kho sách thư viện</p>
                        <p onClick={() => router.push("/librarian/readerCheck")}>
                            <MedicalInformationOutlined/>
                            Thông tin người đọc
                        </p>
                        <a className="active"><ReceiptLongOutlined/> Quản lý vi phạm</a>
                    </nav>
                </aside>

                {/* NỘI DUNG CHÍNH (BẢNG VI PHẠM) */}
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

            {/* PHẦN FOOTER BÊ TỪ DASHBOARD SANG */}
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