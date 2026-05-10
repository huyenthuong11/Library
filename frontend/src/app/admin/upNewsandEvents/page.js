"use client"

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    PermIdentityOutlined, AssignmentIndOutlined, 
    AddHomeWorkOutlined, EditSquare, AddBoxOutlined, 
    ReceiptLongOutlined, NewspaperOutlined} 
    from '@mui/icons-material';
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/axios";

export default function UpdateNewsAndEvents() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState([""]);
    const [type, setType] = useState("news");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const addParagraph = () => setContent([...content, ""]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleContentChange = (index, value) => {
        const newContent = [...content];
        newContent[index] = value;
        setContent(newContent);
    };

    const postNews = async(e) => {
        e.preventDefault();
        if (!title) {
            alert("Vui lòng điền tiêu đề!");
            return;
        } else if (!type) {
            alert("Vui lòng chọn thể loại");
            return;
        } else if (content.length === 0) {
            alert("Vui lòng điền nội dung tin tức");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("type", type);
            content.forEach((item) => {
                formData.append("content", item);
            });
            
            if (selectedFile) {
                formData.append("image", selectedFile);
            }
            await api.post("/news/postNews", formData);
            alert("Đăng tin tức thành công");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message 
                || "Đã có lỗi xảy ra khi đang đăng tin tức!")
        }
    }

    return (
        <>
        <div className="container">
            <div className="main">
                <div className="header">
                    <div className="webicon"></div>
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
                        <p onClick={() => router.push("/admin/dashboard")}>
                            <HomeOutlined></HomeOutlined>
                            Trang chủ
                        </p>
                        <p onClick={() => router.push("/admin/availableBooks")}>
                            <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                            Kho sách thư viện
                        </p>
                        <a>
                            <NewspaperOutlined/>
                            Đăng thông báo 
                        </a>
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
                    <h2 className={styles.header}>Tạo thông báo mới</h2>
                    <div className={styles.formCard}>
                        <div className={styles.inputGroup}>
                            <label>Tiêu đề thông báo</label>
                            <input 
                                type="text" 
                                placeholder="Nhập tiêu đề thu hút..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Loại thông báo</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="news">Tin tức (News)</option>
                                    <option value="event">Sự kiện (Event)</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Ảnh</label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    hidden
                                    onChange={(e) => {
                                        handleFileChange(e);
                                    }}
                                />
                                <label htmlFor="avatar-upload">
                                    <div className={styles.image}>
                                        {previewUrl ? (
                                            <img 
                                                src={previewUrl} 
                                                alt={title} 
                                            />
                                        ):(
                                            <img
                                                alt="Bấm để tải ảnh bìa"
                                            />
                                        )
                                        }
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nội dung thông báo (Từng đoạn văn)</label>
                            {content.map((p, index) => (
                                <textarea 
                                    key={index}
                                    className={styles.contentArea}
                                    placeholder={`Đoạn văn ${index + 1}...`}
                                    value={p}
                                    onChange={(e) => handleContentChange(index, e.target.value)}
                                />
                            ))}
                            <Button className={styles.btnAdd} onClick={addParagraph}>
                                + Thêm đoạn văn mới
                            </Button>
                        </div>
                        <Button 
                            className={styles.btnSubmit}
                            onClick={postNews}
                        >
                            Đăng thông báo ngay
                        </Button>
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