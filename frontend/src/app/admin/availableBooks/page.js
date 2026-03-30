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
import useAvailableBooks from "@/hook/useAvailableBooks";
import { useState } from "react";
import { format } from 'date-fns';
import DeleteIcon from "@mui/icons-material/Delete";
import { ListRounded } from "@mui/icons-material";
import api from "@/lib/axios";
export default function AvailableBook() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState("");
    const [choosenCategory, setChoosenCategory] = useState("");
    const {availableBooks, totalPages, refreshAvailableBooks} = useAvailableBooks(currentPage, choosenCategory, search);
    const [choosenLocal, setChoosenLocal] = useState({});
    const [openDetailsBar, setOpenDetailsBar] = useState(null);
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
        
    ];

    const handleDeleteBook = async (id) => {
        try {
            const response = await api.delete(`/books/deleteBook/${id}`)
            console.log(id);
            if (response.status === 200 || response.status === 201) {
                refreshAvailableBooks();
            }
            
        } catch (error) {
            console.error("fail deleted - page.js:159", error);
        }
    }

    const handleDeleteCopy = async (id) => {
        try {
            const response = await api.delete(`/books/deleteBook/${id}`)
            console.log(id);
            if (response.status === 200 || response.status === 201) {
                refreshAvailableBooks();
            }
            
        } catch (error) {
            console.error("fail deleted - page.js:159", error);
        }
    }
    
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    
    const formatShortId = (id) => {
        if (!id) return "N/A";
        const strId = id.toString();
        return `${strId.slice(-7).toUpperCase()}`;
    };
    
    return (
        <>
            <div className="container">
                <div className="main">
                    <div className="header">
                        <div className="webicon"></div>
                        <div className="user">
                            <Avatar></Avatar>
                            <span>{account?.email || "Email"}</span>
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
                                    <th>Tổng Copies</th>
                                    <th>Sẵn có</th>
                                    <th>
                                        <div style={{
                                            display: "flex", 
                                            justifyContent: "center"
                                        }}>
                                            Hành Động
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    availableBooks ? (
                                        availableBooks.map((availableBook) => (
                                            <>
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
                                                    <td>{availableBook.numberOfCopy}</td>
                                                    <td>{availableBook.availableCopies}</td>
                                                    <td>
                                                        <Button><EditSquare/></Button>
                                                        <Button
                                                            onClick={() => handleDeleteBook(availableBook._id)}
                                                            sx={{color: "error.main"}}
                                                        >
                                                            <DeleteIcon/>
                                                        </Button>
                                                        <Button
                                                            onClick={() => setOpenDetailsBar(prev => 
                                                                prev === availableBook._id ? null : availableBook._id
                                                            )}
                                                        >
                                                            <ListRounded/>
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {
                                                    openDetailsBar === availableBook._id && (
                                                        <tr>
                                                            <td colSpan="10">
                                                                <table className={styles.bookDetailTable}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>ID</th>
                                                                            <th>Vị Trí</th>
                                                                            <th>Trạng Thái</th>
                                                                            <th>Hành động</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            availableBook.locations.map((l) => (
                                                                                <tr>
                                                                                    <td>
                                                                                        {formatShortId(l._id)}
                                                                                    </td>
                                                                                    <td>
                                                                                        {l.position}
                                                                                    </td>
                                                                                    <td>
                                                                                        {(() => {
                                                                                            const matchedStatus = statusList.find(
                                                                                                s => s.value === l.status
                                                                                            );
                                                                                            return matchedStatus ? matchedStatus.label : l.status;
                                                                                        })()}
                                                                                    </td>
                                                                                    { 
                                                                                        l.userId ? (
                                                                                            <td>
                                                                                                <span>Người mượn: {l.userId} - {l.fullName}</span>
                                                                                            </td>
                                                                                        ):(
                                                                                            <td>
                                                                                                <Button>
                                                                                                    <EditSquare/>
                                                                                                </Button>
                                                                                                <Button 
                                                                                                    onClick={() => handleDeleteCopy(l._id)}
                                                                                                    sx={{color: "error.main"}}
                                                                                                >
                                                                                                    <DeleteIcon/>
                                                                                                </Button>
                                                                                            </td>
                                                                                        )
                                                                                    }
                                                                                </tr>        
                                                                            ))
                                                                        }
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </>
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