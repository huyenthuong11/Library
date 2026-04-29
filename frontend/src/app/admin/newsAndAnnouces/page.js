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
                const response = await api.get("/admin/getNewsAndAnnounce");
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
        if (item.displayType === 'READER') {
            return "Hệ thống vừa ghi nhận một lượt đăng ký mới thành công."
        } else if (item.displayType  === 'ANNOUNCE') {
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
        }
        return null;
    };

    const typeMapping = {
        NEWS: styles.news,
        READER: styles.reader,
    }

    const tagsMapping = {
        NEWS: "NEWS",
        READER: "NEWS READER"
    }

    return (
        <div className={styles.notiList}>
            {notifications.map((item) => {
                const typeClass = typeMapping[item.displayType] || styles[item.status] || "";

                return (
                    <div key={item._id} className={`${styles.item} ${typeClass}`}>
                        <p className={styles.content}>{renderContent(item)}</p>

                        <div className={styles.footer}>
                            <div className={styles.tagGroup}>
                                <span className={styles.statusTag}>
                                    {tagsMapping[item.displayType] || item.status}
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
                                    href={`/admin/newsDetails/${item._id}`}
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