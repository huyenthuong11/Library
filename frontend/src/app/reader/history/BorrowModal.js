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
    const getEbookStyle = (title) => {
        let hash = 0; 
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }

        const h = Math.abs(hash % 360);
        const s = 30;
        const l = 90;

        return {
            backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
            color: `hsl(${h}, ${s}%, 20%)`,
            borderColor: `hsl(${h}, ${s}%, 80%)`
        }
    };
  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
        
        {data.type === "physical" ? (
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
        ): (
            <div className={styles.header}>
              <div 
                className={styles.bookThumb}
                style={{
                  width: "50px",
                  height: "75px"
                }}
              >
              {(() => {
                const eStyle = getEbookStyle(data.bookInfo.title);
                return (
                    <div
                        className={styles.bookCoverBox}
                        style={{
                            backgroundColor: eStyle.backgroundColor,
                            borderColor: eStyle.borderColor,
                            color: eStyle.color
                        }}
                    >
                        <div className={styles.bookTitleOnCover}>
                            {data.bookInfo.title}
                        </div>
                        <div className={styles.ebookAuthorOnCover}>
                            {data.bookInfo.author}
                        </div>
                    </div>
                );
              })()}
              </div>
              <div className={styles.titleInfo}>
              <h3>{data.bookInfo.title}</h3>
              <small>Mã sách: {formatShortId(data._id)}</small>
            </div>
            </div>
        )}

        <div className={styles.body}>
          <div className={styles.timeline}>
            {data.timeline.map((step, idx) => (
              <div key={idx} className={styles.step}>
                <div className={`${styles.dot} ${styles[step.action]}`} />
                <div className={styles.content}>
                  <span className={styles.actionLabel}>
                    {step.action === 'registered' && 'Đã đặt chỗ online'}
                    {step.action === 'borrowed' && 'Đã mượn sách'}
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