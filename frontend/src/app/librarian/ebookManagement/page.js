"use client"

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    MedicalInformationOutlined, ReceiptLongOutlined,
    AddBoxOutlined, EditSquare, CancelOutlined, 
    SaveOutlined, AddCircleOutlined, PermIdentityOutlined, AssignmentIndOutlined} 
    from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import AddEbookModal from "./AddEbookModal";
import EditEbookModal from "./EditEbookModal";
import api from "@/lib/axios";
import useLibrarianInfo from "@/hook/useLibrarianInfo";
export default function AdminEbookManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { fullName, avatar } = useLibrarianInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [eBooks, setEBooks] = useState(null);
    const [search, setSearch] = useState("");
    const [totalEBooks, setTotalEBooks] = useState(0);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedEbook, setSelectedEbook] = useState(null);

    const getEBooks = async () => {
        try {
            const response = await api.get(`/eBooks/all?page=${currentPage}`, {
                params: {search}
            });
            const data = response.data.data;
            const totalPage = response.data.totalPages;
            setEBooks(data);
            setTotalPages(totalPage);
            setTotalEBooks(response.data.totalEBooks);
        } catch (error) {
            console.log("Lỗi tải danh sách ebook");
        }
    }

    useEffect(() => { getEBooks(); }, []);

    const handleLogout = () => { logout(); router.push("/"); };

    const handleOpenEdit = (ebook) => {
        setSelectedEbook(ebook);
        setOpenEditModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm(`Bạn có chắc chắn muốn xóa Ebook này khỏi hệ thống?`)) {
            try {
                await api.delete(`/eBooks/delete/${id}`);
                alert("Đã xóa Ebook thành công!");
                getEBooks();
            } catch (error) {
                console.error(error);
                alert("Lỗi khi xóa Ebook!");
            }
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/50x70?text=No+Cover";
        return path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
    };

    const filteredEbooks = eBooks?.filter(e => {
        const s = search.toLowerCase();
        const title = e.title?.toLowerCase() || "";
        const author = e.author?.toLowerCase() || "";
        return title.includes(s) || author.includes(s);
    });

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
    return (
        <div className="container">
            <div className="main">
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        {avatar ? (
                            <Avatar
                                alt="User Avatar"
                                src={getImageUrl(avatar)}
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
                        <p onClick={() => router.push("/librarian/dashboard")}><HomeOutlined/> Tổng quan</p>
                        <p onClick={() => router.push("/librarian/availableBooks")}>
                            <CollectionsBookmarkOutlined/>
                            Kho sách thư viện
                        </p>
                        <a onClick={() => router.push("/librarian/ebookManagement")}>
                            <MedicalInformationOutlined></MedicalInformationOutlined>
                            Kho Ebook
                        </a>
                        <p onClick={() => router.push("/librarian/readerCheck")}>
                            <AssignmentIndOutlined/>
                                Thông tin người đọc
                        </p>
                        <p onClick={() => router.push("/librarian/readerManagement")}>
                            <PermIdentityOutlined></PermIdentityOutlined>
                            Quản lý người dùng
                        </p>
                        <p onClick={() => router.push("/librarian/violationManagement")}>
                            <ReceiptLongOutlined></ReceiptLongOutlined>
                            Quản lý vi phạm
                        </p>
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
                                    <p>{totalEBooks || 0} cuốn</p>
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
                                        {((() => {
                                      const eStyle = getEbookStyle(ebook.title);
                                      return (
                                        <div
                                          className={styles.bookCoverBox}
                                          style={{
                                            backgroundColor: eStyle.backgroundColor,
                                            borderColor: eStyle.borderColor,
                                            color: eStyle.color,
                                          }}
                                        >
                                          <div className={styles.bookTitleOnCover}>{ebook.title}</div>
                                          <div className={styles.ebookAuthorOnCover}>{ebook.author}</div>
                                        </div>
                                      );
                                    })())}
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
                    <div className={styles.pagination}>
                        <Button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Trang trước
                        </Button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <Button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Trang sau
                        </Button>
                    </div>
                </div>
            </div>

            {openAddModal && <AddEbookModal open={openAddModal} handleClose={() => setOpenAddModal(false)} onSuccess={getEBooks} />}
            {openEditModal && <EditEbookModal open={openEditModal} handleClose={() => setOpenEditModal(false)} onSuccess={getEBooks} ebook={selectedEbook} />}
        </div>
    );
}