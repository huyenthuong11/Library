"use client";
import styles from "./page.module.css";
import { useState,useEffect } from "react";
import api from "@/lib/axios";

export default function TopCategoriesBarChart() {
    const [topCategoriesBarChar, setTopCategoriesBarChart] = useState([]);
    const getTopCategoriesBarChart = async () => {
        try {
            const response = await api.get("chart/topCategory");
            const data = response.data;
            setTopCategoriesBarChart(data);
        } catch (err) {
            console.log("Lấy danh sách thất bại!");
        }
    }
    
    
    const categoryList = {
        technology: "Công nghệ",
        science: "Khoa học",
        mathematics: "Toán học",
        history: "Lịch sử",
        geography: "Địa lý",
        politics: "Chính trị",
        philosophy: "Triết học",
        psychology: "Tâm lý học",
        religion: "Tôn giáo / Tâm linh",
        business: "Kinh doanh",
        finance: "Tài chính / Đầu tư",
        marketing: "Marketing / Bán hàng",
        economics: "Kinh tế học",
        education: "Giáo dục / Học tập",
        language: "Ngôn ngữ / Ngoại ngữ",
        exam_prep: "Luyện thi",
        literature: "Văn học",
        novel: "Tiểu thuyết",
        children: "Thiếu nhi",
        comics: "Truyện tranh / Manga",
        self_help: "Phát triển bản thân",
        health: "Sức khỏe / Y học",
        art: "Nghệ thuật / Thiết kế",
        cooking: "Ẩm thực / Nấu ăn",
        travel: "Du lịch / Khám phá",
        biography: "Tiểu sử / Hồi ký",
        general: "Tổng hợp"
    };

    const CATEGORY_COLORS = {
        technology: "#3b82f6",
        science: "#6366f1",
        mathematics: "#8b5cf6",
        history: "#f59e0b",
        geography: "#22c55e",
        politics: "#ef4444",
        philosophy: "#a855f7",
        psychology: "#ec4899",
        religion: "#f97316",
        business: "#14b8a6",
        finance: "#10b981",
        marketing: "#06b6d4",
        economics: "#0ea5e9",
        education: "#84cc16",
        language: "#65a30d",
        exam_prep: "#facc15",
        literature: "#c084fc",
        novel: "#d946ef",
        children: "#fb7185",
        comics: "#f43f5e",
        self_help: "#e879f9",
        health: "#34d399",
        art: "#a78bfa",
        cooking: "#fb923c",
        travel: "#38bdf8",
        biography: "#475779",
        general: "#64748B"
    };
    

    useEffect(() => {
        getTopCategoriesBarChart();
    }, []);
    console.log(topCategoriesBarChar);
    const maxCount = Math.max(...topCategoriesBarChar.map(cat => cat.borrowedCount));

    return (
        <>
            <div className={styles.barChartContainer}>
                {topCategoriesBarChar.map((item, idx) => {
                    const barWidth = (item.borrowedCount / maxCount) * 100;
                    return (
                        <div key={item._id} className={styles.barItem}>
                            <div className={styles.barLabel}>
                                <span className={styles.rankNum}>#{idx + 1}</span>
                                <span className={styles.catName}>{categoryList[item._id]}</span>
                            </div>
                            <div>
                                <div className={styles.barWrapper}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: `${barWidth}%`,
                                            backgroundColor: CATEGORY_COLORS[item._id] || CATEGORY_COLORS.general
                                        }}
                                    >
                                        <span className={styles.barValue}>{item.borrowedCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    )
                })}
            </div>
        </>
    )
}