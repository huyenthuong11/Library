"use client"

import useReaderList from "@/hook/useGetReaderList";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, 
    EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, MedicalInformationOutlined,
    Visibility
} from '@mui/icons-material';
import AddReaderModal from "./AddReaderModal"; 
import EditReaderModal from "./EditReaderModal"; 
import ReaderBorrowingModal from "./ReaderBorrowingModal";
import api from "@/lib/axios";

export default function LibrarianReaderInformation() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { readerList, refreshReaderList } = useReaderList();
    
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState(null);
    
    // State quản lý Modals
    const [openAddReaderBar, setOpenAddReaderBar] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openBorrowModal, setOpenBorrowModal] = useState(false);
    const [selectedReader, setSelectedReader] = useState(null);

    const [inventory, setInventory] = useState({ total: 0, active: 0, inactive: 0 });

    const statusList = [
        { value: null, label: "Tất cả" },
        { value: "activate", label: "Đã kích hoạt" },
        { value: "deactivate", label: "Đã bị vô hiệu hóa" }
    ];

    const getInventory = async () => {
        try {
            const res = await api.get("/admin/accountsInventory");
            setInventory({
                total: res.data?.total || 0,
                active: res.data?.active || 0,
                inactive: res.data?.inactive || 0
            });
        } catch (error) { 
            console.error("Lỗi khi lấy thống kê:", error); 
        }
    };

    useEffect(() => { getInventory(); }, []);

    const handleLogout = () => { logout(); router.push("/"); };

    const formatShortId = (reader) => {
        const id = reader.accountId?._id || reader._id;
        return id ? id.toString().slice(-7).toUpperCase() : "N/A";
    };

    const handleOpenEdit = (reader) => {
        setSelectedReader(reader);
        setOpenEditModal(true);
    };

    const handleOpenBorrowHistory = (reader) => {
        setSelectedReader(reader);
        setOpenBorrowModal(true);
    };

    const filteredReaders = readerList?.filter(r => {
        if (activeFilter) {
            const status = r.accountId?.status || r.status;
            if (status !== activeFilter) return false;
        }
        const s = search.toLowerCase();
        const fullName = r.fullName?.toLowerCase() || "";
        const id = formatShortId(r).toLowerCase();
        return fullName.includes(s) || id.includes(s);
    });

    return (
        <div className="container">
            <div className="main">
                {/* HEADER */}
                <div className="header">
                    <div className="webicon"></div>
                    <div className="user">
                        <Avatar src={account?.avatar}></Avatar>
                        <span>{account?.fullName || account?.email || "Thủ thư"}</span>
                        <div className="sign">
                            <a onClick={handleLogout}>Đăng xuất</a>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR DÀNH CHO THỦ THƯ */}
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
                        <a className="active"><MedicalInformationOutlined/> Thông tin người đọc</a>
                        <p onClick={() => router.push("/librarian/violationManagement")}><ReceiptLongOutlined/> Quản lý vi phạm</p>
                    </nav>
                </aside>

                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <h2>THÔNG TIN NGƯỜI ĐỌC</h2>
                    </div>
                    
                    <div className={styles.header}>
                        <div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm người đọc (Tên, ID...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    sx={{ 
                                        backgroundColor: "#d2dfd5", 
                                        color: "#0b485e", 
                                        minWidth: "45px", 
                                        height: "45px",
                                        padding: "0",
                                        borderRadius: "5px", 
                                        marginLeft: "10px" 
                                    }}
                                    onClick={() => setOpenAddReaderBar(true)}
                                    title="Thêm người đọc"
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
                            <div className={styles.iventoryDashboardHeader}>Thống kê người đọc</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <div>
                                    <p>Tổng số người đọc:</p>
                                    <p>Đang hoạt động:</p>
                                    <p>Đã bị vô hiệu hóa:</p>
                                </div>
                                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                                    <p>{inventory.total}</p>
                                    <p>{inventory.active}</p>
                                    <p>{inventory.inactive}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table className={styles.bookTable}>
                        <thead>
                            <tr>
                                <th>Mã người đọc</th>
                                <th>Họ và tên</th>
                                <th>Email tài khoản</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReaders?.length > 0 ? (
                                filteredReaders.map((reader) => {
                                    const currentStatus = reader.accountId?.status || reader.status;
                                    return (
                                        <tr key={reader._id} className={styles.desBar}>
                                            <td>{formatShortId(reader)}</td>
                                            <td style={{ fontWeight: "bold", color: "#0b485e" }}>{reader.fullName}</td>
                                            <td>{reader.accountId?.email || "N/A"}</td>
                                            <td>{reader.phoneNumber || "Chưa cập nhật"}</td>
                                            <td>
                                                <span style={{ color: currentStatus === "activate" ? "green" : "red", fontWeight: "500" }}>
                                                    {currentStatus === "activate" ? "Đã kích hoạt" : "Đã vô hiệu hóa"}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                    <IconButton color="info" onClick={() => handleOpenBorrowHistory(reader)} title="Xem tình trạng mượn sách">
                                                        <Visibility />
                                                    </IconButton>

                                                    <IconButton color="primary" onClick={() => handleOpenEdit(reader)} title="Sửa thông tin">
                                                        <EditSquare />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#c62828", fontWeight: "bold" }}>
                                        Không tìm thấy người đọc nào!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            {openAddReaderBar && (
                <AddReaderModal 
                    open={openAddReaderBar} 
                    handleClose={() => setOpenAddReaderBar(false)} 
                    refreshData={() => { refreshReaderList(); getInventory(); }}
                />
            )}

            {openEditModal && (
                <EditReaderModal
                    open={openEditModal}
                    handleClose={() => setOpenEditModal(false)}
                    refreshData={() => { refreshReaderList(); getInventory(); }}
                    readerData={selectedReader}
                />
            )}

            {openBorrowModal && (
                <ReaderBorrowingModal
                    open={openBorrowModal}
                    handleClose={() => setOpenBorrowModal(false)}
                    readerData={selectedReader}
                />
            )}
        </div>
    );
}