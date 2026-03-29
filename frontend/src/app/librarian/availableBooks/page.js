"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    HistoryOutlined, PermIdentityOutlined, 
    LibraryAddCheckOutlined, HelpOutlineOutlined,
    AddBoxOutlined, EditSquare, ListAltRounded} 
    from '@mui/icons-material';
import useLibrarianInfo from "@/hook/useLibrarianInfo";
import useAvailableBooks from "@/hook/useAvailableBooks";
import { useState } from "react";
import { format } from 'date-fns';
import DeleteIcon from "@mui/icons-material/Delete";
import { ListRounded } from "@mui/icons-material";
export default function AvailableBook() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar} = useLibrarianInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [choosenCategory, setChoosenCategory] = useState("");
    const {availableBooks, totalPages, refreshAvailableBooks} = useAvailableBooks(currentPage, choosenCategory, search);
    const [choosenLocal, setChoosenLocal] = useState({});
    const [openDetailsBar, setOpenDetailsBar] = useState(false);
    const categoryList = [
        {value: [""], label: "Tất cả"},
        {value: ["history"], label: "Lịch sử"},
        {value: ["children"], label: "Trẻ em"},
        {value: ["business"], label: "Kinh doanh"},
        {value: ["science"], label: "Khoa học"},
        {value: ["technology"], label: "Kỹ thuật"},
        {value: ["education"], label: "Giáo dục"},
        {value: ["exam-prep"], label: "Luyện thi"},
        {value: ["comics"], label: "Truyện tranh"},
        {value: ["health"], label: "Sức khỏe"},
        {value: ["travel"], label: "Du lịch"},
        {value: ["cooking"], label: "Ẩm thực"},
        {value: ["self-help"], label: "Tâm lý"},
        {value: ["art"], label: "Nghệ thuật"},
        {value: ["geography"], label: "Địa lý"},
        {value: ["novel"], label: "Tiểu thuyết"},
    ];

    const statusList = [
        {value: "available", label: "Có sẵn"},
        {value: "reserved", label: "Đặt trước"},
        {value: "borrowed", label: "Đang mượn"},
        {value: "overdue", label: "Quá hạn"},
        
    ]
    
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    
    
    return (
        <>
            <div className="container">
                <div className="main">
                    <div className="header">
                        <div className="webicon"></div>
                        <div className="user">
                            {avatar ? (
                                <Avatar
                                    alt="User Avatar"
                                    src={`http://localhost:5000/${avatar}`}
                                    sx={{
                                        objectFit: 'cover',
                                        border: '1px solid rgba(150, 149, 149, 0.65)'
                                    }}
                                />
                            ) : (
                                <Avatar></Avatar>
                            )}
                            {fullName ? (
                                <span>{fullName}</span>
                            ):(
                                <span>{account?.email || "Email"}</span>
                            )}
                            <div className="sign">
                                <a onClick={handleLogout}>Đăng xuất</a>
                            </div>
                        </div>
                    </div>
                    <aside className="sidebar">
                        <div style={{marginTop:10}}>
                            <div className="webicon">
                                <div className="logo"></div>
                                <div className="websiteName">LMS</div>
                            </div>
                        </div>
                        <nav>
                            <p onClick={() => router.push("/librarian/dashboard")}>
                                <HomeOutlined></HomeOutlined>
                                Trang chủ
                            </p>
                            <a>
                                <CollectionsBookmarkOutlined></CollectionsBookmarkOutlined>
                                Kho sách thư viện
                            </a>
                        </nav>
                    </aside>
                    <div className={styles.main}>
                        <div className={styles.mainHeader}>
                            <h2>QUẢN LÝ KHO SÁCH</h2>
                        </div>
                        <div className={styles.actionBar}>
                            <div className={styles.searchContainer}>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm sách (Tên, Tác giả, ISBN...)"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <select
                                className={styles.searchFilter}
                                value={choosenCategory}
                                onChange={(e) => {
                                    setChoosenCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                {categoryList.map((c) => (
                                    <option key={c.value.join(",")} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.subHeader}>
                            <div className={styles.tableFilters}>
                                <ul>
                                    <li className={styles.active}>Tất cả</li>
                                    <li>Có sẵn</li>
                                    <li>Đang mượn</li>
                                    <li>Đặt trước</li>
                                    <li>Quá hạn</li>
                                </ul>
                            </div>
                            <div className={styles.filterActions}>
                                <Button 
                                    sx={{
                                        backgroundColor: "#d2dfd5",
                                        color: "#0b485e",
                                        border: "none",
                                        padding: "10px 15px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        marginRight: "10px"
                                    }}
                                >
                                    <AddBoxOutlined/>
                                </Button>
                            </div>
                        </div>
                        <table className={styles.bookTable}>
                            <thead>
                                <tr>
                                    <th>Mã Sách</th>
                                    <th>Ảnh bìa</th>
                                    <th>Tên Sách</th>
                                    <th>Tác Giả</th>
                                    <th>Thể Loại</th>
                                    <th>Nhà XB</th>
                                    <th>Năm XB</th>
                                    <th>Vị Trí</th>
                                    <th>Trạng Thái</th>
                                    <th>Số Lượng</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    availableBooks ? (
                                        availableBooks.map((availableBook) => (
                                            <tr 
                                                key={availableBook._id}
                                                className={styles.desBar}
                                            >
                                                <td>{availableBook.isbn}</td>
                                                <td>
                                                    <img 
                                                        src={availableBook.image} 
                                                        className={styles.bookCover}
                                                    />
                                                </td>
                                                <td>
                                                    <span className={styles.bookTitle}>{availableBook.title}</span>
                                                </td>
                                                <td><span className={styles.bookAuthor}>{availableBook.author}</span></td>
                                                <td>
                                                    {   
                                                        categoryList
                                                        .filter(c => Array.isArray(c.value) && c.value.some(v => availableBook.category.includes(v)))
                                                        .map(c => c.label)
                                                        .join(', ')
                                                    }
                                                </td>
                                                <td>{availableBook.publisher}</td>
                                                <td>
                                                    {
                                                        availableBook.publishDate
                                                        ? format(new Date(availableBook.publishDate), 'dd-MM-yyyy')
                                                        :""
                                                    }
                                                </td>
                                                <td>
                                                    <select
                                                        className={styles.position}
                                                        value={choosenLocal[availableBook._id] || ""}
                                                        onChange={(e) => {
                                                            setChoosenLocal(prev => ({
                                                                ...prev,
                                                                [availableBook._id]: e.target.value
                                                            }));
                                                        }}
                                                    >
                                                        {   
                                                            availableBook.locations.map((l) => (
                                                                <option key={l._id} value={l.position}>{l.position}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </td>
                                                <td>
                                                    {(() => {
                                                        const selected = choosenLocal[availableBook._id];
                                                        const currentLoc = availableBook.locations.find(
                                                            loc => loc.position === selected
                                                        );

                                                        if (!currentLoc) return statusList[0].label;

                                                        const matchedStatus = statusList.find(
                                                            s => s.value === currentLoc.status
                                                        );

                                                        return matchedStatus ? matchedStatus.label : currentLoc.status;
                                                    })()}
                                                </td>
                                                <td>{availableBook.availableCopies}</td>
                                                <td>
                                                    <Button><EditSquare/></Button>
                                                    <Button><DeleteIcon/></Button>
                                                    <Button

                                                    >
                                                        <ListRounded/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    )) : (
                                        <div>Không có sách nào trong kho</div>
                                    )
                                }
                            </tbody>
                        </table>
                        <div className={styles.pagination}>
                            <Button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Trang trước
                            </Button>
                            <span>Trang {currentPage} / {totalPages}</span>
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Trang sau
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}   