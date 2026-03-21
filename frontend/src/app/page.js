"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { Avatar } from "@mui/material";
import useReaderInfo from "../hook/useReaderInfo";

export default function Page() {
  const router = useRouter();
  const { account, logout } = useContext(AuthContext);
  const {fullName, avatar} = useReaderInfo(account.id);
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="webicon">
            <div className="logo"></div>
            <div className="websiteName">LMS</div>
          </div>
          {account ? (
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
          ) : (
            <div className="sign">
              <a onClick={() => router.push("/login")}>Đăng Nhập</a>  
              <a onClick={() => router.push("/register")}>Đăng Ký</a>
            </div>
          )}
          
        </div>

        <div className="banner">
          <div className="bannerFill">
            <div className="headerBanner">KHÁM PHÁ THẾ GIỚI TRI THỨC</div>
            <div className="fullName">Hệ thống Quản lý thư viện</div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              SÁCH MỚI CẬP NHẬT
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              TOP 3 SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT
            </div>
            <div className={styles.cardMain2}>
              <div style={{border: '1px solid #8684849d', boxShadow: '0 0 1px 1px #868484bb', width: "30%", height: "100%", borderRadius: "8px"}}></div>
              <div style={{border: '1px solid #f0a4a4b0', boxShadow: '0 0 1px 1px #f0a4a4b0', width: "30%", height: "100%", borderRadius: "8px"}}></div>
              <div style={{border: '1px solid #868484b4', boxShadow: '0 0 1px 1px #868484bb', width: "30%", height: "100%", borderRadius: "8px"}}></div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              TIN TỨC & SỰ KIỆN
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
          <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
          <div className={styles.word}>Contact: 0912 xxx xxx</div>
          <div className={styles.word}>Copyright © Library System</div>
        </div>
      </div>
    </>
  )
}

