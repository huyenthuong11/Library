"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Avatar, Button, Grid, Typography, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, QrCodeScannerOutlined, 
    LockOutlined, LibraryBooksOutlined} 
    from '@mui/icons-material';
import api from "../../../lib/axios.js";
import { format } from 'date-fns';

export default function Info() {
    const router = useRouter();
    const [readerInfo, setReaderInfo] = useState({});
    const { account, logout } = useContext(AuthContext);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        server: ""
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setReaderInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    const getReaderInfo = async () => {
        try {
            const response = await api.get("/reader/readerProfile", {
                params: {
                    accountId: account?.id,
                }
            });
            const data = response.data;
            setReaderInfo(data);
            console.log("DATA: - page.js:52", data);
        } catch (err) {
            console.error("Failed to fetch reader info: - page.js:54", err);
        }
    }

    useEffect(() => {
        if(!account?.id) return;
        getReaderInfo();
    }, [account?.id])

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("avatar", file);
        await api.put(`/reader/${readerInfo._id}/avatar`, formData);
        alert("Update avatar thành công!");
        getReaderInfo();
        console.log("avatar changed - page.js:70")
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/reader/${readerInfo._id}`,{
                fullName: readerInfo.fullName,
                dateOfBirth: readerInfo.dateOfBirth,
                phoneNumber: readerInfo.phoneNumber
            });    
            alert("Cập nhật thành công!");
            getReaderInfo();
        } catch (error) {
            console.error("Failed to update reader info: - page.js:85", error);
        }
    };

    const handlePasswordChange = (e) => {
        const {name, value} = e.target;
        setPasswordData(prev => ({
            ...prev, 
            [name]: value
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const newErrors = {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
            server: ""
        };
        if (!passwordData.oldPassword) {
            newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
            setErrors(newErrors);
            return;
        }
        if (!passwordData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
            setErrors(newErrors);
            return;
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu có nhiều hơn 6 ký tự";
            setErrors(newErrors);
            return;
        }        
        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng nhập mật khẩu xác nhận";
            setErrors(newErrors);
            return;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            setErrors(newErrors);
            return;
        }
        try {
            await api.put(`/auth/${account.id}/change-password`, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            alert("Đổi mật khẩu thành công");
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setErrors({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
                server: ""
            });
        } catch (err) {
            newErrors.oldPassword = err.response?.data?.message;
            setErrors(newErrors);
        }
    } 
    return (
        <>
            <div className="container">
                    <div className="main">
                        <div className="header">
                                <div className="webicon">
                                    <div className={styles.h}>
                                        Hồ sơ cá nhân
                                    </div>
                                </div>
                                <div className="user">
                                    {readerInfo.avatar ? (
                                        <Avatar
                                            alt="User Avatar"
                                            src={`http://localhost:5000/${readerInfo.avatar}`}
                                            sx={{
                                                objectFit: 'cover',
                                                border: '1px solid rgba(150, 149, 149, 0.65)'
                                            }}
                                        />
                                    ) : (
                                        <Avatar
                                            alt="User Avatar"
                                            sx={{
                                                objectFit: 'cover',
                                            }}
                                        />
                                    )
                                    }
                                    {readerInfo.fullName ? (
                                        <span>{readerInfo.fullName}</span>
                                    ):(
                                        <span>{account?.email}</span>
                                    )
                                    }
                                     
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
                                <a>
                                    <PermIdentityOutlined></PermIdentityOutlined>
                                    Hồ sơ của bạn
                                </a>
            
                                <p onClick={() => router.push("/reader/card")}>
                                    <QrCodeScannerOutlined/>
                                    Thẻ mượn sách
                                </p>
                            </nav>
                        </aside>
                        <div className={styles.main}>
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <PermIdentityOutlined></PermIdentityOutlined>
                                    Thông tin cá nhân
                                </div>
                                <div className={styles.cardMainFrame}>
                                    <div className={styles.cardAvatar}>
                                        Ảnh đại diện
                                        {readerInfo.avatar? (
                                            <Avatar
                                                alt="User Avatar"
                                                src={`http://localhost:5000/${readerInfo.avatar}`}
                                                sx={{
                                                    width: 'clamp(100px, 9.5vw, 180px)',
                                                    height: 'clamp(100px, 9.5vw, 180px)',
                                                    objectFit: 'cover',
                                                    border: '2px solid rgba(150, 149, 149, 0.65)'
                                                }}
                                            />
                                            ) : (
                                            <Avatar
                                                alt="User Avatar"
                                                sx={{
                                                    width: 'clamp(100px, 9.5vw, 180px)',
                                                    height: 'clamp(100px, 9.5vw, 180px)',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            )
                                        }
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            hidden
                                            onChange={(e) => {
                                                handleAvatarChange(e);
                                            }}
                                        />
                                        <label htmlFor="avatar-upload">
                                            <Button component="span"
                                                sx={{
                                                    marginTop:'20px',
                                                    background: '#083d5e',
                                                    color: '#f6f8f9',
                                                    fontSize: '13px',
                                                    textAlign: "center"
                                                }}
                                            >
                                                Cập nhật ảnh
                                            </Button>
                                        </label>  
                                    </div>
                                    <div className={styles.cardMainContext}>
                                        <Grid container justifyContent="center" 
                                            alignItems="center" 
                                            spacing={2}
                                            sx={{ width: '97%', m: 0 }}
                                        >
                                            <Grid item xs={12} md={12} lg={12} xl={12} sx={{ width: '97%', m: 0 }}>
                                                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                                                    <Box mb={1}>
                                                        <Typography
                                                            component="label"
                                                            sx={{
                                                                fontWeight: "bolder",
                                                                fontSize: "20px",
                                                                display: "block",
                                                            }}
                                                        >
                                                            ID: {readerInfo._id}
                                                        </Typography>
                                                    </Box>
                                                    <Box mb={1}>
                                                        <Typography
                                                            component="label"
                                                            sx={{
                                                                fontWeight: "500",
                                                                fontSize: "14px",
                                                                display: "block",
                                                            }}
                                                        >
                                                            Họ và tên
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            size="small"
                                                            name="fullName"
                                                            type="fullName"
                                                            id="fullName"
                                                            autoComplete="fullName"
                                                            InputProps={{
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={readerInfo.fullName}
                                                            onChange={handleChange}
                                                        />
                                                    </Box>

                                                    <Box mb={1}>
                                                        <Typography
                                                            component="label"
                                                            sx={{
                                                                fontWeight: "500",
                                                                fontSize: "14px",
                                                                display: "block",
                                                            }}
                                                        >
                                                            Số điện thoại
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            size="small"
                                                            name="phoneNumber"
                                                            type="phoneNumber"
                                                            id="phoneNumber"
                                                            autoComplete="phoneNumber"
                                                            inputProps={{
                                                                maxLength: 10,
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={readerInfo.phoneNumber}
                                                            onChange={handleChange}
                                                        />
                                                    </Box>
                                                    <Box mb={1}>
                                                        <Typography
                                                            component="label"
                                                            sx={{
                                                                fontWeight: "500",
                                                                fontSize: "14px",
                                                                display: "block",
                                                            }}
                                                        >
                                                            Email
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            size="small"
                                                            name="email"
                                                            type="email"
                                                            id="email"
                                                            autoComplete="email"
                                                            disabled
                                                            InputProps={{
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={account?.email}
                                                            onChange={handleChange}
                                                        />
                                                    </Box>
                                                    <Box mb={1}>
                                                        <Typography
                                                            component="label"
                                                            sx={{
                                                                fontWeight: "500",
                                                                fontSize: "14px",
                                                                display: "block",
                                                            }}
                                                        >
                                                            Ngày sinh
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            fullWidth
                                                            type="date"
                                                            size="small"
                                                            name="dateOfBirth"
                                                            id="dateOfBirth"
                                                            autoComplete="dateOfBirth"
                                                            InputProps={{
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={readerInfo && readerInfo.dateOfBirth
                                                                ? format(new Date(readerInfo.dateOfBirth), 'yyyy-MM-dd')
                                                                :""
                                                            }
                                                            onChange={handleChange}
                                                        />
                                                    </Box>
                                                    <Button
                                                        type="submit"
                                                        sx={{
                                                            marginTop:'20px',
                                                            marginLeft: '10vw',
                                                            background: '#083d5e',
                                                            color: '#f6f8f9',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Lưu thay đổi
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card2}>
                                <div className={styles.cardHeader}>
                                    <LockOutlined></LockOutlined>
                                    Cài đặt tài khoản & Bảo mật
                                </div>
                                <div className={styles.cardMainFrame}>
                                    <Grid container justifyContent="center" alignItems="center" spacing={2} sx={{ width: '97%', m: 0 }}>
                                        <Grid item xs={12} md={12} lg={12} xl={12} sx={{ width: '97%', m: 0 }}>
                                            <Box component="form" onSubmit={handleChangePassword} noValidate sx={{ width: '100%', mt: 1 }}>
                                                <Box mb={1}>
                                                    <Typography
                                                        component="label"
                                                        sx={{
                                                            fontWeight: "500",
                                                            fontSize: "14px",
                                                            display: "block",
                                                        }}
                                                    >
                                                        Mật khẩu hiện tại
                                                    </Typography>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        size="small"
                                                        name="oldPassword"
                                                        type="oldPassword"
                                                        id="oldPassword"
                                                        autoComplete="oldPassword"
                                                        InputProps={{
                                                            style: { borderRadius: 8 },
                                                        }}
                                                        value={passwordData.oldPassword}
                                                        onChange={handlePasswordChange}
                                                        error={!!errors.oldPassword}
                                                        helperText={errors.oldPassword}
                                                    />
                                                </Box>
                                                <Box mb={1}>
                                                    <Typography
                                                        component="label"
                                                        sx={{
                                                            fontWeight: "500",
                                                            fontSize: "14px",
                                                            display: "block",
                                                        }}
                                                    >
                                                        Mật khẩu mới
                                                    </Typography>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        size="small"
                                                        name="newPassword"
                                                        type="newPassword"
                                                        id="newPassword"
                                                        autoComplete="newPassword"
                                                        InputProps={{
                                                            style: { borderRadius: 8 },
                                                        }}
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                        error={!!errors.newPassword}
                                                        helperText={errors.newPassword}
                                                    />
                                                </Box>
                                                <Box mb={1}>
                                                    <Typography
                                                        component="label"
                                                        sx={{
                                                            fontWeight: "500",
                                                            fontSize: "14px",
                                                            display: "block",
                                                        }}
                                                    >
                                                        Xác nhận mật khẩu mới
                                                    </Typography>
                                                    <TextField
                                                        required
                                                        fullWidth
                                                        size="small"
                                                        name="confirmPassword"
                                                        type="confirmPassword"
                                                        id="confirmPassword"
                                                        autoComplete="confirmPassword"
                                                        InputProps={{
                                                            style: { borderRadius: 8 },
                                                        }}
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        error={!!errors.confirmPassword}
                                                        helperText={errors.confirmPassword}
                                                    />
                                                </Box>
                                                <Button
                                                    type="submit"
                                                    sx={{
                                                        marginTop:'20px',
                                                        marginLeft: '15vw',
                                                        background: '#083d5e',
                                                        color: '#f6f8f9',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Lưu thay đổi
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
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