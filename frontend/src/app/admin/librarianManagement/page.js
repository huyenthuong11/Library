"use client"

import useReaderList from "@/hook/useGetReaderList";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined} 
    from '@mui/icons-material';
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddLibrarianModal from "./OpenAddLibrarianBar";
import api from "@/lib/axios";

export default function ReaderManagement() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const [search, setSearch] = useState("");
    const [librarianList, setLibrarianList] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [libInventory, setLibInventory] = useState({
        totalLibrarian: 0,
        actiLibrarianSum: 0,
        deactiLibrarianSum: 0
    })
    const [openAddLibrarianBar, setOpenAddLibrarianBar] = useState(false);
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getLibrarianList = async() => {
        try {
            const response = await api.get("/admin/librarianList");
            const data = response.data;
            setLibrarianList(data);
        } catch (error) {
            console.log(error.response?.data?.message);
        }
    }

    const getLibInventory = async() => {
        try {
            const response = await api.get("/admin/libInventory");
            const data = response.data;
            setLibInventory(data);
        } catch (error) {
            console.log("Lỗi server");
        }
    }

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

    const handleDeleteLibrarian = async (id) => {
        try {
            const res = await api.patch(`/admin/deactivateAccount/${id}`)
            if (res.status === 200) {
                getLibrarianList();
                alert(res?.data?.message);
            }
        } catch (error) {
            alert(error?.response?.data?.message);
        }
    }

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
    }, [])

    console.log(fitteredLibrarianList);
    return (
        <>
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
                                        placeholder="Tìm kiếm sách (Tên, ID...)"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                        }}
                                    />
                                </div>
                                <Button 
                                    sx={{
                                        backgroundColor: "#d2dfd5",
                                        color: "#0b485e",
                                        border: "none",
                                        padding: "10px 15px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        marginLeft: "10px"
                                    }}
                                    onClick={() => setOpenAddLibrarianBar(true)}
                                >
                                    <AddBoxOutlined/>
                                </Button>
                            </div>
                            <div className={styles.subHeader}>
                                <div className={styles.tableFilters}>
                                    <ul>
                                        {
                                            statusList.map((status) => (
                                                <li
                                                    key={status.value}
                                                    className={`${activeFilter === status.value ? styles.active : ""}`}
                                                    onClick={() => setActiveFilter(status.value)}
                                                >
                                                    {status.label}
                                                </li>
                                            ))
                                        }
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
                                <div style={{display: "flex", flexDirection: "column"}}>
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
                                <th>
                                    <div style={{
                                        display: "flex", 
                                        justifyContent: "center"
                                    }}>
                                        Hành Động
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {fitteredLibrarianList?.length > 0 && (
                                fitteredLibrarianList.map((librarian) => (
                                    <>
                                        <tr
                                            key={librarian._id}
                                            className={styles.desBar}
                                        >
                                            <td>{formatShortId(librarian._id)}</td>
                                            <td>
                                                <img
                                                    src={getImageUrl(librarian.avatar)}
                                                    className={styles.bookCover}
                                                />
                                            </td>
                                            <td>{librarian.fullName}</td>
                                            <td>{librarian.accountId.email}</td>
                                            <td>
                                                {(() => {
                                                    const matchStatus = statusList.find(s => s.value === librarian.accountId.status);
                                                    return matchStatus ? matchStatus.label : librarian.accountId.status;
                                                })()}
                                            </td>
                                            <td>
                                                <div style={{
                                                    display: "flex", 
                                                    justifyContent: "center",
                                                    
                                                }}>
                                                    <Button
                                                        sx={{
                                                            color: "#911214", 
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => {
                                                            if (confirm("Bạn có chắc muốn vô hiệu hóa tài khoản của thủ thư này không?")) {
                                                                handleDeleteLibrarian(librarian.accountId._id);
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                ))
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
            {
                <AddLibrarianModal 
                    open={openAddLibrarianBar} 
                    handleClose={() => setOpenAddLibrarianBar(false)} 
                    refreshData={() => {
                        getLibrarianList();
                        getLibInventory();
                    }}
                />
            }
        </div>
        </>
    )
}
