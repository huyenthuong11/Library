"use client";
import styles from "./page.module.css"; 
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Chip, IconButton, Button } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, ReceiptLongOutlined, EditSquare,
    MedicalInformationOutlined, PermIdentityOutlined,  AssignmentIndOutlined
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/axios";
import { format } from 'date-fns';
import EditViolationModal from "./EditViolationModal";

export default function LibrarianViolationManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    
    const fullName = account?.fullName || "Thủ thư";
    const avatar = account?.avatar || "";

    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State cho việc sửa
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);

    // State cho tìm kiếm và bộ lọc
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState(null);

    const statusList = [
        { value: null, label: "Tất cả" },
        { value: "unpaid", label: "Chưa nộp" },
        { value: "paid", label: "Đã nộp" }
    ];

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

    // Logic lọc danh sách Vi phạm
    const filteredViolations = violations.filter(v => {
        if (activeFilter && v.status !== activeFilter) {
            return false;
        }
        const s = search.toLowerCase();
        const readerName = v.readerId?.fullName?.toLowerCase() || "";
        const bookTitle = v.documentId?.title?.toLowerCase() || "";
        return readerName.includes(s) || bookTitle.includes(s);
    });

    return (
        <div className="container">
            <div className="main">
                {/* HEADER */}
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        {avatar ? (
                            <Avatar alt="Librarian Avatar" src={avatar} sx={{ objectFit: 'cover', border: '1px solid rgba(150, 149, 149, 0.65)' }} />
                        ) : (
                            <Avatar></Avatar>
                        )}
                        <span>{fullName || account?.email || "Thủ thư"}</span>
                        <div className="sign"><a onClick={handleLogout}>Đăng xuất</a></div>
                    </div>
                </div>

                {/* SIDEBAR DÀNH RIÊNG CHO THỦ THƯ */}
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
                        <p onClick={() => router.push("/librarian/ebookManagement")}>
                            <MedicalInformationOutlined></MedicalInformationOutlined>
                            Kho Ebook
                        </p>
                        <p onClick={() => router.push("/librarian/readerCheck")}>
                            <AssignmentIndOutlined/>
                            Thông tin người đọc
                        </p>
                        <p onClick={() => router.push("/librarian/readerManagement")}>
                            <PermIdentityOutlined></PermIdentityOutlined>
                            Quản lý người dùng
                        </p>
                        <a className="active"><ReceiptLongOutlined /> Quản lý vi phạm</a>
                    </nav>
                </aside>

                {/* NỘI DUNG CHÍNH */}
                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <h2>QUẢN LÝ VI PHẠM</h2>
                    </div>

                    <div className={styles.header}>
                        <div>
                            {/* Thanh tìm kiếm */}
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm vi phạm (Tên độc giả, Tên sách...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Bộ lọc trạng thái */}
                            <div className={styles.subHeader}>
                                <div className={styles.tableFilters}>
                                    <ul>
                                        {statusList.map((status) => (
                                            <li
                                                key={status.value || "all"}
                                                className={`${activeFilter === status.value ? styles.active : ""}`}
                                                onClick={() => setActiveFilter(status.value)}
                                            >
                                                {status.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Thống kê vi phạm */}
                        <div className={styles.iventoryDashboard}>
                            <div className={styles.iventoryDashboardHeader}>Thống kê vi phạm</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <div>
                                    <p>Tổng số phiếu phạt:</p>
                                    <p>Chưa nộp phạt:</p>
                                    <p>Đã nộp phạt:</p>
                                </div>
                                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                    <p>{violations.length}</p>
                                    <p>{violations.filter(v => v.status === 'unpaid').length}</p>
                                    <p>{violations.filter(v => v.status === 'paid').length}</p>
                                </div>
                            </div>
                        </div>
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
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredViolations.length > 0 ? (
                                filteredViolations.map((v) => (
                                    <tr key={v._id} className={styles.desBar}>
                                        <td>{format(new Date(v.createdAt), 'dd-MM-yyyy')}</td>
                                        <td style={{textAlign: 'left', paddingLeft: '10px', fontWeight: "bold"}}>{v.readerId?.fullName}</td>
                                        <td>{v.documentId?.image && <img src={getImageUrl(v.documentId.image)} className={styles.bookCover} alt="cover" />}</td>
                                        <td style={{fontWeight: "bold"}}>{v.documentId?.title}</td>
                                        <td style={{textAlign: "left"}}>{v.reason}</td>
                                        <td style={{fontWeight: "bold", color: "#c62828"}}>{v.fineAmount?.toLocaleString('vi-VN')} đ</td>
                                        <td>
                                            {v.status === 'unpaid' ? "Chưa nộp" : "Đã nộp"}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                <IconButton color="primary" onClick={() => { setSelectedViolation(v); setIsEditOpen(true); }}>
                                                    <EditSquare fontSize="small" />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(v._id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                        Không tìm thấy phiếu phạt nào!
                                    </td>
                                </tr>
                            )}
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