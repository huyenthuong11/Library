import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';
import api from '@/lib/axios';

export default function AddReaderModal({ open, handleClose, refreshData }) {
    const [formData, setFormData] = useState({
        email: "", password: "", fullName: "", phoneNumber: "", dateOfBirth: "", address: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.email || !formData.fullName || !formData.password) {
            return alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
        }
        setLoading(true);
        try {
            await api.post("/admin/createReader", formData); // Giả định API tạo user của bạn
            alert("Thêm độc giả thành công!");
            refreshData();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi thêm độc giả! Có thể email đã tồn tại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0b485e', textAlign: 'center' }}>
                THÊM ĐỘC GIẢ MỚI
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Họ và tên (*)" name="fullName" value={formData.fullName} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Email (*)" name="email" type="email" value={formData.email} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Mật khẩu (*)" name="password" type="password" value={formData.password} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Ngày sinh" name="dateOfBirth" type="date" InputLabelProps={{ shrink: true }} value={formData.dateOfBirth} onChange={handleChange} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} size="small" />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
                <Button onClick={handleClose} variant="outlined" color="inherit">Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#0b485e' }} disabled={loading}>
                    {loading ? "Đang lưu..." : "Thêm mới"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}