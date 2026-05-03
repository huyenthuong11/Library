"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, IconButton, Button } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, ReceiptLongOutlined, EditSquare,
    PermIdentityOutlined, AssignmentIndOutlined, AddHomeWorkOutlined, NewspaperOutlined, AddBoxOutlined
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/axios";
import AddPublisherModal from "./AddPublisherModal";
import EditPublisherModal from "./EditPublisherModal";

export default function AdminPublisherManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    
    const fullName = account?.fullName || "Quản trị viên";
    const avatar = account?.avatar || "";

    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // State quản lý Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState(null);

    // Hàm gọi API lấy danh sách NXB
    const fetchPublishers = async () => {
        try {
            const res = await api.get("/publisher/all");
            setPublishers(res.data);
        } catch (error) { 
            console.error("Lỗi lấy NXB:", error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchPublishers(); }, []);

    // Hàm xóa NXB
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa Nhà xuất bản này? Các sách liên quan có thể bị ảnh hưởng!")) return;
        try {
            await api.delete(`/publisher/delete/${id}`);
            alert("Đã xóa Nhà xuất bản thành công!");
            fetchPublishers();
        } catch (error) { 
            alert("Lỗi khi xóa: " + (error.response?.data?.message || "Vui lòng kiểm tra lại")); 
        }
    };

    const handleLogout = () => { logout(); router.push("/"); };

    // Lọc NXB theo tìm kiếm
    const filteredPublishers = publishers.filter(p => {
        const s = search.toLowerCase();
        return (p.name?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s));
    });

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

                {/* SIDEBAR */}
                <aside className="sidebar">
                    <div style={{marginTop:10}}>
                        <div className="webicon">
                            <div className="logo"></div>
                            <div className="websiteName">LMS</div>
                        </div>
                    </div>
                    <nav>
                        <p onClick={() => router.push("/admin/dashboard")}><HomeOutlined/> Trang chủ</p>
                        <p onClick={() => router.push("/admin/availableBooks")}><CollectionsBookmarkOutlined/> Kho sách thư viện</p>
                        <p onClick={() => router.push("/admin/upNewsandEvents")}><NewspaperOutlined/> Đăng thông báo</p>
                        <p onClick={() => router.push("/admin/violationManagement")}><ReceiptLongOutlined /> Quản lý vi phạm</p>
                        <p onClick={() => router.push("/admin/readerManagement")}><PermIdentityOutlined/> Quản lý người đọc</p>
                        <p onClick={() => router.push("/admin/librarianManagement")}><AssignmentIndOutlined/> Quản lý thủ thư</p>
                        <a className="active"><AddHomeWorkOutlined/> Nhà xuất bản</a>
                    </nav>
                </aside>

                {/* NỘI DUNG CHÍNH */}
                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <h2>QUẢN LÝ NHÀ XUẤT BẢN</h2>
                    </div>

                    <div className={styles.header}>
                        <div>
                            {/* Thanh tìm kiếm và Nút Thêm */}
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm nhà xuất bản (Tên, Email...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    sx={{ backgroundColor: "#d2dfd5", color: "#0b485e", padding: "10px 15px", borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    <AddBoxOutlined/>
                                </Button>
                            </div>
                        </div>

                        {/* Thống kê Nhà xuất bản */}
                        <div className={styles.iventoryDashboard}>
                            <div className={styles.iventoryDashboardHeader}>Thống kê nhà xuất bản</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <div>
                                    <p>Tổng số đối tác:</p>
                                </div>
                                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                    <p>{publishers.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th style={{width: '25%'}}>Tên nhà xuất bản</th>
                                <th>Email liên hệ</th>
                                <th>Số điện thoại</th>
                                <th style={{width: '30%'}}>Địa chỉ</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredPublishers.length > 0 ? (
                                filteredPublishers.map((p) => (
                                    <tr key={p._id} className={styles.desBar}>
                                        <td style={{textAlign: 'left', paddingLeft: '15px', fontWeight: "bold", color: "#0b485e"}}>{p.name}</td>
                                        <td>{p.email || "N/A"}</td>
                                        <td>{p.phone || "N/A"}</td>
                                        <td style={{textAlign: "left"}}>{p.address || "Chưa cập nhật"}</td>
                                        <td>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                <IconButton color="primary" onClick={() => { setSelectedPublisher(p); setIsEditOpen(true); }}>
                                                    <EditSquare fontSize="small" />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(p._id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#c62828", fontWeight: "bold" }}>
                                        Không tìm thấy nhà xuất bản nào!
                                    </td>
                                </tr>
                            )}
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

            {/* Các Modal Thêm / Sửa */}
            {isAddOpen && (
                <AddPublisherModal 
                    handleClose={() => setIsAddOpen(false)} 
                    onSuccess={fetchPublishers} 
                />
            )}

            {isEditOpen && (
                <EditPublisherModal 
                    publisher={selectedPublisher} 
                    handleClose={() => setIsEditOpen(false)} 
                    onSuccess={fetchPublishers} 
                />
            )}
        </div>
    );
}