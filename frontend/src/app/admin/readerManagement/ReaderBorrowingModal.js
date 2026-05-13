import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "@/lib/axios";
import { format } from "date-fns";

export default function ReaderBorrowingModal({ open, handleClose, readerData }) {
    const [borrowHistory, setBorrowHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (readerData && readerData._id) {
            fetchBorrowHistory();
        }
    }, [readerData]);

    const fetchBorrowHistory = async () => {
        try {
            const res = await api.get(`/borrowRecord/reader/${readerData._id}`); 
            setBorrowHistory(res.data);
        } catch (error) {
            console.error("Lỗi lấy lịch sử mượn:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case "borrowed":
                return <Chip label="Đang mượn" color="primary" size="small" />;
            case "returned":
                return <Chip label="Đã trả" color="success" size="small" />;
            case "overdue":
                return <Chip label="Quá hạn" color="error" size="small" />;
            case "reserved":
                return <Chip label="Đặt trước" color="warning" size="small" />;
            default:
                return <Chip label={status || "N/A"} size="small" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), 'dd-MM-yyyy HH:mm');
        } catch (error) {
            return "N/A";
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2, backgroundColor: "#0b485e", color: "white", fontWeight: "bold" }}>
                Tình trạng mượn sách: {readerData?.fullName}
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ backgroundColor: "#f9f9f9", padding: "20px" }}>
                {loading ? (
                    <Typography textAlign="center">Đang tải dữ liệu...</Typography>
                ) : borrowHistory.length > 0 ? (
                    <TableContainer component={Paper} elevation={2}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>Tên sách</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Mã bản sao (Copy ID)</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Ngày mượn</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Hạn trả</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Trạng thái</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {borrowHistory.map((row, index) => {
                                    // 1. Lấy thông tin sách đã được populate
                                    const book = row.documentId || {};
                                    
                                    // 2. Lấy ID của bản sao
                                    const rawCopyId = row.copyId?._id || row.copyId;
                                    const copyIdText = rawCopyId ? rawCopyId.toString().slice(-7).toUpperCase() : "N/A";

                                    // 3. THUẬT TOÁN MỚI: Tìm thông tin chi tiết của bản sao nằm trong mảng locations của cuốn sách
                                    let copyDetails = {};
                                    if (book.locations && Array.isArray(book.locations)) {
                                        copyDetails = book.locations.find(loc => loc._id?.toString() === rawCopyId?.toString()) || {};
                                    } else if (typeof row.copyId === 'object' && row.copyId !== null) {
                                        copyDetails = row.copyId;
                                    }

                                    // 4. Lấy các trường dữ liệu (Ưu tiên móc từ copyDetails ra)
                                    const borrowDate = row.borrowDate || row.createdAt || copyDetails.createdAt;
                                    const dueDate = row.expectedReturnDate || row.dueDate || copyDetails.dueDate;
                                    let currentStatus = row.status || row.action || copyDetails.status;

                                    // 5. Logic tính toán "Quá hạn" (bê y nguyên từ file Kho sách sang)
                                    if (dueDate && Math.floor((Date.now() - new Date(dueDate))) > 0 && currentStatus !== 'returned') {
                                        currentStatus = 'overdue';
                                    }

                                    return (
                                        <TableRow key={row._id || index} hover>
                                            <TableCell>{book.title || row.title || "N/A"}</TableCell>
                                            <TableCell align="center">{copyIdText}</TableCell>
                                            <TableCell align="center">{formatDate(borrowDate)}</TableCell>
                                            <TableCell align="center">{formatDate(dueDate)}</TableCell>
                                            <TableCell align="center">{getStatusChip(currentStatus)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography textAlign="center" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Người đọc này hiện chưa có lịch sử mượn sách.
                    </Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}