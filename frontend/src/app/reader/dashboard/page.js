"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import { Avatar } from "@mui/material";

export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const handleLogout = () => {
        logout();
        router.push("/login");
    };
  return (
    <>
    <div className="container">
        <div className="main">
            <div className="header">
                <div className="webicon">
                    <div className="logo"></div>
                    <div className="websiteName">LMS</div>
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
                <nav>
                    <a>Trang chủ</a>
                    <p onClick={() => router.push("/availableBooks")}>Kho sách thư viện</p>
                    <p onClick={() => router.push("/borrowedBooks")}>Giá sách của bạn</p>
                    <p onClick={() => router.push("/history")}>Lịch sử mượn sách</p>
                    <p onClick={() => router.push("/Hồ sơ cá nhân")}>Lịch sử mượn sách</p>
                </nav>
            </aside>

            <div className={styles.main}></div>
        </div>
    </div>
    </>
    )

}