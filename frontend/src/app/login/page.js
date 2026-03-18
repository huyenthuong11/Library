
"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Typography, TextField, Alert } from "@mui/material";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import Image from "next/image";
import styles from "./page.module.css";
import api from "../../lib/axios.js";

export default function LoginPage() {
    const router = useRouter();
    const {login} = useContext(AuthContext);
    const [successMessage, setSuccessMessage] = useState("");

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        //Validate form trước khi gửi request
        if (!validateForm()) return;

        try {
            //call API Login
            const response = await api.post("/auth/login", {
                email: form.email,
                password: form.password
            });
            
            if (response.status === 200 || response.status === 201) {
                console.log("Login success  login:101 - page.js:100", response.data);
                setSuccessMessage("Đăng nhập thành công");
                setForm({
                    email: "",
                    password: "",
                });
                
                login(response.data.account, response.data.token);
                console.log("/ - page.js:108");
                router.push("/");
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                server: err.response?.data?.message || "Đăng nhập thất bại"
            }));
        } 
    };

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.fill}>
                    <div className={styles.loginScreen}>
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
                                        ĐĂNG NHẬP VÀO TÀI KHOẢN CỦA BẠN
                                    </Typography>

                                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
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
                                            type="submit"
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
                                            ĐĂNG NHẬP
                                        </Button>
                                    </Box>
                                        
                                    <Typography as="h2" fontSize="15px" mb="30px" mt="10px">    
                                        Chưa có tài khoản?
                                        <Link href="/register">
                                            Đăng ký ngay
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


