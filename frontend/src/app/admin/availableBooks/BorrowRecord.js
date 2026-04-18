"use client";
import styles from "./BorrowRecord.module.css";
import { CancelOutlined as CancelOutlinedIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function BorrowRecord({copyId, handleClose}) { 
    const [borrowRecordList, setBorrowRecordList] = useState([]);
    const getBorrowRecordList = async () => {
        try{
            const response = await api.get("/borrowRecord/getBorrowRecordByCopy", {
                params: { copyId }
            });
            const data = response.data;
            setBorrowRecordList(data);
        } catch (err) {
            console.error("Failed to fetch borrow record list: - useBorrowRecordList.js:20", err);
        }
    };

    const actionList = [
        {value: "registered", label: "Đăng ký mượn"},
        {value: "borrowed", label: "Mượn sách"},
        {value: "returned", label: "Trả sách"},
    ];

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };

    useEffect(() => {
        getBorrowRecordList();
    }, []);

    return (
        <>
            <div className={styles.fullScreen}>
                <div className={styles.main}>
                    <div className={styles.header}>
                        Lịch sử mượn trả của sách: {formatShortId(copyId)}
                        <Button
                            className={styles.closeIcon}
                            onClick={() => handleClose()}
                        >
                            <CancelOutlinedIcon></CancelOutlinedIcon>
                        </Button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Độc giả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                borrowRecordList.map((record) => (
                                    <tr key={record._id} className={styles.historyTable}>
                                        <td>
                                            {
                                                record.createdAt
                                                ? format(new Date(record.createdAt), 'dd-MM-yyyy HH:mm')
                                                : ""
                                            }
                                        </td>
                                        <td>
                                            {record.readerId.fullName}
                                        </td>
                                        <td>
                                            {
                                                actionList.filter(a => a.value === record.action )
                                                .map(a => a.label)
                                                
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                 </div>       
            </div>
        </>
    )
}