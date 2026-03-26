
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


export default function ForgotPasswordPage() {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState("");
    const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [showPasswordField, setShowPasswordField] = useState(false);
    
    function isValidEmailFormat(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    //State để quản lý lỗi
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirm: '',
        confirmPassword: '',
        otp: '',
        server: ''
    });

    const [otpError, setOtpError] = useState("");

    //State để quản lý giá trị input
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: ""
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
        setErrors(newErrors);
        return isValid;
    };

    const handleSendOtp = async () => {
        if (!validateForm()) return;
        try {
            const res = await api.post("/forgotPassword/sendOtp", {
                email: form.email,
            })
            if (res.status === 200 || res.status === 201) {
                setShowOtp(true);
            }
            setOtp("");
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.response?.data?.message || "Gửi OTP thất bại"
            }));
        }    
    };

    const handleReceiveOtp = async (e) => {
        try {
            e.preventDefault();
            await api.post("/forgotPassword/receiveOtp", {
                email: form.email,
                otp: otp,
            })
            setOtpSuccessMessage("Xác nhận otp thành công!");
            setShowOtp(false);
            setShowPasswordField(true);
        } catch (err) {
            setOtpError(err.response?.data?.message || "Xác nhận otp thất bại")
        }
    };

    const handleForgetPassword = async (e) => {
        e.preventDefault();
        const newErrors = {
            password: "",
            confirmPassword: "",
            server: ""
        };
        if (!form.password) {
            newErrors.password = "Vui lòng nhập mật khẩu mới";
            setErrors(newErrors);
            return;
        } else if (form.password.length < 6) {
            newErrors.password = "Vui lòng nhập mật khẩu có nhiều hơn 6 ký tự";
            setErrors(newErrors);
            return;
        }        
        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng nhập mật khẩu xác nhận";
            setErrors(newErrors);
            return;
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            setErrors(newErrors);
            return;
        }
        try {
            await api.put(`/forgotPassword/change-password`, {
                email: form.email,
                newPassword: form.password
            });
            setSuccessMessage("Đổi mật khẩu thành công");
            setForm({
                email: "",
                password: "",
                confirmPassword: "",
            })
            setErrors({
                email: "",
                password: "",
                confirmPassword: "",
                server: ""
            })
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.response?.data?.message || "Đổi mật khẩu thất bại"
            }));
        }
    };   



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
                                        QUÊN MẬT KHẨU
                                    </Typography>

                                    <Typography as="h2" fontSize="15px">    
                                        Đừng lo, "mọt sách" cũng có lúc đãng trí!
                                        Nhập email để chúng tôi giúp bạn.
                                    </Typography>
                                    <Box component="form" noValidate sx={{ width: '100%', mt: 1 }}>
                                        {!showPasswordField &&
                                            <Box>
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
                                                        label="Email"
                                                        type="email"
                                                        id="email"
                                                        InputProps={{
                                                            style: { borderRadius: 8 },
                                                        }}
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        error={!!errors.email}
                                                        helperText={errors.email}
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
                                                    GỬI MÃ OTP
                                                </Button>
                                            </Box>
                                        }
                                        {
                                            showPasswordField && !showOtp && (
                                                <Box>
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
                                                            name="pasword"
                                                            label="Mật khẩu"
                                                            type="pasword"
                                                            id="pasword"
                                                            InputProps={{
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={form.password}
                                                            onChange={handleChange}
                                                            error={!!errors.password}
                                                            helperText={errors.password}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <TextField
                                                            required
                                                            margin="normal"
                                                            fullWidth
                                                            name="confirmPasword"
                                                            label="Xác nhận mật khẩu mới"
                                                            type="password"
                                                            id="confirmPassword"
                                                            inputProps={{
                                                                style: { borderRadius: 8 },
                                                            }}
                                                            value={form.confirmPassword}
                                                            onChange={handleChange}
                                                            error={!!errors.confirmPassword}
                                                            helperText={errors.confirmPassword}
                                                        />
                                                    </Box>
                                                    <Button
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
                                                        onClick={handleForgetPassword}
                                                    >
                                                        Lưu thay đổi
                                                    </Button>
                                                </Box>
                                            )
                                        }
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
                                                        marginTop: "70px",
                                                        margin: "100px auto",
                                                        width: 300,
                                                        borderRadius: "20px",
                                                    }}>
                                                    
                                                        <Grid container justifyContent="center" alignItems="center" spacing={2}>
                                                            <Grid item xs={12} md={12} lg={12} xl={12}>
                                                                <Box>
                                                                    <Typography as="h1" fontSize="18px" fontWeight="700" mb="5px">
                                                                        NHẬP OTP
                                                                    </Typography>
                                                                </Box>
                                                                <Box noValidate sx={{ width: '100%', mt: 1 }}>
                                                                    {otpError && (
                                                                        <Alert severity="error" sx={{ mb: 2 }}>
                                                                            {otpError}
                                                                        </Alert>
                                                                    )}
                                                                        
                                                                    {otpSuccessMessage && (
                                                                        <Alert severity="success" sx={{ mb: 2 }}>
                                                                            {otpSuccessMessage}
                                                                        </Alert>
                                                                    )}
                                                                    <Box>
                                                                        <TextField
                                                                            required
                                                                            margin="normal"
                                                                            fullWidth
                                                                            name="otp"
                                                                            label="Otp"
                                                                            type="text"
                                                                            id="otp"
                                                                            inputProps={{
                                                                                style: { borderRadius: 8 },
                                                                                maxLength: 6,
                                                                            }}
                                                                            placeholder="6 số"
                                                                            value={otp}
                                                                            onChange={(e) => {
                                                                                setOtp(e.target.value);
                                                                                setOtpError("");
                                                                            }}
                                                                            error={!!otpError}
                                                                            helperText={otpError}
                                                                        />
                                                                    </Box>
                                                                    <Button onClick={handleReceiveOtp}> Xác nhận </Button>
                                                                    <Button onClick={handleSendOtp}> Gửi lại mã </Button>
                                                                    <Button onClick={() => setShowOtp(false)}> Đóng </Button>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
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


