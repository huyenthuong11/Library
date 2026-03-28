"use client";
import api from "@/lib/axios";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { format } from 'date-fns';
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
export default function NewsDetails ({params}) {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const [news, setNews] = useState(null);
    const {fullName, avatar} = useReaderInfo(account?.id);
    
    const getNews = async () => {
        try {
            const p = await params;
            const id = p.id;
            const response = await api.get(`news/getNewsDetails/${id}`);
            const data = response.data.data;
            setNews(data);
            console.log(data);
        } catch (err) {
            console.error("Failed to fetch books: - useAvailableBooks.js:20", err);
        }
    }
    const handleLogout = () => {
        logout();
        router.push("/");
    };
     useEffect(() => {
        getNews();
    }, [params])

    return (
        <>
            <div className="container">
                <div className="main">
                    
                            {account ? (
                                <>
                                    <div className="header">
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
                                </>
                            ) : (
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",  
                                    alignItems: "center", 
                                    gridColumn: "1 / -1"   
                                }}>
                                    <div className="webicon">
                                        <div className="logo"></div>
                                        <div className="websiteName">LMS</div>
                                    </div>
                                    <div className="sign">
                                        <a onClick={() => router.push("/login")}>Đăng Nhập</a>  
                                        <a onClick={() => router.push("/register")}>Đăng Ký</a>
                                    </div>
                                </div>
                            )}
                        
                    { account && ( 
                        <aside className="sidebar">
                            <div style={{marginTop:10}}>
                                <div className="webicon">
                                    <div className="logo"></div>
                                    <div className="websiteName">LMS</div>
                                </div>
                            </div>
                            <nav>
                                <p onClick={() => router.push("/reader/dashboard")}>
                                    <HomeOutlined></HomeOutlined>
                                    Trang chủ
                                </p>
                                <p  onClick={() => router.push("/reader/availableBooks")}>
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
                    )}
                    { news && (
                        <div className={styles.detailsContainer}>
                            <div className={styles.inner}>
                                <header className={styles.detailsHeader}>
                                    <span className={styles.category}>Sự kiện thư viện</span>
                                    <h1 className={styles.mainTitle}>{news.title}</h1>
                                    <div className={styles.authorInfo}>
                                        <span>
                                            {
                                                news.createdAt
                                                ? format(new Date(news?.createdAt), 'dd-MM-yyyy')
                                                :""
                                            }
                                        </span>
                                    </div>
                                </header>
                                <img
                                    src={news.image} 
                                    alt={news.title} 
                                    style={{ width: '100%', height: 'auto' }}
                                    className={styles.featuredImage}
                                />
                                <div className={styles.bodyText}>
                                    {
                                        news?.content?.map((c, i) => (
                                            <div key={i}>{c}</div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                    
            </div>
        </>
    )
}