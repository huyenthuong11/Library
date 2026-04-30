import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "@/lib/axios";

export default function EditReaderModal({ open, handleClose, refreshData, readerData }) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");

    // Khi có dữ liệu reader truyền vào, tự động điền vào form
    useEffect(() => {
        if (readerData) {
            setFullName(readerData.fullName || "");
            setPhoneNumber(readerData.phoneNumber || "");
            // Lấy email từ accountId hoặc từ reader
            setEmail(readerData.accountId?.email || readerData.email || "");
        }
    }, [readerData]);

    const handleSubmit = async () => {
        if (!fullName.trim() || !email.trim()) {
            alert("Họ tên và Email không được để trống!");
            return;
        }

        try {
            await api.put(`/admin/updateReader/${readerData._id}`, { fullName, phoneNumber, email });
            alert("Cập nhật thông tin thành công!");
            refreshData(); // Gọi hàm load lại bảng
            handleClose(); // Đóng popup
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data?.message || ""));
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold", color: "#0b485e" }}>
                Chỉnh sửa thông tin độc giả
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Họ và tên"
                    fullWidth
                    variant="outlined"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Email tài khoản"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mt: 2 }}
                />
                <TextField
                    margin="dense"
                    label="Số điện thoại"
                    fullWidth
                    variant="outlined"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} sx={{ color: "gray" }}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: "#0b485e" }}>
                    Lưu thay đổi
                </Button>
            </DialogActions>
        </Dialog>
    );
}