import Image from 'next/image';
import styles from './BorrowModal.module.css';

export default function BorrowModal({ handleClose, data }) {
    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 
    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };
  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        
        <div className={styles.header}>
          <img 
            src={getImageUrl(data.bookInfo.image)} 
            width={50} 
            height={75} 
            className={styles.bookThumb}
            alt="book"
          />
          <div className={styles.titleInfo}>
            <h3>{data.bookInfo.title}</h3>
            <small>Mã bản sao: {formatShortId(data._id)}</small>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.timeline}>
            {data.timeline.map((step, idx) => (
              <div key={idx} className={styles.step}>
                <div className={`${styles.dot} ${styles[step.action]}`} />
                <div className={styles.content}>
                  <span className={styles.actionLabel}>
                    {step.action === 'registered' && 'Đã đặt chỗ online'}
                    {step.action === 'borrowed' && 'Đã nhận sách'}
                    {step.action === 'returned' && 'Đã trả sách'}
                    {step.action === 'canceled' && 'Yêu cầu bị hủy'}
                  </span>
                  <span className={styles.dateLabel}>
                    {new Date(step.date).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}