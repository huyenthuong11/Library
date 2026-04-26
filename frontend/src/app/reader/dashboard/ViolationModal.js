import React from "react";
import { format } from "date-fns";
import { IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export default function ViolationModal({ violations, handleClose }) {
    // Lọc ra những biên bản chưa nộp tiền
    const unpaidViolations = violations.filter(v => v.status === "unpaid");

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "20px 30px",
                borderRadius: "12px",
                width: "550px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
                fontFamily: "Quicksand",
                color: "black",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.5)"
            }}>
                <IconButton onClick={handleClose} style={{ position: "absolute", top: 10, right: 10 }}>
                    <CloseIcon />
                </IconButton>
                
                <h2 style={{ color: "#c62828", borderBottom: "2px solid #ef5350", paddingBottom: "10px", marginTop: 0 }}>
                    Chi tiết vi phạm
                </h2>

                {unpaidViolations.length === 0 ? (
                    <p style={{ textAlign: "center", fontSize: "16px", color: "green" }}>
                        Bạn không có khoản phạt nào cần thanh toán.
                    </p>
                ) : (
                    <div style={{ marginTop: "20px" }}>
                        {unpaidViolations.map((v, index) => (
                            <div key={v._id || index} style={{
                                border: "1px solid #ef5350",
                                borderRadius: "8px",
                                padding: "15px",
                                marginBottom: "15px",
                                backgroundColor: "#ffebee"
                            }}>
                                <div style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "8px" }}>
                                    📖 Sách: {v.documentId?.title || "Không rõ tên sách"}
                                </div>
                                <div style={{ marginBottom: "5px" }}><strong>Lý do:</strong> {v.reason}</div>
                                <div style={{ marginBottom: "5px", color: "#c62828", fontSize: "16px" }}>
                                    <strong>Số tiền phạt:</strong> {v.fineAmount.toLocaleString('vi-VN')} VNĐ
                                </div>
                                <div style={{ fontSize: "14px", color: "#555", marginTop: "10px" }}>
                                    Ngày lập biên bản: {v.createdAt ? format(new Date(v.createdAt), 'dd/MM/yyyy HH:mm') : ""}
                                </div>
                                <div style={{ fontSize: "14px", color: "#555" }}>
                                    Người lập: {v.createdBy?.fullName || "Hệ thống tự động"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center", fontStyle: "italic", color: "#666", fontSize: "14px" }}>
                    * Vui lòng mang thẻ độc giả đến trực tiếp quầy thư viện để thanh toán các khoản phạt này.
                </div>
            </div>
        </div>
    );
}