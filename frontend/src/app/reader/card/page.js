"use client";
import styles from "./page.module.css";
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, QrCodeScannerOutlined, 
    LibraryBooksOutlined} 
    from '@mui/icons-material';
import useReaderInfo from "@/hook/useReaderInfo";
import { AuthContext } from "@/context/AuthContext";
import { QRCodeSVG } from 'qrcode.react';

export default function UserLibraryCard () {
    const qrRef = useRef();
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar, readerId, refreshReaderInfo} = useReaderInfo(account?.id);
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    const handleDownload = () => {
        const svg = qrRef.current.querySelector("svg");
        if (!svg) return alert("Không tìm thấy mã QR!");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `LibraryCard-${readerId}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        // Chuyển SVG sang Base64 để vẽ lên Canvas
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
                            Hồ sơ của bạn
                        </p>
    
                        <a>
                            <QrCodeScannerOutlined/>
                            Thẻ mượn sách
                        </a>
                    </nav>
                </aside>
                <div className={styles.main}>
                    <div className={styles.cardWrapper}>
                        <div ref={qrRef} className={styles.qrContainer}>
                            <QRCodeSVG value={readerId} size={200} level="H"/>
                        </div>
                        <div style={{marginTop: '15px'}}>
                            <h3 style={{ margin: '5px 0' }}>{fullName}</h3>
                        </div>
                        <Button onClick={handleDownload} className={styles.downloadBtn}>
                            Tải mã QR mượn sách
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        </>                    
    )
}