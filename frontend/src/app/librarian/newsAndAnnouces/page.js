"use client";
import styles from "./page.module.css";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardNotiCard() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const getNotifications = async () => {
            try {
                const response = await api.get("/librarian/getNewsAndAnnounce");
                setNotifications(response.data);
            } catch (error) {
                console.log("Tải thông báo thất bại", error);
            }
        };

        getNotifications();
        const interval = setInterval(getNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return strId.slice(-7).toUpperCase();
    };

    const renderContent = (item) => {
        if (item.displayType === "NEWS") return item.title;

        if (item.status === "reserved") {
            return (
                <>
                    Sách <strong>{item.title}</strong> mã{" "}
                    <strong>{formatShortId(item.copyId)}</strong> vừa được đặt
                    trước.
                </>
            );
        }

        if (item.status === "overdue") {
            return (
                <>
                    Sách <strong>{item.title}</strong> mã{" "}
                    <strong>{formatShortId(item.copyId)}</strong> đã quá hạn
                    trả.
                </>
            );
        }

        if (item.status === "cancelled") {
            return (
                <>
                    Người dùng vừa hủy đặt trước sách{" "}
                    <strong>{item.title}</strong> mã {" "}
                    <strong>{formatShortId(item.copyId)}</strong>
                </>
            );
        }

        return null;
    };

    return (
        <div className={styles.notiList}>
            {notifications.map((item) => {
                const typeClass =
                    item.displayType === "NEWS"
                        ? styles.news
                        : styles[item.status] || "";

                return (
                    <div key={item._id} className={`${styles.item} ${typeClass}`}>
                        <p className={styles.content}>{renderContent(item)}</p>

                        <div className={styles.footer}>
                            <div className={styles.tagGroup}>
                                <span className={styles.statusTag}>
                                    {item.displayType === "NEWS"
                                        ? "News"
                                        : item.status}
                                </span>

                                <span className={styles.time}>
                                    {new Date(item.compareDate).toLocaleString(
                                        "vi-VN",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </span>
                            </div>

                            {item.displayType === "NEWS" && item._id && (
                                <Link
                                    href={`/librarian/newsDetails/${item._id}`}
                                    className={styles.detailLink}
                                >
                                    Chi tiết
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}