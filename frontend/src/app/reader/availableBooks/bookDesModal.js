"use client";

import styles from "./bookDesModal.module.css"
import { Button } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export default function BookDesModal({
    image, category, publisher, title, publishDate,
    author, description, language, pages, availableCopies,
    handleClose
}) {
    
    const languageList = [
        {value: "en", label: "Tiếng anh"},
        {value: "vi", label: "Tiếng việt"},
    ];
    
    console.log("RENDER modal - page.js:30");
    return (
        <>
            <div className={styles.fullScreen}>
                Thông tin chi tiết sách
                <Button
                    className={styles.closeIcon}
                    onClick={() => handleClose()}
                >
                    <CancelOutlinedIcon></CancelOutlinedIcon>
                </Button>
                <div className={styles.board}>
                    <div className={styles.image}>
                        <img src={image}/>
                        <div>Còn : {availableCopies} cuốn</div>
                    </div>
                    <div className={styles.content}>
                        <div style={{fontWeight: "bold", fontSize: "20px"}}>
                            {title}
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Tác giả:
                            </div>      
                            <div>{author}</div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Ngày xuất bản:
                            </div>      
                            <div>{publishDate}</div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Số trang:
                            </div>      
                            <div>{pages}</div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Ngôn ngữ:
                            </div>      
                            <div>
                                {
                                    languageList.map((l) => {
                                        if (l.value === language) return l.label;
                                    })
                                }
                            </div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Nhà xuất bản:
                            </div>      
                            <div>{publisher}</div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Mô tả tóm tắt:
                            </div>      
                            <div>{description}</div>                      
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold", fontSize: "15px"}}>
                                Thể loại:
                            </div>      
                            <div>{category}</div>                     
                        </div>
                    </div>
                </div>
                <Button component="span"
                    sx={{
                        background: '#083d5e',
                        color: '#f6f8f9',
                        fontSize: '13px',
                        textAlign: "center",
                        height: "70%",
                        width:"10%",
                        margin: "auto"
                    }}
                >
                    Mượn sách
                </Button>
            </div>
        </>
    )
}