"use client"

import useReaderList from "@/hook/useGetReaderList";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { use, useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined} 
    from '@mui/icons-material';
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { ListRounded } from "@mui/icons-material";
import api from "@/lib/axios";

export default function ReaderManagement() {
    const {readerList} = useReaderList();
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {search, setSearch} = useState("");
    const {currentPage, setCurrentPage} = useState(1);

    const handleLogout = () => {
        logout();
        router.push("/");
    };
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
                    <div className={styles.header}>
                        <div>
                            <div className={styles.mainHeader}>
                                <h2>QUẢN LÝ KHO SÁCH</h2>
                            </div>
                            <div className={styles.actionBar}>
                                <div className={styles.searchContainer}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm sách (Tên, Tác giả, ISBN...)"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
