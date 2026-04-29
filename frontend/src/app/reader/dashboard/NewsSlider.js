"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import styles from './NewsSlider.module.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from "next/link";

export default function NewsSlider() {
    const [newsList, setNewsList] = useState([]);
    const defaultBanner = {
        _id: "default",
        title: "KHÁM PHÁ THẾ GIỚI TRI THỨC",
        content: ["Hệ thống quản lý thư viện thông minh"],
        image: 'uploads/1774098503193-banner.png', 
        type: "news"
    };

    const fetchNews = async () => {
        try {
            const response = await api.get('/news/getNews');
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setNewsList(prev => {
                if (JSON.stringify(prev) === JSON.stringify([defaultBanner, ...data])) return prev;
                return [defaultBanner, ...data];
            });
        } catch (error) {
            setNewsList([defaultBanner]);
        }
    };

    console.log(newsList);

    useEffect(() => {
        fetchNews();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith("http") 
        ? path : `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.sliderWrapper}>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                loop={newsList.length > 1}
                className={styles.mySwiper}
            >
                {newsList.map((news) => (
                    <SwiperSlide key={news._id}>
                        <div 
                            className={styles.banner} 
                            style={{ backgroundImage: `url(${getImageUrl(news.image)})` }}
                        >
                            <div className={styles.bannerFill}>
                                {
                                    news.content.length > 1 && (
                                    <div>
                                        <div className={styles.timeTag}>
                                            <i className="bi bi-clock"></i> {formatDate(news.createdAt)}
                                        </div>
                                        <span className={styles.badge}>
                                            {news.type === 'event' ? 'SỰ KIỆN' : 'TIN TỨC'}
                                        </span>
                                    </div>
                                )}
                                <h1 className={styles.headerBanner}>{news.title}</h1>
                                {
                                    news.content.length > 1 ? (
                                        <div>
                                            <p>{news.content[0]?.substring(0, 150)}...</p>
                                            <Link
                                                style={{marginTop: '10px'}}
                                                href= {`/reader/newsDetails/${news._id}`}
                                            >
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    ) : (
                                        <p>{news.content[0]}</p>
                                    )
                                }
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}