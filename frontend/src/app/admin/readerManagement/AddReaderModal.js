import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from "@/lib/axios";

const style = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: 450,
    bgcolor: 'background.paper', boxShadow: 24,
    p: 4, borderRadius: '12px',
};

export default function AddReaderModal({ open, handleClose, refreshData }) {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phoneNumber: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/admin/createReader", formData);
            alert("Thêm độc giả thành công!");
            refreshData();
            handleClose();
            setFormData({ email: '', password: '', fullName: '', phoneNumber: '' });
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi tạo tài khoản");
        } finally { setLoading(false); }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
                <Typography variant="h6" sx={{ color: "#0b485e", fontWeight: "bold", mb: 3 }}>
                    Thêm độc giả mới
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField label="Họ và tên" name="fullName" fullWidth size="small" required onChange={handleChange} />
                        <TextField label="Email" name="email" type="email" fullWidth size="small" required onChange={handleChange} />
                        <TextField label="Số điện thoại" name="phoneNumber" fullWidth size="small" onChange={handleChange} />
                        <TextField label="Mật khẩu" name="password" type="password" fullWidth size="small" required onChange={handleChange} />
                        <Button 
                            type="submit" variant="contained" disabled={loading}
                            sx={{ backgroundColor: "#0b485e", fontWeight: "bold", textTransform: "none" }}
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận thêm"}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}