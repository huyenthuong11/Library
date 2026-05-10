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


export default function AddCopy({ bookId, refreshAvailableBooks, handleClose }) {
    const [numberOfCopy, setNumberOfCopy] = useState(0);
    const [position, setPosition] = useState([]);
    const [isSplit, setIsSplit] = useState(false);
    const [allocations, setAllocations] = useState([{ position: '', qty: 1 }]);
    const totalAllocated = allocations.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const remaining = Number(numberOfCopy || 0) - totalAllocated;
    const finalizeData = () => {
        const finalPositions = [];
        allocations.forEach(a => {
            for(let i = 0; i < Number(a.qty); i++) {
                finalPositions.push(a.position);
            }
        });
        return finalPositions;
    };

    const { locationList } = useLocationList();
    const availableLocationList = locationList
        .filter((s) => s.usedStorage < 100)
        .map(s => ({
            value: s.position,
            label: s.position
        }));

    const handleChange = (e) => {
        setNumberOfCopy(Number(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (totalAllocated !== Number(numberOfCopy)) {
                alert(`Bạn mới chia được ${totalAllocated}/${numberOfCopy} chỗ. Vui lòng kiểm tra lại!`);
                return; 
            }
            const finalPositions = finalizeData();
            setPosition(finalPositions);
            await api.post(`/books/addCopy/${bookId}`, {
                addNum: numberOfCopy,
                position: finalPositions
            });
            refreshAvailableBooks();
            handleClose();
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi thêm sách!");
        }
    }
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
                        value={numberOfCopy}
                        onChange={handleChange}
                    />
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, border: '1px dotted #b2dfdb' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>
                            Phân bổ vị trí ({totalAllocated}/{numberOfCopy || 0})
                        </Typography>

                        {Number(numberOfCopy) > 1 && (
                            <Button
                                size="small"
                                onClick={() => {
                                    setIsSplit(!isSplit);
                                    if (isSplit) setAllocations([{ position: allocations[0]?.position 
                                        || '', qty: numberOfCopy }]);
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
                                        if (!isSplit) newAlloc[index].qty = numberOfCopy;
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
            </div>
        </div> 
        </>
    )
}
