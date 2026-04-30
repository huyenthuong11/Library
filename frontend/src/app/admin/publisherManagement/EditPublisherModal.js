import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "@/lib/axios";

export default function EditPublisherModal({ publisher, handleClose, onSuccess }) {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (publisher) {
            setFormData({
                name: publisher.name || "",
                email: publisher.email || "",
                phone: publisher.phone || "",
                address: publisher.address || ""
            });
        }
    }, [publisher]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert("Tên nhà xuất bản không được để trống!");
            return;
        }

        try {
            setIsSaving(true);
            await api.put(`/publisher/update/${publisher._id}`, formData);
            alert("Cập nhật thông tin thành công!");
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            alert("Lỗi khi cập nhật: " + (error.response?.data?.message || "Vui lòng thử lại"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={Boolean(publisher)} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold", color: "#0b485e", borderBottom: "1px solid #eee", textAlign: "center" }}>
                Chỉnh Sửa Nhà Xuất Bản
            </DialogTitle>
            <DialogContent sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="Tên Nhà Xuất Bản (*)" fullWidth variant="outlined" sx={{ mt: 1 }}
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
                <TextField label="Email liên hệ" fullWidth variant="outlined" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
                <TextField label="Số điện thoại" fullWidth variant="outlined" 
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
                <TextField label="Địa chỉ" fullWidth multiline rows={2} variant="outlined" 
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "center", gap: 2 }}>
                <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ width: "40%" }}>HỦY BỎ</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSaving} sx={{ backgroundColor: "#0b485e", width: "40%" }}>
                    {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}