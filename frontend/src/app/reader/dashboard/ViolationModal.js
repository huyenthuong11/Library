import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import api from "@/lib/axios";
import { AuthContext } from "../../../context/AuthContext";

export default function ViolationModal({ handleClose, borrowedBooks = [] }) {
    const { account } = useContext(AuthContext);
    const [unpaidViolations, setUnpaidViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyViolations = async () => {
            const userId = account?._id || account?.id || account?.accountId;
            if (!userId) return;
            try {
                const res = await api.get(`/violation/reader/${userId}`);
                setUnpaidViolations(res.data.filter(v => v.status === "unpaid"));
            } catch (error) {
                console.error("Lỗi khi tải chi tiết vi phạm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyViolations();
    }, [account]);

    // Tìm các sách đã quá hạn nhưng CHƯA có trong danh sách phạt (unpaidViolations)
    // Điều này xử lý trường hợp sách trễ hạn ban ngày, nhưng Cronjob lúc 00:00 chưa kịp chạy
    const overdueBooksWithoutFines = borrowedBooks?.filter(book => {
        if (!book.locations?.dueDate) return false;
        const daysLate = Math.floor((Date.now() - new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24));
        
        const isAlreadyFined = unpaidViolations.some(v => v.copyId === book.locations._id);
        
        return daysLate > 0 && !isAlreadyFined && (book.locations.status === "borrowed" || book.locations.status === "overdue");
    }) || [];

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div style={{
                backgroundColor: "white", padding: "20px 30px", borderRadius: "12px",
                width: "550px", maxHeight: "80vh", overflowY: "auto", position: "relative",
                fontFamily: "Quicksand", color: "black", boxShadow: "0px 10px 30px rgba(0,0,0,0.5)"
            }}>
                <IconButton onClick={handleClose} style={{ position: "absolute", top: 10, right: 10 }}>
                    <CloseIcon />
                </IconButton>
                
                <h2 style={{ color: "#c62828", borderBottom: "2px solid #ef5350", paddingBottom: "10px", marginTop: 0 }}>
                    Chi tiết vi phạm & trễ hạn
                </h2>

                {loading ? (
                    <p style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>Đang tải dữ liệu...</p>
                ) : (unpaidViolations.length === 0 && overdueBooksWithoutFines.length === 0) ? (
                    <p style={{ textAlign: "center", fontSize: "16px", color: "green", fontWeight: "bold", marginTop: "20px" }}>
                        Bạn đang không có sách trễ hạn hay khoản phạt nào.
                    </p>
                ) : (
                    <div style={{ marginTop: "20px" }}>
                        
                        {/* 1. HIỂN THỊ CÁC PHIẾU PHẠT ĐÃ CÓ TRONG DATABASE */}
                        {unpaidViolations.map((v, index) => (
                            <div key={`fine-${v._id || index}`} style={{
                                border: "1px solid #ef5350", borderRadius: "8px", padding: "15px",
                                marginBottom: "15px", backgroundColor: "#ffebee"
                            }}>
                                <div style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "8px" }}>
                                    Sách: {v.documentId?.title || "Không rõ tên sách"}
                                </div>
                                <div style={{ marginBottom: "5px" }}><strong>Lý do:</strong> {v.reason}</div>
                                <div style={{ marginBottom: "5px", color: "#c62828", fontSize: "16px" }}>
                                    <strong>Số tiền phạt:</strong> {v.fineAmount?.toLocaleString('vi-VN')} VNĐ
                                </div>
                                <div style={{ fontSize: "14px", color: "#555", marginTop: "10px" }}>
                                    Ngày lập biên bản: {v.createdAt ? format(new Date(v.createdAt), 'dd/MM/yyyy HH:mm') : ""}
                                </div>
                                <div style={{ fontSize: "14px", color: "#555" }}>
                                    Trạng thái: <span style={{color: "#c62828", fontWeight: "bold"}}>Chưa nộp phạt</span>
                                </div>
                            </div>
                        ))}

                        {/* 2. HIỂN THỊ CÁC SÁCH TRỄ HẠN NHƯNG CHƯA CÓ PHIẾU PHẠT */}
                        {overdueBooksWithoutFines.map((book, index) => {
                            const daysLate = Math.floor((Date.now() - new Date(book.locations.dueDate)) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={`overdue-${index}`} style={{
                                    border: "1px solid #ffb74d", borderRadius: "8px", padding: "15px",
                                    marginBottom: "15px", backgroundColor: "#fff8e1"
                                }}>
                                    <div style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "8px", color: "#e65100" }}>
                                        Sách: {book.title}
                                    </div>
                                    <div style={{ marginBottom: "5px" }}>
                                        <strong>Hạn trả:</strong> {format(new Date(book.locations.dueDate), 'dd/MM/yyyy')}
                                    </div>
                                    <div style={{ marginBottom: "5px", color: "#e65100", fontSize: "15px", fontWeight: "bold" }}>
                                        Đã quá hạn {daysLate} ngày
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#888", marginTop: "10px", fontStyle: "italic" }}>
                                        *Hệ thống đang chờ xử lý lập biên bản phạt. Vui lòng trả sách sớm!
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center", fontStyle: "italic", color: "#666", fontSize: "14px" }}>
                    * Vui lòng mang sách và thẻ độc giả đến trực tiếp quầy thư viện để thanh toán khoản phạt.
                </div>
            </div>
        </div>
    );
}