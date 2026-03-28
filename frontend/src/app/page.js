"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect } from "react";
import NewestBooks from "./home-card/newestBook/newestBook";
import Top3MostBorrowed from "./home-card/top3mostBorrowed/top3mostBorrowed";
import NewsAndEvents from "./home-card/newsAndEvents/newsAndEvents";
export default function Page() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  useEffect (()=>{
    handleLogout();
  }, [])

  return (
    <>
      <div className="container">
        <div className="header">
          <div className="webicon">
            <div className="logo"></div>
            <div className="websiteName">LMS</div>
          </div>
            <div className="sign">
              <a onClick={() => router.push("/login")}>Đăng Nhập</a>  
              <a onClick={() => router.push("/register")}>Đăng Ký</a>
            </div>          
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
            <NewestBooks/>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              TOP 3 SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT
            </div>
            <Top3MostBorrowed/>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              TIN TỨC & SỰ KIỆN
            </div>
            <NewsAndEvents/>
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

