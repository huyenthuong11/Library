"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import { Avatar } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,} 
    from '@mui/icons-material';
export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const handleLogout = () => {
        logout();
        router.push("/");
    };
  return (
    <>
    <div className="container">
        <div className={styles.m}>
            <div className="main">
                    <div className="header">
                        <div className="webicon">
                        </div>
                        <div className="user">
                            <Avatar></Avatar>
                            <span>{account?.email}</span> 
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
                        <a><HomeOutlined></HomeOutlined>Tổng quan</a>
                        <p onClick={() => router.push("/librarian/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                    </nav>
                </aside>

                <div className={styles.main}>
                    <div className="banner">
                        <div className="bannerFill">
                            <div className="headerBanner">KHÁM PHÁ THẾ GIỚI TRI THỨC</div>
                            <div className="fullName">Hệ thống Quản lý thư viện</div>
                        </div>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.cardHeight}>Thông báo & Yêu cầu mới</div>
                        <div className={styles.card}>Cơ cấu thể loại sách</div>
                        <div className={styles.card}>Thống kê nhanh</div>
                        <div className={styles.card}>top5 sách được mượn nhiều nhất</div>
                        <div className={styles.card}>sách mượn theo tháng</div>
                        <div className={styles.card}>tỷ lệ trạng thái sách</div>
                        <div className={styles.card}>duyệt yêu cầu nhanh</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
    )

}