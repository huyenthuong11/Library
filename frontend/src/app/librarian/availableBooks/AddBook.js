"use client";
import styles from "./AddBook.module.css";
import { CancelOutlined as CancelOutlinedIcon } from "@mui/icons-material";
import { Button, Grid, Typography, TextField, 
    Box } from "@mui/material";
import api from "@/lib/axios";
import Select from 'react-select';
import usePublisherInfo from "@/hook/useGetPublisher";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import useLocationList from "@/hook/useAvailableLocation";
import { AddCircleOutlined } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";




export default function AddBook({ refreshAvailableBooks, handleClose }) {
    
    const [newData, setNewData] = useState({
        title: "",
        author: "",
        category: [],
        publisherId: "",
        publishDate: "",
        pages: "",
        coverPrice: "",
        description: "",
        language: "vi", 
        isbn: "",
        numberOfCopy: 1
    });
    const [allocations, setAllocations] = useState([{ position: '', qty: 1 }]);
    const totalAllocated = allocations.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const remaining = Number(newData.numberOfCopy || 0) - totalAllocated;
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const { publisherInfo } = usePublisherInfo();
    const [openAddPos, setOpenAddPos] = useState(null);
    const [isSplit, setIsSplit] = useState(false);
    const { locationList } = useLocationList();
    const availableLocationList = locationList
        .filter((s) => s.usedStorage < 100)
        .map(s => ({
            value: s.position,
            label: s.position
        }));

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

    const finalizeData = () => {
        const finalPositions = [];
        allocations.forEach(a => {
            for(let i = 0; i < Number(a.qty); i++) {
                finalPositions.push(a.position);
            }
        });
        return finalPositions;
    };

    const publisherOptions = publisherInfo.map(p => ({ 
        value: p._id, 
        label: p.name }));

    const languageOptions = [
        { value: "vi", label: "Tiếng Việt" },
        { value: "en", label: "Tiếng Anh" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData(prev => ({ 
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
        e.preventDefault();

        if (!newData.title || !newData.author || !newData.isbn) {
            alert("Vui lòng điền các trường bắt buộc (Tiêu đề, Tác giả, ISBN)");
            return;
        }

        try {
            const formData = new FormData();
            if (selectedFile) formData.append("image", selectedFile);
            if (totalAllocated !== Number(newData.numberOfCopy)) {
                alert(`Bạn mới chia được ${totalAllocated}/${newData.numberOfCopy} chỗ. Vui lòng kiểm tra lại!`);
                return; 
            }
            const finalPositions = finalizeData();
            finalPositions.forEach((pos) => {
                formData.append("position", pos);
            });
            Object.keys(newData).forEach(key => {
                if (key === 'category') {
                    newData.category.forEach(cat => formData.append("category[]", cat));
                } else {
                    formData.append(key, newData[key]);
                }
            });

            await api.post("/books/addBook", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Thêm sách mới thành công!");
            refreshAvailableBooks();
            handleClose();
        } catch (err) {
            console.error("Add book failed:", err);
            alert(err.response?.data?.message || "Lỗi khi thêm sách!");
        }
    };


    return (
        <>
            <div className={styles.fullScreen}>
                <div className={styles.main}>
                    <div className={styles.header}>
                        Thêm sách mới
                        <Button
                            className={styles.closeIcon}
                            onClick={() => handleClose()}
                        >
                            <CancelOutlinedIcon></CancelOutlinedIcon>
                        </Button>
                    </div>
                    {!openAddPos ? (    
                        <>
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
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt={newData.title} 
                                        />
                                    ):(
                                        <img
                                            alt="Bấm để tải ảnh bìa"
                                        />
                                    )
                                    }
                                </div>
                            </label>
                            <Grid item xs={12} md={12} lg={12} xl={12} sx={{ width: '97%' }}>
                                <Box component="form" noValidate sx={{ width: '100%', mt: 1 }}>
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
                                            name="isbn"
                                            type="isbn"
                                            id="isbn"
                                            InputProps={{
                                                style: { borderRadius: 8 },
                                            }}
                                            value={newData.isbn}
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
                                            value={newData.title}
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
                                            value={newData.author}
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
                                            value={categoryList.filter(opt => newData.category?.includes(opt.value))}
                                            onChange={(selected) => setNewData({ ...newData, category: selected.map(s => s.value) })}
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
                                            value={publisherOptions.find(opt => opt.value === newData.publisherId._id)}
                                            onChange={(selected) => setNewData({ ...newData, publisherId: selected.value })}
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
                                            value={languageOptions.find(opt => opt.value === newData.language)}
                                            onChange={(selected) => setNewData({ ...newData, language: selected.value })}
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
                                            value={newData.coverPrice}
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
                                            value={newData.pages}
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
                                                newData.publishDate
                                                ? format(new Date(newData.publishDate), 'yyyy-MM-dd')
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
                                            value={newData.description}
                                            onChange={handleChange}
                                        />
                                    </Box>
                                    <div className={styles.pagination}>
                                        <Button 
                                            onClick={() => {
                                                setOpenAddPos(true)
                                            }}
                                        >
                                            Trang Sau
                                        </Button>
                                    </div>
                                </Box>
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Box mb={1}>
                                <Typography
                                    component="label"
                                    sx={{
                                        fontWeight: "500",
                                        fontSize: "14px",
                                        display: "block",
                                    }}
                                >
                                    Số lượng bản copy
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="numberOfCopy"
                                    type="number"
                                    id="numberOfCopy"
                                    InputProps={{
                                        style: { borderRadius: 8 },
                                    }}
                                    value={newData.numberOfCopy}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 3, border: '1px dotted #b2dfdb' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography sx={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
                                        Phân bổ vị trí ({totalAllocated}/{newData.numberOfCopy || 0})
                                    </Typography>

                                    {Number(newData.numberOfCopy) > 1 && (
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setIsSplit(!isSplit);
                                                if (isSplit) setAllocations([{ position: allocations[0]?.position 
                                                    || '', qty: newData.numberOfCopy }]);
                                            }}
                                            sx={{ textTransform: 'none', fontSize: '12px', color: '#80cbc4' }}
                                        >
                                            {isSplit ? "Gộp về một kệ" : "Chia nhiều kệ?"}
                                        </Button>
                                    )}
                                </Box>
                                {allocations.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Select
                                                options={availableLocationList}
                                                placeholder="Chọn kệ..."
                                                value={availableLocationList.find(opt => opt.value === item.position) || null}
                                                onChange={(selected) => {
                                                    const newAlloc = [...allocations];
                                                    newAlloc[index].position = selected.value;
                                                    if (!isSplit) newAlloc[index].qty = newData.numberOfCopy;
                                                    setAllocations(newAlloc);
                                                }}
                                            />
                                        </Box>
                                        {isSplit && (
                                            <>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    placeholder="SL"
                                                    sx={{ width: '70px', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                                                    value={item.qty}
                                                    onChange={(e) => {
                                                        const newAlloc = [...allocations];
                                                        newAlloc[index].qty = e.target.value;
                                                        setAllocations(newAlloc);
                                                    }}
                                                />
                                                {allocations.length > 1 && (
                                                    <Button size="small" onClick={() => setAllocations(allocations.filter((_, i) => i !== index))}>
                                                        <DeleteIcon fontSize="small" sx={{ color: '#ffab91' }} />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </Box>
                                ))}
                                {isSplit && remaining > 0 && (
                                    <Button
                                        startIcon={<AddCircleOutlined/>}
                                        size="small"
                                        onClick={() => setAllocations([...allocations, { position: '', qty: 0 }])}
                                        sx={{ color: '#80cbc4', mt: 1 }}
                                    >
                                        Thêm kệ
                                    </Button>
                                )}
                                {remaining !== 0 && (
                                    <Typography sx={{ fontSize: '12px', color: remaining > 0 ? '#fb8c00' : '#e53935', mt: 1, fontStyle: 'italic' }}>
                                        {remaining > 0 ? `* Còn ${remaining} bản chưa có vị trí` : `* Thừa ${Math.abs(remaining)} bản so với tổng số`}
                                   </Typography>
                                )}
                            </Box>
                            <Button
                                onClick={handleSubmit}
                            >
                                Lưu Thay Đổi
                            </Button>
                            <Button 
                                onClick={() => {
                                    setOpenAddPos(false)
                                }}
                            >
                                Trang Trước
                            </Button>
                        </>
                    )}
                    </div> 
                                      
            </div>
        </>
    );
}