import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "@/lib/axios";

export default function EditEbookModal({ open, ebook, handleClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { 
        if (ebook) {
            setTitle(ebook.title || "");
            setAuthor(ebook.author || "");
            setCategory(ebook.category || "");
            setDescription(ebook.description || "");
        } 
    }, [ebook]);

    const handleSubmit = async () => {
        if (!title) return alert("Tên sách không được để trống!");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("category", category);
        formData.append("description", description);
        if (coverImage) formData.append("coverImage", coverImage);
        if (fileUrl) formData.append("fileUrl", fileUrl);

        try {
            setIsSaving(true);
            await api.put(`/ebooks/update/${ebook._id}`, formData, { headers: { "Content-Type": "multipart/form-data" }});
            alert("Cập nhật thành công!");
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) { 
            alert("Lỗi khi cập nhật!"); 
        } finally { 
            setIsSaving(false); 
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: "bold", color: "#0b485e", textAlign: "center" }}>Sửa Ebook</DialogTitle>
            <DialogContent sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="Tên Sách (*)" fullWidth size="small" sx={{mt:1}} value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextField label="Tác giả" fullWidth size="small" value={author} onChange={(e) => setAuthor(e.target.value)} />
                {/* <TextField label="Thể loại" fullWidth size="small" value={category} onChange={(e) => setCategory(e.target.value)} /> */}
                <TextField label="Mô tả" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                
                <div style={{ marginTop: "10px" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold" }}>Đổi ảnh bìa mới:</p>
                    <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
                </div>
                <div style={{ marginTop: "10px" }}>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold" }}>Đổi file sách mới:</p>
                    <input type="file" accept="application/pdf,application/epub+zip" onChange={(e) => setFileUrl(e.target.files[0])} />
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "center" }}>
                <Button onClick={handleClose} variant="outlined" color="inherit">HỦY</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSaving} sx={{ bgcolor: "#0b485e" }}>LƯU THAY ĐỔI</Button>
            </DialogActions>
        </Dialog>
    );
    
}