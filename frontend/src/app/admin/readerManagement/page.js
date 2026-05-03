"use client"

import useReaderList from "@/hook/useGetReaderList";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, IconButton } from "@mui/material";
import { 
    HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, NewspaperOutlined 
} from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from '@mui/icons-material/Restore';
import AddReaderModal from "./AddReaderModal";
import EditReaderModal from "./EditReaderModal";
import api from "@/lib/axios";

export default function ReaderManagement() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const { readerList, refreshReaderList } = useReaderList();
    
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState(null);
    const [openAddReaderBar, setOpenAddReaderBar] = useState(false);
    
    const [openEditModal, setOpenEditModal] = useState(false);
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

    const handleToggleStatus = async (accountId, currentStatus) => {
        const actionText = currentStatus === "activate" ? "vô hiệu hóa" : "mở khóa";
        if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
            try {
                const res = await api.patch(`/admin/toggleAccountStatus/${accountId}`);
                alert(res.data.message);
                refreshReaderList();
                getInventory();
            } catch (error) {
                console.error(error);
                alert("Lỗi khi thực hiện thay đổi trạng thái");
            }
        }
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
                    <div className={styles.mainHeader}>
                        <h2>QUẢN LÝ ĐỘC GIẢ</h2>
                    </div>
                    
                    <div className={styles.header}>
                        <div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm độc giả (Tên, ID...)"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    sx={{ backgroundColor: "#d2dfd5", color: "#0b485e", padding: "10px 15px", borderRadius: "5px", marginLeft: "10px" }}
                                    onClick={() => setOpenAddReaderBar(true)}
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
                            <div className={styles.iventoryDashboardHeader}>Thống kê độc giả</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <div>
                                    <p>Tổng số độc giả:</p>
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
                                <th>Mã độc giả</th>
                                <th>Họ và tên</th>
                                <th>Email tài khoản</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: "center" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReaders?.map((reader) => {
                                const currentStatus = reader.accountId?.status || reader.status;
                                return (
                                    <tr key={reader._id} className={styles.desBar}>
                                        <td>{formatShortId(reader)}</td>
                                        <td style={{ fontWeight: "bold" }}>{reader.fullName}</td>
                                        <td>{reader.accountId?.email || "N/A"}</td>
                                        <td>{reader.phoneNumber || "Chưa cập nhật"}</td>
                                        <td>
                                            {currentStatus === "activate" ? "Đã kích hoạt" : "Đã vô hiệu hóa"}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                                                <IconButton color="primary" onClick={() => handleOpenEdit(reader)}>
                                                    <EditSquare />
                                                </IconButton>
                                                
                                                <IconButton 
                                                    color={currentStatus === "activate" ? "error" : "success"} 
                                                    onClick={() => handleToggleStatus(reader.accountId?._id, currentStatus)}
                                                    title={currentStatus === "activate" ? "Vô hiệu hóa" : "Mở khóa"}
                                                >
                                                    {currentStatus === "activate" ? <DeleteIcon /> : <RestoreIcon />}
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#c62828", fontWeight: "bold" }}>
                                Không tìm thấy độc giả nào!
                            </td>
                        </tbody>
                    </table>
                </div>
            </div>

            <AddReaderModal 
                open={openAddReaderBar} 
                handleClose={() => setOpenAddReaderBar(false)} 
                refreshData={() => { refreshReaderList(); getInventory(); }}
            />

            <EditReaderModal
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                refreshData={() => { refreshReaderList(); getInventory(); }}
                readerData={selectedReader}
            />
        </div>
    );
}