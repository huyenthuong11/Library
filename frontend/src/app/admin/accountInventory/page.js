"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { UserCog, UserPlus, User, UserCheck,
    UserX, BookIcon
 } from 'lucide-react';

export default function AccInventory() {
    
    const [accountsInventory, setAccountsInventory] = useState({
        totalReader: 0,
        totalLibrarian: 0,
        totalNewReaders: 0,
        activeReaders: 0,
        overdueReaders: 0,
        averageBorrow: 0
    });

    const getAccountsInventory = async () => {
        try {
            const response = await api.get("/admin/accountsInventory");
            const data = response.data;
            setAccountsInventory(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAccountsInventory();
    }, []);

    return (
        <>
            <div className={styles.statGrid}>
                <div className={`${styles['statItem']} ${styles['purple']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><UserCog size={17} color="#8b5cf6" /></div>
                        <div className={styles.number}>{accountsInventory.totalLibrarian}</div>
                    </div>
                    <p className={styles.label}>Số thủ thư</p>
                </div>
                <div className={`${styles['statItem']} ${styles['blue']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><User size={17} color="#2563EB" /></div>
                        <div className={styles.number}>{accountsInventory.total}</div>
                    </div>
                    <p className={styles.label}>Số người đọc</p>
                </div>
                <div className={`${styles['statItem']} ${styles['green']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><UserPlus size={17} color="#10b981" /></div>
                        <div className={styles.number}>{accountsInventory.totalNewReaders}</div>
                    </div>
                    <p className={styles.label}>Người dùng mới tháng này</p>
                </div>
                <div className={`${styles['statItem']} ${styles['yellow']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><UserCheck size={17} color="#f1c40f" /></div>
                        <div className={styles.number}>{accountsInventory.activeReaders}</div>
                    </div>
                    <p className={styles.label}>Người dùng hoạt động</p>
                </div>
                <div className={`${styles['statItem']} ${styles['red']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><UserX size={17} color="#b91010" /></div>
                        <div className={styles.number}>{accountsInventory.overdueReaders}</div>
                    </div>
                    <p className={styles.label}>Người dùng đang có sách quá hạn</p>
                </div>
                <div className={`${styles['statItem']} ${styles['navy']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}><BookIcon size={17} color="#1064b9" /></div>
                        <div className={styles.number}>{Math.floor(accountsInventory.averageBorrow * 100) / 100}</div>
                    </div>
                    <p className={styles.label}>Trung bình lượt mượn / người đọc</p>
                </div>
            </div>
        </>
    )
}