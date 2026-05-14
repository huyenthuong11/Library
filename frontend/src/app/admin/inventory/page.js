"use client";
import styles from "./page.module.css";




export default function Inventory({data, total}) {

    return (
        <>
            <div className={styles.header}>
                Thống kê kho sách
            </div>
            <div className={styles.statGrid}>
                <div className={`${styles['statItem']} ${styles['blue']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>📘</div>
                        <div className={styles.number}>{total}</div>
                    </div>
                    <p className={styles.label}>Tổng số đầu sách</p>
                </div>
                <div className={`${styles['statItem']} ${styles['purple']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>📚</div>
                        <div className={styles.number}>{data?.totalCopies}</div>
                    </div>
                    <p className={styles.label}>Tổng số sách</p>
                </div>
                <div className={`${styles['statItem']} ${styles['green']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>✅</div>
                        <div className={styles.number}>{data?.available}</div>
                    </div>
                    <p className={styles.label}>Tổng số sách có sẵn</p>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill}
                            style={{ width: `calc((${data?.available} / ${data?.totalCopies}) * 100%)` }}
                        >
                        </div>
                    </div>
                </div>

                <div className={`${styles['statItem']} ${styles['orange']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>👤</div>
                        <div className={styles.number}>{data?.reserved}</div>
                    </div>
                    <p className={styles.label}>Tổng số sách đang giữ trước</p>
                </div>

                <div className={`${styles['statItem']} ${styles['yellow']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>⏳</div>
                        <div className={styles.number}>{data?.borrowed}</div>
                    </div>
                    <p className={styles.label}>Tổng số sách đang được mượn</p>
                </div>

                <div className={`${styles['statItem']} ${styles['red']}`}>
                    <div className={styles.statHeader}>
                        <div className={styles.icon}>⚠️</div>
                        <div className={styles.number}>{data?.overdue}</div>
                    </div>
                    <p className={styles.label}>Tổng số sách quá hạn</p>
                </div>
            </div>
        </>
    )
}