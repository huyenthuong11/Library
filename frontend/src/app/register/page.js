"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Typography, Alert, TextField } from "@mui/material";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from "./page.module.css";
import api from "../../lib/axios.js";

export default function RegisterPage() {
    const router = useRouter();

    const [step, setStep] = useState("form");

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    const [otp, setOtp] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    function isValidEmailFormat(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));

        setMessage({ type: "", text: "" });
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: "", password: "" };

        if (!form.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
            isValid = false;
        } else if (!isValidEmailFormat(form.email)) {
            newErrors.email = "Email không hợp lệ";
            isValid = false;
        }

        if (!form.password.trim()) {
            newErrors.password = "Vui lòng nhập mật khẩu";
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSendOtp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await api.post("/auth/sendOtp", {
                email: form.email,
            });

            setStep("otp");
            setOtp("");

            setMessage({
                type: "success",
                text: "OTP đã được gửi"
            });

        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Gửi OTP thất bại"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!otp || otp.length !== 6) {
            setMessage({
                type: "error",
                text: "OTP phải đủ 6 số"
            });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await api.post("/auth/register", {
                email: form.email,
                password: form.password,
                otp: otp,
            });

            setMessage({
                type: "success",
                text: "Đăng ký thành công!"
            });

            setTimeout(() => {
                router.push("/login");
            }, 1000);

        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Đăng ký thất bại"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.fill}>
                <div className={styles.registerScreen}>
                    <Grid container justifyContent="center" alignItems="center">
                        <Grid item xs={12}>
                            <Box>
                                <Typography fontSize="28px" fontWeight="700">
                                    <Image src="/images/logo.png" alt="logo" width={100} height={100} />
                                </Typography>

                                <Typography fontSize="28px" fontWeight="700">
                                    ĐĂNG KÝ
                                </Typography>

                                {message.text && (
                                    <Alert severity={message.type} sx={{ mb: 2 }}>
                                        {message.text}
                                    </Alert>
                                )}

                                <Box sx={{ mt: 2 }}>

                                    {step === "form" && (
                                        <>
                                            <TextField
                                                fullWidth
                                                name="email"
                                                label="Email"
                                                value={form.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                margin="normal"
                                            />

                                            <TextField
                                                fullWidth
                                                name="password"
                                                label="Mật khẩu"
                                                type="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                error={!!errors.password}
                                                helperText={errors.password}
                                                margin="normal"
                                            />

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ mt: 2 }}
                                                onClick={handleSendOtp}
                                                disabled={loading}
                                            >
                                                {loading ? "Đang gửi..." : "Gửi OTP"}
                                            </Button>
                                        </>
                                    )}

                                    {step === "otp" && (
                                        <>
                                            <TextField
                                                fullWidth
                                                label="Nhập OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                margin="normal"
                                            />

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{ mt: 2 }}
                                                onClick={handleRegister}
                                                disabled={loading}
                                            >
                                                {loading ? "Đang xử lý..." : "Xác nhận đăng ký"}
                                            </Button>

                                            <Button
                                                fullWidth
                                                sx={{ mt: 1 }}
                                                onClick={handleSendOtp}
                                                disabled={loading}
                                            >
                                                Gửi lại OTP
                                            </Button>
                                        </>
                                    )}

                                </Box>

                                <Typography mt={2}>
                                    Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    );
}
