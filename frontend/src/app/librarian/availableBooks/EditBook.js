"use client";
import styles from "./EditBook.module.css";
import { CancelOutlined as CancelOutlinedIcon } from "@mui/icons-material";
import { Button, Grid, Typography, TextField } from "@mui/material";
import api from "@/lib/axios";
import { Box } from "@mui/system";
import Select from 'react-select';
import usePublisherInfo from "@/hook/useGetPublisher";
import { useState } from "react";
import { format } from "date-fns";

export default function EditBook({book, refreshAvailableBooks, handleClose}) { 
    const [editData, setEditData] = useState({ ...book });
    const [selectedFile, setSelectedFile] = useState(null);
    const { publisherInfo } = usePublisherInfo();
    const [previewUrl, setPreviewUrl] = useState(null);
    const categoryList = [
        {value: "history", label: "Lịch sử"},
        {value: "children", label: "Trẻ em"},
        {value: "business", label: "Kinh doanh"},
        {value: "science", label: "Khoa học"},
        {value: "technology", label: "Kỹ thuật"},
        {value: "education", label: "Giáo dục"},
        {value: "exam-prep", label: "Luyện thi"},
        {value: "comics", label: "Truyện tranh"},
        {value: "health", label: "Sức khỏe"},
        {value: "travel", label: "Du lịch"},
        {value: "cooking", label: "Ẩm thực"},
        {value: "self-help", label: "Tâm lý"},
        {value: "art", label: "Nghệ thuật"},
        {value: "geography", label: "Địa lý"},
        {value: "novel", label: "Tiểu thuyết"},
    ];

    const publisherOptions = publisherInfo.map(p => ({ 
        value: p._id, 
        label: p.name 
    }));

    const languageOptions = [
        { value: "vi", label: "Tiếng Việt" },
        { value: "en", label: "Tiếng Anh" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        try {           
            e.preventDefault();
            const formData = new FormData();
            if (selectedFile) {
                formData.append("image", selectedFile);
            }
            formData.append("title", editData.title);
            formData.append("author", editData.author);
            if (Array.isArray(editData.category)) {
                editData.category.forEach(cat => formData.append("category", cat));
            } 
            formData.append("publisherId", editData.publisherId._id);
            formData.append("publishDate", editData.publishDate);
            formData.append("pages", editData.pages);
            formData.append("coverPrice", editData.coverPrice);
            formData.append("description", editData.description);
            formData.append("language", editData.language);  
            await api.patch(`/books/updateBook/${book._id}`, formData);
            alert("Cập nhật sách thành công!");
            refreshAvailableBooks();
            handleClose();
        } catch (err) {
            console.error("Failed to upload avatar - page.js:72", err);
            alert(err.response?.data?.message || "Đã có lỗi xảy ra khi tải ảnh lên!");
        }
    }
    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    };
    
    return (
        <>
            <div className={styles.fullScreen}>
                <div className={styles.main}>
                    <div className={styles.header}>
                        Chỉnh sửa thông tin chi tiết của sách
                        <Button
                            className={styles.closeIcon}
                            onClick={() => handleClose()}
                        >
                            <CancelOutlinedIcon></CancelOutlinedIcon>
                        </Button>
                    </div>
                    <div> Ảnh bìa </div>
                    <input
                        type="file"
                        id="avatar-upload"
                        hidden
                        onChange={(e) => {
                            handleFileChange(e);
                        }}
                    />
                    <label htmlFor="avatar-upload">
                        <div className={styles.image}>
                            <img 
                                src={previewUrl || getImageUrl(book.image)} 
                                alt={book.title} 
                            />
                        </div>
                    </label>
                    <Grid item xs={12} md={12} lg={12} xl={12} sx={{ width: '97%' }}>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    ISBN
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    disabled
                                    name="isbn"
                                    type="isbn"
                                    id="isbn"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={book.isbn}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Tên sách
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="title"
                                    type="text"
                                    id="title"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={editData.title}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Tác giả
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="author"
                                    type="text"
                                    id="author"
                                    inputProps={{
                                        style: { borderRadius: 8, fontWeight: "light" },
                                    }}
                                    value={editData.author}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Thể loại
                                </Typography>
                                <Select
                                    isMulti
                                    isSearchable
                                    fullwidth
                                    size="small"
                                    options={categoryList}
                                    placeholder="Chọn thể loại"
                                    name="category"
                                    type="category"
                                    id="category"
                                    InputProps={{
                                        style: { borderRadius: 8, fontWeight: 200 },
                                    }}
                                    value={categoryList.filter(opt => editData.category?.includes(opt.value))}
                                    onChange={(selected) => setEditData({ ...editData, category: selected.map(s => s.value) })}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Nhà xuất bản
                                </Typography>
                                <Select
                                    options={publisherOptions}
                                    isSearchable
                                    placeholder="Chọn nhà xuất bản"
                                    fullwidth
                                    size="small"
                                    name="publisherId"
                                    type="publisherId"
                                    id="publisherId"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={publisherOptions.find(opt => opt.value === editData.publisherId._id)}
                                    onChange={(selected) => setEditData({ ...editData, publisherId: { _id: selected.value } })}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Ngôn ngữ
                                </Typography>
                                <Select
                                    options={languageOptions}
                                    isSearchable
                                    placeholder="Chọn ngôn ngữ"
                                    fullwidth
                                    size="small"
                                    name="language"
                                    type="language"
                                    id="language"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={languageOptions.find(opt => opt.value === editData.language)}
                                    onChange={(selected) => setEditData({ ...editData, language: selected.value })}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Giá bìa
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="coverPrice"
                                    type="number"
                                    id="coverPrice"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={editData.coverPrice}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Số trang
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="pages"
                                    type="number"
                                    id="pages"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={editData.pages}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Ngày xuất bản
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="publishDate"
                                    type="date"
                                    id="publishDate"
                                    autoComplete="fullName"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={
                                        editData.publishDate
                                        ? format(new Date(editData.publishDate), 'yyyy-MM-dd')
                                        : ''
                                    }                                                      
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Mô tả
                                </Typography>
                                <textarea
                                    size="small"
                                    name="description"
                                    type="text"
                                    id="description"
                                    inputprops={{
                                        style: { borderRadius: 8 },
                                    }}
                                    className={styles.description}
                                    value={editData.description}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ 
                                    width: "30%",
                                    mt: 3, 
                                    mb: 2, 
                                    borderRadius: 8, 
                                    backgroundColor: "#083d5e",
                                    cursor: "pointer",
                                    marginLeft: "255px",
                                }}
                            >
                                Lưu thay đổi
                            </Button>
                        </Box>
                    </Grid>
                 </div>       
            </div>
        </>
    )
}