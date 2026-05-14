"use client";
import api from "@/lib/axios";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { format } from 'date-fns';
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, NewspaperOutlined} 
    from '@mui/icons-material';
    import useLibrarianInfo from "@/hook/useLibrarianInfo";
export default function NewsDetails () {
    const router = useRouter();
    const { account, logout } = useContext(AuthContext);
    const [news, setNews] = useState(null);
    const {fullName, avatar} = useLibrarianInfo(account?.id);
    const params = useParams();
    const id = params.id;
    console.log(id);

    const getNews = async () => {
        try {
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
    }, [id])

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    };

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
                                    src={getImageUrl(avatar)}
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
                        <p onClick={() => router.push("/admin/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Trang chủ
                        </p>
                        <p onClick={() => router.push("/admin/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/admin/upNewsandEvents")}>
                            <NewspaperOutlined/>
                            Đăng thông báo 
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
                                    src={getImageUrl(news.image)} 
                                    alt={news.title} 
                                    style={{ width: '200px', height: '200px' }}
                                    className={styles.featuredImage}
                                />
                                <div className={styles.bodyText}>
                                    {
                                        news?.content?.map((c, i) => (
                                            <div key={i}>{c}</div>
                                        ))
                                    }
                                </div>
                                <Button
                                    variant="contained"
                                    sx={{
                                        background: '#9bc7e3',
                                        color: '#f6f8f9',
                                        height: "30px",
                                        width:"100px",
                                        margin: "auto",
                                        marginTop: "20px",
                                        fontSize: "14px"
                                    }}
                                    onClick={() => {router.push("/admin/dashboard")}}
                                >
                                    Quay lại
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                    
            </div>
        </>
    )
}