"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Typography, Alert, TextField } from "@mui/material";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from "./page.module.css";
import api from "../../lib/axios.js";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [otp, setOtp] = useState("");
    const [token, setToken] = useState("");

    const [message, setMessage] = useState({
        type: "", 
        text: "",
    });

    const [errors, setErrors] = useState({});

    const showMessage = (type, text, time = 3000) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), time);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateEmail = () => {
        if (!form.email) return "Vui lòng nhập email";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(form.email)) return "Email không hợp lệ";
        return "";
    };

    const handleSendOtp = async () => {
        const emailError = validateEmail();
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        try {
            await api.post("/forgotPassword/sendOtp", { email: form.email });
            setStep(2);
            showMessage("success", "Đã gửi OTP");
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Gửi OTP thất bại");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            showMessage("error", "Nhập OTP");
            return;
        }

        try {
            const res = await api.post("/forgotPassword/receiveOtp", {
                email: form.email,
                otp,
            });

            setToken(res.data.token);
            setStep(3);
            showMessage("success", "Xác nhận OTP thành công");
        } catch (err) {
            showMessage("error", err.response?.data?.message || "OTP sai");
        }
    };

    const handleResetPassword = async () => {
        if (!form.password) {
            setErrors({ password: "Nhập mật khẩu" });
            return;
        }
        if (form.password.length < 6) {
            setErrors({ password: "Tối thiểu 6 ký tự" });
            return;
        }
        if (form.password !== form.confirmPassword) {
            setErrors({ confirmPassword: "Không khớp" });
            return;
        }

        try {
            await api.put("/forgotPassword/changePassword", {
                newPassword: form.password,
                token,
            });

            showMessage("success", "Đổi mật khẩu thành công");
            setTimeout(() => router.push("/login"), 1000);
        } catch (err) {
            showMessage("error", err.response?.data?.message || "Lỗi đổi mật khẩu");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.fill}>
                <div className={styles.registerScreen}>
                    <Grid container justifyContent="center">
                        <Grid item xs={12}>
                            <Box>
                                <Image src="/images/logo.png" alt="logo" width={80} height={80} />

                                <Typography fontSize="24px" fontWeight="700">
                                    QUÊN MẬT KHẨU
                                </Typography>

                                {message.text && (
                                    <Alert severity={message.type} sx={{ mt: 2 }}>
                                        {message.text}
                                    </Alert>
                                )}

                                
                                {step === 1 && (
                                    <>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                        />
                                        <Button fullWidth onClick={handleSendOtp}>
                                            Gửi OTP
                                        </Button>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                        <Button onClick={handleVerifyOtp}>Xác nhận OTP</Button>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Mật khẩu"
                                            type="password"
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            error={!!errors.password}
                                            helperText={errors.password}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Xác nhận mật khẩu"
                                            type="password"
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword}
                                        />
                                        <Button onClick={handleResetPassword}>
                                            Đổi mật khẩu
                                        </Button>
                                    </>
                                )}

                                <Typography mt={2}>
                                    <Link href="/login">Đăng nhập</Link>
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    );
}
