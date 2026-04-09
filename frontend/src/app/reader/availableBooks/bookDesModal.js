"use client";

import styles from "./bookDesModal.module.css"
import { Button } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { format } from 'date-fns';

export default function BookDesModal({
    image, category, publisher, title, publishDate,
    author, description, language, pages, availableCopies,
    handleClose
}) {
    
    const languageList = [
        {value: "en", label: "Tiếng anh"},
        {value: "vi", label: "Tiếng việt"},
    ];

    const categoryList = [
        { value: ["technology"], label: "Công nghệ" },
        { value: ["science"], label: "Khoa học" },
        { value: ["mathematics"], label: "Toán học" },
        { value: ["history"], label: "Lịch sử" },
        { value: ["geography"], label: "Địa lý" },
        { value: ["politics"], label: "Chính trị" },
        { value: ["philosophy"], label: "Triết học" },
        { value: ["psychology"], label: "Tâm lý học" },
        { value: ["religion"], label: "Tôn giáo / Tâm linh" },
        { value: ["business"], label: "Kinh doanh" },
        { value: ["finance"], label: "Tài chính / Đầu tư" },
        { value: ["marketing"], label: "Marketing / Bán hàng" },
        { value: ["economics"], label: "Kinh tế học" },
        { value: ["education"], label: "Giáo dục / Học tập" },
        { value: ["language"], label: "Ngôn ngữ / Ngoại ngữ" },
        { value: ["exam_prep"], label: "Luyện thi" },
        { value: ["literature"], label: "Văn học" },
        { value: ["novel"], label: "Tiểu thuyết" },
        { value: ["children"], label: "Thiếu nhi" },
        { value: ["comics"], label: "Truyện tranh / Manga" },
        { value: ["self_help"], label: "Phát triển bản thân" },
        { value: ["health"], label: "Sức khỏe / Y học" },
        { value: ["art"], label: "Nghệ thuật / Thiết kế" },
        { value: ["cooking"], label: "Ẩm thực / Nấu ăn" },
        { value: ["travel"], label: "Du lịch / Khám phá" },
        { value: ["biography"], label: "Tiểu sử / Hồi ký" }
    ];
    
    
    console.log("RENDER modal - page.js:30");
    return (
        <>
            <div className={styles.fullScreen}>
                <div className={styles.main}>
                    <div className={styles.header}>
                        Thông tin chi tiết sách
                        <Button
                            className={styles.closeIcon}
                            onClick={() => handleClose()}
                        >
                            <CancelOutlinedIcon></CancelOutlinedIcon>
                        </Button>
                    </div>
                    <div className={styles.board}>
                        <div className={styles.image}>
                            <img src={image}/>
                            <div>Còn : {availableCopies} cuốn</div>
                        </div>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div className={styles.content}>
                                <div style={{fontWeight: "bold", fontSize: "20px"}}>
                                    {title}
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Tác giả:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>{author}</div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Ngày xuất bản:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>
                                        {
                                            publishDate
                                            ? format(new Date(publishDate), 'dd-MM-yyyy')
                                            :""
                                        }
                                    </div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Số trang:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>{pages}</div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Ngôn ngữ:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>
                                        {
                                            languageList.map((l) => {
                                                if (l.value === language) return l.label;
                                            })
                                        }
                                    </div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Nhà xuất bản:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>{publisher}</div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px", whiteSpace: "nowrap"}}>
                                        Mô tả tóm tắt:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>{description}</div>                      
                                </div>
                                <div style={{display: "flex", gap: "10px"}}>
                                    <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                        Thể loại:
                                    </div>      
                                    <div style={{fontWeight: "normal"}}>
                                        {   
                                            categoryList
                                            .filter(c => c.value.some(v => category.includes(v)))
                                            .map(c => c.label)
                                            .join(', ')
                                        }
                                    </div>                     
                                </div>
                            </div>
                            <Button component="span"
                                sx={{
                                    background: '#083d5e',
                                    color: '#f6f8f9',
                                    fontSize: '10px',
                                    textAlign: "center",
                                    height: "20px",
                                    width:"30%",
                                    margin: "auto",
                                    marginTop: "10px",
                                    marginBottom: "10px"
                                }}
                            >
                                Mượn sách
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}