"use client";
import React, { useState } from "react";
import { Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import api from "@/lib/axios";
import styles from "./EditViolationModal.module.css"; 

export default function EditViolationModal({ violation, handleClose, onSuccess }) {
    const [formData, setFormData] = useState({
        reason: violation.reason,
        fineAmount: violation.fineAmount,
        status: violation.status
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.patch(`/violation/update/${violation._id}`, formData);
            alert("Cập nhật phiếu phạt thành công!");
            if(onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            alert("Lỗi khi cập nhật!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContainer}>
                <IconButton onClick={handleClose} className={styles.closeBtn}><CloseIcon /></IconButton>
                <h2 className={styles.title}>Chỉnh sửa phiếu phạt</h2>
                <div className={styles.formGroup}>
                    
                    <FormControl fullWidth size="small">
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={formData.status}
                            label="Trạng thái"
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            MenuProps={{ sx: { zIndex: 99999 } }} 
                        >
                            <MenuItem value="unpaid">Chưa nộp phạt</MenuItem>
                            <MenuItem value="paid">Đã thu tiền</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField 
                        label="Số tiền phạt (VNĐ)" type="number" fullWidth size="small"
                        value={formData.fineAmount} 
                        onChange={(e) => setFormData({...formData, fineAmount: e.target.value})} 
                    />

                    <TextField 
                        label="Lý do chi tiết" fullWidth size="small" multiline rows={3}
                        value={formData.reason} 
                        onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                    />
                    
                    <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading} className={styles.submitBtn}>
                        {loading ? "Đang lưu..." : "LƯU THAY ĐỔI"}
                    </Button>
                </div>
            </div>
        </div>
    );
}