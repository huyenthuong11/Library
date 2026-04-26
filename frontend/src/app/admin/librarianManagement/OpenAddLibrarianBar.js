import React, { useState } from 'react';
import { 
    Modal, Box, Typography, TextField, 
    Button, Stack, Avatar, IconButton, FormHelperText 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from "@/lib/axios";

const style = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: 450,
    bgcolor: 'background.paper', boxShadow: 24,
    p: 4, borderRadius: '10px',
};

export default function AddLibrarianModal({ open, handleClose, refreshData }) {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    
    // State quản lý lỗi
    const [errors, setErrors] = useState({});

    const validate = () => {
        let tempErrors = {};
        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) tempErrors.email = "Email không được để trống";
        else if (!emailRegex.test(formData.email)) tempErrors.email = "Email không đúng định dạng";

        // Validate Password (ví dụ: ít nhất 6 ký tự)
        if (!formData.password) tempErrors.password = "Mật khẩu không được để trống";
        else if (formData.password.length < 6) tempErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";

        // Validate FullName
        if (!formData.fullName.trim()) tempErrors.fullName = "Họ và tên không được để trống";
        else if (formData.fullName.trim().length < 2) tempErrors.fullName = "Tên quá ngắn";

        setErrors(tempErrors);
        // Trả về true nếu không có lỗi nào (object rỗng)
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Xóa lỗi của field đó khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) { // Giới hạn 2MB
                alert("File ảnh quá lớn (tối đa 2MB)");
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const data = new FormData();
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('fullName', formData.fullName);
            if (file) data.append('avatar', file);

            await api.post('/admin/addLibrarian', data);

            alert("Thêm thủ thư thành công!");
            refreshData();
            handleClose();
            setFormData({ email: '', password: '', fullName: '' });
            setPreview(null);
        } catch (error) {
            alert(error.response?.data?.message);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold" color="#0b485e">THÊM THỦ THƯ</Typography>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                </Stack>

                <form onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
                            <Avatar src={preview} sx={{ width: 70, height: 70, border: '2px solid #d2dfd5' }} />
                            <Button component="label" size="small" sx={{ mt: 1 }}>
                                Chọn ảnh
                                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                            </Button>
                        </Box>

                        <TextField 
                            label="Họ và tên" name="fullName" fullWidth
                            value={formData.fullName} onChange={handleChange}
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                        />

                        <TextField 
                            label="Email" name="email" type="email" fullWidth
                            value={formData.email} onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <TextField 
                            label="Mật khẩu" name="password" type="password" fullWidth
                            value={formData.password} onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                        />

                        <Button 
                            type="submit" variant="contained" 
                        >
                            XÁC NHẬN
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
}