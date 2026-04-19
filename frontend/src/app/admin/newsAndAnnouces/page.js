"use client";
import styles from "./page.module.css";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from 'next/link';


export default function DashboardNotiCard() {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const getNotifications = async () => {
            try {
                const response = await api.get("/librarian/getNewsAndAnnounce");
                const data = response.data;
                setNotifications(data);
            } catch (error) {
                console.log("Tải thông báo thất bại", error);
            }
        }
        getNotifications();
    }, []);
    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };
    return(
        <div className={styles.notiList}>
            {notifications.map((item, idx) => {
                const typeClass = item.displayType === 'NEWS' ? styles.news : styles[item.status];
                return (
                    <div key={idx} className={`${styles.item} ${typeClass}`}>
                        <p className={styles.content}>
                            {item.displayType === 'NEWS' ? (item.title) : (
                                <>
                                    Sách <strong>{item.title}</strong> mã <strong>{formatShortId(item.copyId)}</strong> {
                                        item.status === "reserved" ? "vừa được đặt trước" 
                                        : "đã quá hạn trả."
                                    }
                                </>
                            )}
                        </p>
                        <div className={styles.footer}>
                            <div className={styles.tagGroup}>
                                <span className={styles.statusTag}>
                                    {item.displayType === 'NEWS' ? 'News' : item.status}
                                </span>
                                <span className={styles.time}>
                                    {new Date(item.compareDate).toLocaleTimeString('vi-VN', {day: "2-digit", month: '2-digit',
                                        hour: '2-digit', minute: '2-digit'})}
                                </span>
                            </div>
                            {item.displayType === 'NEWS' && item._id && (
                                <a href={`/librarian/newsDetails/${item._id}`} className={styles.detailLink}>
                                    Chi tiết 
                                </a>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};