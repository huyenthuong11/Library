"use client"

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, NewspaperOutlined, MenuBookOutlined} 
    from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from '@mui/icons-material/Restore';
import AddLibrarianModal from "./OpenAddLibrarianBar";
import EditLibrarianModal from "./EditLibrarianModal"; // Import Modal mới
import api from "@/lib/axios";

export default function LibManagement() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [librarianList, setLibrarianList] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [libInventory, setLibInventory] = useState({
        totalLibrarian: 0,
        actiLibrarianSum: 0,
        deactiLibrarianSum: 0
    });
    
    const [openAddLibrarianBar, setOpenAddLibrarianBar] = useState(false);
    
    // State cho Modal Edit
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedLibrarian, setSelectedLibrarian] = useState(null);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getLibrarianList = async() => {
        try {
            const response = await api.get("/admin/librarianList");
            setLibrarianList(response.data);
        } catch (error) {
            console.log(error.response?.data?.message);
        }
    };

    const getLibInventory = async() => {
        try {
            const response = await api.get("/admin/libInventory");
            setLibInventory(response.data);
        } catch (error) {
            console.log("Lỗi server");
        }
    };

    const statusList = [
        {value: null, label: "Tất cả"},
        {value: "activate", label: "Đã kích hoạt"},
        {value: "deactivate", label: "Đã bị vô hiệu hóa"}
    ];

    const fitteredLibrarianList = librarianList?.filter((item) => {
        if (!activeFilter) return true;
        return item.accountId.status === activeFilter
    })
    .filter(item => item?.fullName?.toLowerCase().includes(search?.toLowerCase()) 
    || item?._id?.toLowerCase().includes(search?.toLowerCase()));

    // Hàm gọi Modal Edit
    const handleOpenEdit = (librarian) => {
        setSelectedLibrarian(librarian);
        setOpenEditModal(true);
    };

    // Hàm gọi API Khóa/Mở Khóa tài khoản (Dùng chung API với Độc giả)
    const handleToggleStatus = async (accountId, currentStatus) => {
        const actionText = currentStatus === "activate" ? "vô hiệu hóa" : "mở khóa";
        if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
            try {
                const res = await api.patch(`/admin/toggleAccountStatus/${accountId}`);
                alert(res.data.message);
                getLibrarianList();
                getLibInventory();
            } catch (error) {
                console.error(error);
                alert("Lỗi khi thực hiện thay đổi trạng thái");
            }
        }
    };

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };

    const getImageUrl = (path) => {
        if(!path) return;
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 

    useEffect(() => {
        getLibInventory();
        getLibrarianList();
    }, []);

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
                        <p onClick={() => router.push("/admin/ebookManagement")}>
                            <MenuBookOutlined />
                            Kho Ebook
                        </p>
                        <p onClick={() => router.push("/admin/upNewsandEvents")}>
                            <NewspaperOutlined/>
                            Đăng thông báo 
                        </p>
                        <p onClick={() => router.push("/admin/violationManagement")}>
                            <ReceiptLongOutlined />
                            Quản lý vi phạm
                        </p>
                        <p onClick={() => router.push("/admin/readerManagement")}>
                            <PermIdentityOutlined/>
                            Quản lý người đọc
                        </p>
                        <a>
                            <AssignmentIndOutlined/>
                            Quản lý thủ thư
                        </a>
                        <p onClick={() => router.push("/admin/publisherManagement")}>
                            <AddHomeWorkOutlined/>
                            Nhà xuất bản
                        </p>
                    </nav>
                </aside>
                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <h2>QUẢN LÝ THỦ THƯ</h2>
                    </div>
                    <div className={styles.header}>
                        <div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm thủ thư (Tên, ID...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    sx={{ backgroundColor: "#d2dfd5", color: "#0b485e", padding: "10px 15px", borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={() => setOpenAddLibrarianBar(true)}
                                >
                                    <AddBoxOutlined/>
                                </Button>
                            </div>
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
                        <div className={styles.iventoryDashboard}>
                            <div className={styles.iventoryDashboardHeader}>Thống kê thủ thư</div>
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <div style={{display: "flex", flexDirection: "column"}}>
                                    <div>Tổng số tài khoản thủ thư:</div>
                                    <div>Tài khoản đã được kích hoạt:</div>
                                    <div>Tài khoản đã bị vô hiệu hóa:</div>
                                </div>
                                <div style={{display: "flex", flexDirection: "column", textAlign: "right", fontWeight: "bold"}}>
                                    <div>{libInventory.totalLibrarian}</div>
                                    <div>{libInventory.actiLibrarianSum}</div>
                                    <div>{libInventory.deactiLibrarianSum}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th>Mã người dùng</th>
                                <th>Ảnh đại diện</th>
                                <th>Tên thủ thư</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: "center" }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fitteredLibrarianList?.length > 0 ? (
                                fitteredLibrarianList.map((librarian) => {
                                    const currentStatus = librarian.accountId.status;
                                    return (
                                        <tr key={librarian._id} className={styles.desBar}>
                                            <td>{formatShortId(librarian._id)}</td>
                                            <td>
                                                <img
                                                    src={getImageUrl(librarian.avatar)}
                                                    className={styles.bookCover}
                                                    alt="avatar"
                                                />
                                            </td>
                                            <td style={{ fontWeight: "bold" }}>{librarian.fullName}</td>
                                            <td>{librarian.accountId.email}</td>
                                            <td>
                                                {currentStatus === "activate" ? "Đã kích hoạt" : "Đã vô hiệu hóa"}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                    <IconButton color="primary" onClick={() => handleOpenEdit(librarian)}>
                                                        <EditSquare />
                                                    </IconButton>
                                                    <IconButton 
                                                        color={currentStatus === "activate" ? "error" : "success"} 
                                                        onClick={() => handleToggleStatus(librarian.accountId._id, currentStatus)}
                                                        title={currentStatus === "activate" ? "Vô hiệu hóa" : "Mở khóa"}
                                                    >
                                                        {currentStatus === "activate" ? <DeleteIcon /> : <RestoreIcon />}
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#c62828", fontWeight: "bold" }}>
                                        Không tìm thấy thủ thư nào!
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
            
            <AddLibrarianModal 
                open={openAddLibrarianBar} 
                handleClose={() => setOpenAddLibrarianBar(false)} 
                refreshData={() => {
                    getLibrarianList();
                    getLibInventory();
                }}
            />

            <EditLibrarianModal
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                refreshData={() => { getLibrarianList(); getLibInventory(); }}
                librarianData={selectedLibrarian}
            />
        </div>
    );
}