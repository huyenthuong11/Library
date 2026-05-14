import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "@/lib/axios";

export default function EditLibrarianModal({ open, handleClose, refreshData, librarianData }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (librarianData) {
            setFullName(librarianData.fullName || "");
            setEmail(librarianData.accountId?.email || "");
        }
    }, [librarianData]);

    const handleSubmit = async () => {
        if (!fullName.trim() || !email.trim()) {
            alert("Họ tên và Email không được để trống!");
            return;
        }

        try {
            await api.put(`/admin/updateLibrarian/${librarianData._id}`, { fullName, email });
            alert("Cập nhật thông tin thành công!");
            refreshData(); 
            handleClose(); 
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data?.message || ""));
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold", color: "#0b485e" }}>
                Chỉnh sửa thông tin thủ thư
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