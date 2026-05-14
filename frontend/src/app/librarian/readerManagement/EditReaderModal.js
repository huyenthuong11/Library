import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';
import api from '@/lib/axios';

export default function EditReaderModal({ open, handleClose, refreshData, readerData }) {
    const [formData, setFormData] = useState({
        fullName: "", phoneNumber: "", dateOfBirth: "", address: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (readerData) {
            setFormData({
                fullName: readerData.fullName || "",
                phoneNumber: readerData.phoneNumber || "",
                dateOfBirth: readerData.dateOfBirth ? new Date(readerData.dateOfBirth).toISOString().split('T')[0] : "",
                address: readerData.address || ""
            });
        }
    }, [readerData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.fullName) return alert("Họ và tên không được để trống!");
        setLoading(true);
        try {
            await api.put(`/admin/updateReader/${readerData._id}`, formData); // Cập nhật dựa vào ID độc giả
            alert("Cập nhật thông tin thành công!");
            refreshData();
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật thông tin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0b485e', textAlign: 'center' }}>
                SỬA THÔNG TIN ĐỘC GIẢ
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Họ và tên (*)" name="fullName" value={formData.fullName} onChange={handleChange} size="small" />
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
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
