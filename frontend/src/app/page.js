"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <div className={styles.header}>
        <div className={styles.webicon}>
          <div className={styles.logo}></div>
          <div className={styles.websiteName}>LMS</div>
        </div>
        <div className={styles.sign}>
          <a onClick={() => router.push("/login")}>Đăng Nhập</a>  
          <a onClick={() => router.push("/register")}>Đăng Ký</a>
        </div>
      </div>

      <div className={styles.banner}>
        <div className={styles.bannerFill}>
          <div className={styles.headerBanner}>KHÁM PHÁ THẾ GIỚI TRI THỨC</div>
          <div className={styles.fullName}>Hệ thống Quản lý thư viện</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>SÁCH MỚI CẬP NHẬT</div>
        <div className={styles.card}>DỊCH VỤ NỔI BẬT</div>
        <div className={styles.card}>TIN TỨC & SỰ KIỆN</div>
      </div>

      <div className={styles.footer}>
        <div className={styles.word}>Cầu Giấy, Hà Nội, Việt Nam</div>
        <div className={styles.word}>Contact: 0912 xxx xxx</div>
        <div className={styles.word}>Copyright</div>
      </div>
    </>
  )
}

