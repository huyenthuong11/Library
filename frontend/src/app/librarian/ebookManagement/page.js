"use client"

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, MenuBookOutlined,
    PermIdentityOutlined, AssignmentIndOutlined,
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, NewspaperOutlined, MedicalInformationOutlined 
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import AddEbookModal from "./AddEbookModal";
import EditEbookModal from "./EditEbookModal";
import api from "@/lib/axios";

export default function AdminEbookManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    
    const [ebooks, setEbooks] = useState([]);
    const [search, setSearch] = useState("");
    
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedEbook, setSelectedEbook] = useState(null);

    const fetchEbooks = async () => {
        try {
            const res = await api.get("/ebooks/all"); 
            setEbooks(res.data); 
        } catch (error) { 
            console.error("Lỗi khi lấy danh sách Ebook:", error); 
        }
    };

    useEffect(() => { fetchEbooks(); }, []);

    const handleLogout = () => { logout(); router.push("/"); };

    const handleOpenEdit = (ebook) => {
        setSelectedEbook(ebook);
        setOpenEditModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm(`Bạn có chắc chắn muốn xóa Ebook này khỏi hệ thống?`)) {
            try {
                await api.delete(`/ebooks/delete/${id}`);
                alert("Đã xóa Ebook thành công!");
                fetchEbooks();
            } catch (error) {
                console.error(error);
                alert("Lỗi khi xóa Ebook!");
            }
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/50x70?text=No+Cover";
        return path.startsWith("http") ? path : `http://localhost:5000/${path}`;
    };

    const filteredEbooks = ebooks?.filter(e => {
        const s = search.toLowerCase();
        const title = e.title?.toLowerCase() || "";
        const author = e.author?.toLowerCase() || "";
        return title.includes(s) || author.includes(s);
    });

    return (
        <div className="container">
            <div className="main">
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        <Avatar src={account?.avatar}></Avatar>
                        <span>{account?.email || "Admin"}</span>
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
                        <p onClick={() => router.push("/librarian/dashboard")}><HomeOutlined/> Tổng quan</p>
                                                <p onClick={() => router.push("/librarian/availableBooks")}><CollectionsBookmarkOutlined/> Kho sách thư viện</p>
                                                <a className="active"><MedicalInformationOutlined/> Kho Ebook</a>
                                                <p onClick={() => router.push("/librarian/readerCheck")}><AssignmentIndOutlined/> Thông tin người đọc</p>
                                                <p onClick={() => router.push("/librarian/readerCheck")}><PermIdentityOutlined/> Quản lý người dùng</p>
                                                <p onClick={() => router.push("/librarian/violationManagement")}><ReceiptLongOutlined/> Quản lý vi phạm</p>
                    </nav>
                </aside>

                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <h2>KHO EBOOK</h2>
                    </div>
                    
                    <div className={styles.header}>
                        <div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm Ebook (Tên, Tác giả...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    sx={{ backgroundColor: "#d2dfd5", color: "#0b485e", minWidth: "45px", height: "45px", padding: "0", borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={() => setOpenAddModal(true)}
                                    title="Thêm Ebook"
                                >
                                    <AddBoxOutlined/>
                                </Button>
                            </div>
                        </div>

                        <div className={styles.iventoryDashboard}>
                            <div className={styles.iventoryDashboardHeader}>Thống kê Ebook</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <div><p>Tổng số Ebook:</p></div>
                                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                    <p>{ebooks.length} cuốn</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className={styles.bookTable} style={{ tableLayout: "fixed", width: "100%" }}>
                        <thead>
                            <tr>
                                <th style={{ width: "10%", textAlign: "center" }}>Ảnh bìa</th>
                                <th style={{ width: "35%" }}>Tên sách</th>
                                <th style={{ width: "25%" }}>Tác giả</th>
                                <th style={{ width: "15%", textAlign: "center", padding: "10px 5px" }}>Lượt đọc/mượn</th>
                                <th style={{ width: "15%", textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEbooks?.length > 0 ? (
                                filteredEbooks.map((ebook) => (
                                    <tr key={ebook._id} className={styles.desBar}>
                                        <td style={{ textAlign: "center" }}>
                                            <img src={getImageUrl(ebook.image)} alt="cover" style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }} />
                                        </td>
                                        <td style={{ fontWeight: "bold", color: "#0b485e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {ebook.title}
                                        </td>
                                        <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {ebook.author || "N/A"}
                                        </td>
                                        <td style={{ fontWeight: "bold", color: "green", textAlign: "center" }}>
                                            {ebook.borrowedCount || 0}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                <IconButton color="primary" onClick={() => handleOpenEdit(ebook)} title="Sửa thông tin"><EditSquare /></IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(ebook._id)} title="Xóa Ebook"><DeleteIcon /></IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#c62828", fontWeight: "bold" }}>Không tìm thấy Ebook nào!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                </div>
            </div>

            {openAddModal && <AddEbookModal open={openAddModal} handleClose={() => setOpenAddModal(false)} onSuccess={fetchEbooks} />}
            {openEditModal && <EditEbookModal open={openEditModal} handleClose={() => setOpenEditModal(false)} onSuccess={fetchEbooks} ebook={selectedEbook} />}
        </div>
    );
}