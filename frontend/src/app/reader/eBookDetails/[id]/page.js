"use client";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined, 
    LibraryBooksOutlined} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import { useState } from "react";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import { format } from 'date-fns';


export default function EBooksDetails () {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar, readerId, refreshReaderInfo} = useReaderInfo(account?.id);
    const [eBook, setEBook] = useState(null);
    const params = useParams();
    const id = params.id;
    
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    };

    const getEBook = async () => {
        try {
            const response = await api.get(`/ebooks/getBooks/${id}`);
            const data = response.data;
            setEBook(data);
        } catch (error) {
            console.error("Failed to fetch books");
        }
    }

    useEffect(() => {
        getEBook();
    }, [id]);

    const formatStoryContent = (text) => {
        if (!text) return "";
        
        return text
            .replace(/([.?!])\s*([A-ZÀ-Ỹ])/g, '$1\n\n$2')
            .replace(/\s*-\s*(?=[A-ZÀ-Ỹ])/g, '\n- ')
            .replace(/(\w)\s*-\s*([a-zà-ỹ])/g, '$1 - $2')
            .split('\n').map(line => line.trim()).join('\n');
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
                        <p onClick={() => router.push("/reader/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Trang chủ
                        </p>
                        <p onClick={() => router.push("/reader/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <p onClick={() => router.push("/reader/ebook")}>
                            <LibraryBooksOutlined/>
                            Kho Ebook
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
                { eBook && (
                        <div className={styles.detailsContainer}>
                            <div className={styles.inner}>
                                <header className={styles.detailsHeader}>
                                    <h1 className={styles.mainTitle}>{eBook.title}</h1>
                                    <div className={styles.authorInfo}>
                                        <span>
                                            {
                                                eBook.createdAt
                                                ? format(new Date(eBook?.createdAt), 'dd-MM-yyyy')
                                                :""
                                            }
                                        </span> - <span>{eBook.author}</span>
                                    </div>
                                </header>
                                <div 
                                    className={styles.bodyText}
                                    style={{whiteSpace: 'pre-line'}}
                                >
                                    {
                                        formatStoryContent(eBook.content)
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
                                    onClick={() => {router.push("/reader/borrowedBooks")}}
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