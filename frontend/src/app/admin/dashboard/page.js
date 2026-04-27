"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, ReceiptLongOutlined
} 
    from '@mui/icons-material';
import api from "@/lib/axios";
import Inventory from "../inventory/page";
import BorrowChart from "../borrowChart/page";
import DashboardNotiCard from "../newsAndAnnouces/page";
import NewAccountsChart from "../newAccountsTrend/page";
import AccInventory from "../accountInventory/page";

export default function Dashboard() {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
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
                        <a><HomeOutlined></HomeOutlined>Tổng quan</a>
                        <p onClick={() => router.push("/admin/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/admin/violationManagement")}>
                            <ReceiptLongOutlined />
                            Quản lý vi phạm
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
                    <div className={styles.banner}>
                        <div className="bannerFill">
                            <div className="headerBanner">KHÁM PHÁ THẾ GIỚI TRI THỨC</div>
                            <div className="fullName">Hệ thống Quản lý thư viện</div>
                        </div>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.cardHeight}>
                            <div 
                                style={{
                                    borderRadius: "20px",
                                    fontWeight: "bolder",
                                    fontSize: "16px",
                                    color: "#7e7d7d",
                                    marginBottom: "15px"
                                }}
                            >
                                Thông báo & Yêu cầu mới
                            </div>
                            <DashboardNotiCard/>
                        </div>
                        <div className={styles.card}>
                            <Inventory 
                                data={inventorySummary} 
                                total={total}
                            />
                        </div>
                        <div className={styles.cardWidth}>
                            <div 
                                style={{
                                    borderRadius: "20px",
                                    fontWeight: "bolder",
                                    fontSize: "16px",
                                    color: "#7e7d7d",
                                    marginBottom: "15px"
                                }}
                            >
                                Hoạt động mượn trả sách theo tháng
                            </div>
                            <BorrowChart/>
                        </div>
                        <div className={styles.card}>
                            <div 
                                style={{
                                    borderRadius: "20px",
                                    fontWeight: "bolder",
                                    fontSize: "16px",
                                    color: "#7e7d7d",
                                    marginBottom: "15px"
                                }}
                            >
                                Thống kê tài khoản
                            </div>
                            <AccInventory/>
                        </div>
                        <div className={styles.cardWidth}>
                            <div 
                                style={{
                                    borderRadius: "20px",
                                    fontWeight: "bolder",
                                    fontSize: "16px",
                                    color: "#7e7d7d",
                                    marginBottom: "15px"
                                }}
                            >
                                Người dùng mới hằng tháng
                            </div>
                            <NewAccountsChart/>
                        </div>
                    </div>
                </div>

            </div>
        
                <div className="footer">
                    <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
                    <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
                    <div className={styles.word}>Contact: 0912 xxx xxx</div>
                    <div className={styles.word}>Copyright © Library System</div>
                </div>
    </div>
    </>
    )

}