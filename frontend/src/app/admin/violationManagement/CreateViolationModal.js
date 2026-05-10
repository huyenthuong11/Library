"use client";
import React, { useState, useEffect } from "react";
import { Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import api from "@/lib/axios";
import styles from "./CreateViolationModal.module.css"; 

export default function CreateViolationModal({ handleClose, readerId, documentId, copyId, coverPrice, onSuccess }) {
    const [violationType, setViolationType] = useState("late"); 
    const [daysLate, setDaysLate] = useState(0);
    // Tự động nhận giá bìa truyền từ bảng bên ngoài vào
    const [bookPrice, setBookPrice] = useState(coverPrice || 0); 
    const [fineAmount, setFineAmount] = useState(0);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    // Thực thi quy định phạt: 2k/ngày, 0.5 giá bìa hỏng, 1.0 giá bìa mất
    useEffect(() => {
        let amount = 0;
        let generatedReason = "";

        if (violationType === "late") {
            amount = (parseInt(daysLate) || 0) * 2000;
            generatedReason = `Nộp muộn sách ${daysLate || 0} ngày: Phạt 2.000đ/ngày.`;
        } else if (violationType === "damaged") {
            amount = (parseInt(bookPrice) || 0) * 0.5;
            generatedReason = `Làm hư hại sách: Phạt 50% giá bìa.`;
        } else if (violationType === "lost") {
            amount = (parseInt(bookPrice) || 0) * 1;
            generatedReason = `Làm mất sách: Đền bù 100% giá bìa.`;
        }
        
        setFineAmount(amount);
        setReason(generatedReason);
    }, [violationType, daysLate, bookPrice]);

    const handleSubmit = async () => {
        if (fineAmount <= 0) {
            alert("Số tiền phạt phải lớn hơn 0!");
            return;
        }

        setLoading(true);
        try {
            await api.post("/violation/create", {
                readerId,
                documentId,
                copyId,
                reason,
                fineAmount
            });
            
            alert("Lập biên bản phạt thành công!");
            if(onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            alert("Đã xảy ra lỗi khi tạo biên bản!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContainer}>
                <IconButton onClick={handleClose} className={styles.closeBtn}>
                    <CloseIcon />
                </IconButton>

                <h2 className={styles.title}>Lập Biên Bản Vi Phạm</h2>

                <div className={styles.formGroup}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Loại vi phạm</InputLabel>
                        <Select
                            value={violationType}
                            label="Loại vi phạm"
                            onChange={(e) => setViolationType(e.target.value)}
                            MenuProps={{ sx: { zIndex: 99999 } }}
                        >
                            <MenuItem value="late">Trễ hạn trả sách</MenuItem>
                            <MenuItem value="damaged">Làm hư hại sách</MenuItem>
                            <MenuItem value="lost">Làm mất sách</MenuItem>
                        </Select>
                    </FormControl>

                    {violationType === "late" && (
                        <TextField
                            label="Số ngày nộp muộn"
                            type="number"
                            fullWidth
                            size="small"
                            value={daysLate}
                            onChange={(e) => setDaysLate(e.target.value)}
                        />
                    )}

                    {(violationType === "damaged" || violationType === "lost") && (
                        <TextField
                            label="Giá bìa của sách (VNĐ)"
                            type="number"
                            fullWidth
                            size="small"
                            value={bookPrice}
                            onChange={(e) => setBookPrice(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                            }}
                        />
                    )}

                    <TextField
                        label="Lý do chi tiết"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <div className={styles.summaryBox}>
                        Tổng tiền phạt: <span>{fineAmount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>

                    <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={handleSubmit}
                        disabled={loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Đang xử lý..." : "XÁC NHẬN LẬP BIÊN BẢN"}
                    </Button>
                </div>
            </div>
        </div>
    );
}