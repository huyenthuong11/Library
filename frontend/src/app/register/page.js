
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Typography, Alert, TextField } from "@mui/material";
import { borderRadius, Box } from "@mui/system";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from "./page.module.css";
import api from "../../lib/axios.js";


export default function RegisterPage({ params }) {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    function isValidEmailFormat(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    //State để quản lý lỗi
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        server: ''
    });


    //State để quản lý giá trị input
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    //Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        //Xóa lỗi khi user bắt đầu nhập
        setErrors(prev => ({
            ...prev,
            [name]: '',
            server: ''
        }));
        setSuccessMessage('');
    };

    //Validate form
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            server: ''
        };

        //Validate email
        if(!form.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
            isValid = false;
        }  else if (!isValidEmailFormat(form.email)) {
            newErrors.email = "Vui lòng nhập đúng định dạng email";
            isValid = false;
        }
        //Validate password
        if(!form.password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = t("auth.passwordMinLength");
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSendOtp = async () => {
        if (!validateForm()) return;
        try {
            const res = await api.post("/auth/sendOtp", {
                email: form.email,
            })
            if (res.status === 200 || res.status === 201) {
                setShowOtp(true);
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.response?.data?.message || "Gửi OTP thất bại"
            }));
        }    
    };


    const handleRegister = async () => {
        const res = await api.post("/auth/register", {
            email: form.email,
            password: form.password,
            otp: otp,
        })
        router.push("/login");
    }   



    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.fill}>
                    <div className={styles.registerScreen}>
                        <Grid container justifyContent="center" alignItems="center" spacing={2}>
                            <Grid item xs={12} md={12} lg={12} xl={12}>
                                <Box>
                                    <Typography as="h1" fontSize="28px" fontWeight="700" mb="5px">
                                        <Image
                                            src="/images/logo.png"
                                            alt="mcicon"
                                            width={100}
                                            height={100}
                                        />
                                    </Typography>

                                    <Typography as="h1" fontSize="28px" fontWeight="700" mb="5px">
                                        ĐĂNG KÝ TÀI KHOẢN MỚI
                                    </Typography>

                                    <Typography as="h2" fontSize="15px" mb="30px">    
                                        Vui lòng điền thông tin để tham gia cộng đồng mọt sách!
                                    </Typography>

                                    <Box component="form" noValidate sx={{ width: '100%', mt: 1 }}>
                                        {errors.server && (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errors.server}
                                            </Alert>
                                            )}
                                            
                                            {successMessage && (
                                            <Alert severity="success" sx={{ mb: 2 }}>
                                                {successMessage}
                                            </Alert>
                                            )}
                                        <Box>
                                            <TextField
                                                required
                                                margin="normal"
                                                fullWidth
                                                name="email"
                                                label="email"
                                                type="email"
                                                id="email"
                                                autoComplete="email"
                                                InputProps={{
                                                    style: { borderRadius: 8 },
                                                }}
                                                value={form.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                            />
                                        </Box>

                                        <Box>  
                                            <TextField
                                                required
                                                margin="normal"
                                                fullWidth
                                                name="password"
                                                label="Mật khẩu"
                                                type="password"
                                                id="password"
                                                autoComplete="current-password"
                                                InputProps={{
                                                    style: { borderRadius: 8 },
                                                }}
                                                value={form.password}
                                                onChange={handleChange}
                                                error={!!errors.password}
                                                helperText={errors.password}
                                            />
                                        </Box>
                                        <Button
                                            onClick={handleSendOtp}
                                            fullWidth
                                            variant="contained"
                                            sx={{
                                                mt: 2,
                                                textTransform: "capitalize",
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                fontSize: "16px",
                                                padding: "12px 10px",
                                                color: "#fff !important",
                                            }}
                                            >
                                            ĐĂNG KÝ
                                        </Button>

                                        {
                                            showOtp && (
                                                <div style={{
                                                    position: "fixed",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    borderRadius: "20px",
                                                    background: "rgba(0,0,0,0.5)"
                                                }}>
                                                    <div style={{
                                                        background: "white",
                                                        padding: 20,
                                                        margin: "100px auto",
                                                        width: 300,
                                                        borderRadius: "20px",
                                                    }}>
                                                        <h3>Nhập OTP</h3>
                                                        <input
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                            placeholder="6 số"
                                                        />
                                                        <Button onClick={handleRegister}>
                                                            Xác nhận
                                                        </Button>

                                                        <Button onClick={handleSendOtp}>
                                                            Gửi lại mã
                                                        </Button>

                                                        <Button onClick={() => setShowOtp(false)}>
                                                            Đóng
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </Box>
                                        
                                    <Typography as="h2" fontSize="15px" mb="30px" mt="10px">    
                                        Đã có tài khoản?
                                        <Link href="/login">
                                            Đăng nhập ngay
                                        </Link>
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </div>
                </div>    
            </div>
        </>
    );
};


