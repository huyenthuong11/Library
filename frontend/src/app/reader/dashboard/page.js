"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import { Avatar } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined } 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";

export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const {fullName, avatar} = useReaderInfo(account?.id);
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
                            {avatar ? (
                                <Avatar
                                    alt="User Avatar"
                                    src={`http://localhost:5000/${avatar}`}
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
                        <a> <HomeOutlined></HomeOutlined>Trang chủ</a>
                        <p onClick={() => router.push("/reader/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/reader/borrowedBooks")}>
                            <LibraryAddCheckOutlined></LibraryAddCheckOutlined>
                            Giá sách của bạn
                        </p>
                        <p onClick={() => router.push("/reader/history")}>
                            <HistoryOutlined></HistoryOutlined>
                            Lịch sử mượn sách
                        </p>
                        <p onClick={() => router.push("/reader/setinfo")}>
                            <PermIdentityOutlined></PermIdentityOutlined>
                            Hồ sơ cá nhân
                        </p>
                        <p onClick={() => router.push("/reader/ask")}>
                            <HelpOutlineOutlined></HelpOutlineOutlined>
                            Yêu cầu
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
                        <div className={styles.cardWide}>Thông báo quan trọng</div>
                        <div className={styles.cardWide}>Sách đang mượn</div>
                        <div className={styles.card}>Yêu cầu của bạn</div>
                        <div className={styles.card}>Sách gợi ý cho bạn</div>
                        <div className={styles.card}>Sách được mượn nhiều nhất trong tuần</div>
                        <div className={styles.card}>Tóm tắt tài khoản</div>
                    </div>
                </div>
            </div>
        
    </div>
    </>
    )

}