"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,} 
    from '@mui/icons-material';
import useLibrarianInfo from "@/hook/useLibrarianInfo";
import CategoryPieChart from "../categoryChart/page";
import api from "@/lib/axios";
import Inventory from "../inventory/page";




export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const {fullName, avatar} = useLibrarianInfo(account?.id);
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    
    const [categoryData, setCategoryData] = useState(null);
    const getCategoryData = async () => {
        try {
            const response = await api.get("/chart/getCategoryChartData")
            const data = response.data.composition;
            setCategoryData(data);
        } catch (err) {
            console.log("Tải dữ liệu phân loại thất bại", err);
        }
    } 
    const [inventorySummary, setInventorySummary] = useState({
        totalCopies: 0,
        available: 0,
        borrowed: 0,
        overdue: 0,
        reserved: 0
    });
    const [total, setTotal] = useState(1); 

    const getAvailableBooks = async () => {
        try {
            const response = await api.get(`/books/availableBook?`);
            const iS = response.data.inventorySum;
            const t = response.data.totalBook;
            setInventorySummary(iS);
            setTotal(t);
        } catch (err) {
            console.error(err);
        } 
    }

    useEffect(() => {
        getCategoryData();
        getAvailableBooks();
    }, []);

  return (
    <>
    <div className="container">
            <div className="main">
                    <div className="header">
                        <div className="webicon">
                        </div>
                        <div className="user">
                            {avatar ? (
                                <Avatar
                                    alt="User Avatar"
                                    src={avatar}
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
                        <div className={styles.card}>
                            <CategoryPieChart data={categoryData}/>
                        </div>
                        <div className={styles.card}>
                            <Inventory 
                                data={inventorySummary} 
                                total={total}
                            />
                        </div>
                        <div className={styles.card}>top5 sách được mượn nhiều nhất</div>
                        <div className={styles.card}>sách mượn theo tháng</div>
                        <div className={styles.card}>tỷ lệ trạng thái sách</div>
                        <div className={styles.card}>duyệt yêu cầu nhanh</div>
                    </div>
                </div>
            </div>
        
    </div>
    </>
    )

}