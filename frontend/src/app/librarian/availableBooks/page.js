"use client";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
// ĐÃ SỬA: Bổ sung import Fragment từ react
import { useContext, useEffect, useState, Fragment } from "react"; 
import { Avatar, Button } from "@mui/material";
import { HomeOutlined, CollectionsBookmarkOutlined, 
    AddBoxOutlined, EditSquare, CancelOutlined, ListAltRounded,
    SaveOutlined, AddCircleOutlined, ReceiptLongOutlined, 
    MedicalInformationOutlined} 
    from '@mui/icons-material';
import useLibrarianInfo from "@/hook/useLibrarianInfo";
import useAvailableBooks from "@/hook/useAvailableBooks";
import { format } from 'date-fns';
import DeleteIcon from "@mui/icons-material/Delete";
import { ListRounded } from "@mui/icons-material";
import api from "@/lib/axios";
import EditBook from "./EditBook";
import useReaderList from "@/hook/useGetReaderList";
import Select from "react-select";  
import BorrowRecord from "./BorrowRecord";
import AddBook from "./AddBook";
import useLocationList from "@/hook/useAvailableLocation";
import AddCopy from "./AddCopy";
import CreateViolationModal from "../violationManagement/CreateViolationModal";

export default function AvailableBook() {
    const router = useRouter();
    const {account, logout} = useContext(AuthContext);
    const {fullName, avatar} = useLibrarianInfo(account?.id);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [choosenCategory, setChoosenCategory] = useState("");
    const {availableBooks, totalPages, inventorySummary, total, loading, refreshAvailableBooks} = useAvailableBooks(currentPage, choosenCategory, search);
    const [activeFilter, setActiveFilter] = useState(null);
    const [openDetailsBar, setOpenDetailsBar] = useState(null);
    const [openEditBar, setOpenEditBar] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [openEditCopyBar, setOpenCopyEditBar] = useState(null);
    const {readerList} = useReaderList();
    const [openBorrowRecord, setOpenBorrowRecord] = useState(null);
    const [openAddBookBar, setOpenAddBookBar] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const {locationList} = useLocationList();
    const [openAddCopyModal, setOpenAddCopyModal] = useState(null);
    const [now, setNow] = useState(Date.now());
    
    // STATE QUẢN LÝ MODAL PHẠT 
    const [isViolationOpen, setIsViolationOpen] = useState(false);
    const [violationData, setViolationData] = useState({ readerId: null, documentId: null, copyId: null, coverPrice: 0 });

    const availableLocationList = locationList
        .filter((s) => s.usedStorage < 100)
        .map(s => ({
            value: s.position,
            label: s.position
        }));

    const readerOptions = readerList.map(reader => ({
        value: reader._id,
        label: `${reader._id} - ${reader.fullName}`
    }));

    const [editData, setEditData] = useState({
        position: "",
        status: "",
        readerId: "",
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => {
            if (prev[name] === value) return prev;
            setIsDirty(true)
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const categoryList = [
        { value: [""], label: "Tất cả" },
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
        { value: ["biography"], label: "Tiểu sử / Hồi ký" },
        { value: ["general"], label: "Tổng hợp" }
    ];

    const statusList = [
        {value: null, label: "Tất cả"},
        {value: "available", label: "Có sẵn"},
        {value: "reserved", label: "Đặt trước"},
        {value: "borrowed", label: "Đang mượn"},
        {value: "overdue", label: "Quá hạn"},
    ];

    const handleDeleteBook = async (id) => {
        try {
            const response = await api.delete(`/documents/deleteBook/${id}`)
            if (response.status === 200 || response.status === 201) {
                refreshAvailableBooks();
                alert(response?.data?.message);
            }
        } catch (error) {
            alert(error.response?.data?.message);
            console.error("fail deleted - page.js:159", error);
        }
    }

    const handleDeleteCopy = async (id) => {
        try {
            const response = await api.delete(`/documents/deleteCopy/${id}`);
            if (response.status === 200 || response.status === 201) {
                refreshAvailableBooks();
                alert(response?.data?.message);
            }
        } catch (error) {
            alert(error.response?.data?.message);
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

    const filteredBook = availableBooks.filter((book) => {
        if (!activeFilter) return true;
        return book.locations?.some((loc) => 
            loc.status === activeFilter
        );
    });

    const getImageUrl = (path) => {
        if (path.startsWith("http")) return path;
        return `http://localhost:5000/${path}`;
    }; 

    const handleSubmit = async () => {
        try {           
            await api.patch(`/documents/updateCopy/${openEditCopyBar}`, {
                position: editData.position,
                status: editData.status,
                readerId: editData.readerId,
            });
            alert("Cập nhật sách thành công!");
            refreshAvailableBooks();
            setOpenCopyEditBar(null);
            setIsDirty(false)
        } catch (err) {
            console.error("Failed to updateCopy - page.js:72", err);
            alert(err.response?.data?.message || "Đã có lỗi xảy ra khi chỉnh sửa sách!");
        }
    }

    const statusOptions = {
        available: [
            { value: "borrowed", label: "Đang mượn" },
            { value: "reserved", label: "Đặt trước" },
        ],
        borrowed: [
            { value: "available", label: "Có sẵn" },
            { value: "reserved", label: "Đặt trước" },
        ],
        reserved: [
            { value: "available", label: "Có sẵn" },
            { value: "borrowed", label: "Đang mượn" },
        ],
        overdue: [
            { value: "available", label: "Có sẵn" },
            { value: "reserved", label: "Đặt trước" },
            { value: "borrowed", label: "Đang mượn" },
        ],
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now()); 
        }, 60000); 

        return () => clearInterval(timer); 
    }, []);

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
                                    src={avatar}
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
                            <p onClick={() => router.push("/librarian/readerCheck")}>
                                <MedicalInformationOutlined/>
                                Tìm kiếm thông tin người dùng
                            </p>
                            <p onClick={() => router.push("/librarian/violationManagement")}>
                                <ReceiptLongOutlined></ReceiptLongOutlined>
                                Quản lý vi phạm
                            </p>
                        </nav>
                    </aside>
                    <div className={styles.main}>
                        <div className={styles.header}>
                            <div>
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
                                                setOpenDetailsBar(null);
                                            }}
                                        />
                                    </div>
                                    <select
                                        className={styles.searchFilter}
                                        value={choosenCategory}
                                        onChange={(e) => {
                                            setChoosenCategory(e.target.value);
                                            setCurrentPage(1);
                                            setOpenDetailsBar(null);
                                        }}
                                    >
                                        {categoryList.map((c) => (
                                            <option key={c.value.join(",")} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <Button 
                                        sx={{
                                            backgroundColor: "#d2dfd5",
                                            color: "#0b485e",
                                            border: "none",
                                            padding: "10px 15px",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            marginLeft: "10px"
                                        }}
                                        onClick={() => setOpenAddBookBar(true)}
                                    >
                                        <AddBoxOutlined/>
                                    </Button>
                                </div>
                                <div className={styles.subHeader}>
                                    <div className={styles.tableFilters}>
                                        <ul>
                                            {
                                                statusList.map((status) => (
                                                    <li
                                                        key={status.value}
                                                        className={`${activeFilter === status.value ? styles.active : ""}`}
                                                        onClick={() => setActiveFilter(status.value)}
                                                    >
                                                        {status.label}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.iventoryDashboard}>
                                <div className={styles.iventoryDashboardHeader}>Thống kê kho</div>
                                <div style={{display: "flex", justifyContent: "space-between"}}>
                                    <div style={{display: "flex", flexDirection: "column"}}>
                                        <div>Tổng số đầu sách:</div>
                                        <div>Tổng số sách:</div>
                                        <div>Tổng số sách có sẵn:</div>
                                        <div>Tổng số sách đang giữ trước:</div>
                                        <div>Tổng số sách đang được mượn:</div>
                                        <div>Quá hạn:</div>
                                    </div>
                                    <div style={{display: "flex", flexDirection: "column"}}>
                                        <div>{total}</div>
                                        <div>{inventorySummary.totalCopies}</div>
                                        <div>{inventorySummary.available}</div>
                                        <div>{inventorySummary.reserved}</div>
                                        <div>{inventorySummary.borrowed}</div>
                                        <div>{inventorySummary.overdue}</div>
                                    </div>  
                                </div>
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
                                    <th>Giá bìa</th>
                                    <th>Tổng Copies</th>
                                    <th>Sẵn có</th>
                                    <th>
                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                            Hành Động
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                { (!loading && filteredBook.length > 0) ? (
                                        filteredBook.map((availableBook) => (
                                            /* ĐÃ SỬA LỖI KEY BẰNG CÁCH DÙNG FRAGMENT */
                                            <Fragment key={availableBook._id}>
                                                <tr className={styles.desBar}>
                                                    <td>{availableBook.isbn}</td>
                                                    <td>
                                                        <img 
                                                            src={getImageUrl(availableBook.image)} 
                                                            className={styles.bookCover}
                                                            alt="cover"
                                                        />
                                                    </td>
                                                    <td>
                                                        <span className={styles.bookTitle}>{availableBook.title}</span>
                                                    </td>
                                                    <td style={{width: "150px"}}>
                                                        <span className={styles.bookAuthor}>{availableBook.author}</span>
                                                    </td>
                                                    <td style={{width: "150px"}}>
                                                        {   
                                                            categoryList
                                                            .filter(c => Array.isArray(c.value) && c.value.some(v => availableBook.category.includes(v)))
                                                            .map(c => c.label)
                                                            .join(', ')
                                                        }
                                                    </td>
                                                    <td>{availableBook.publisherId.name}</td>
                                                    <td style={{width: "100px"}}>
                                                        {
                                                            availableBook.publishDate
                                                            ? format(new Date(availableBook.publishDate), 'dd-MM-yyyy')
                                                            :""
                                                        }
                                                    </td>
                                                    <td>{availableBook.coverPrice.toLocaleString()} VND</td>
                                                    <td>{availableBook.numberOfCopy}</td>
                                                    <td>{availableBook.availableCopies}</td>
                                                    <td style={{width: "250px"}}>
                                                        <div style={{ display: "flex", justifyContent: "center" }}>
                                                            
                                                        <Button
                                                            sx={{ color: "#0b485e", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                                            onClick={() => setOpenAddCopyModal(availableBook._id)}
                                                        >
                                                            <AddCircleOutlined/>
                                                        </Button>
                                                        <Button
                                                            sx={{ color: "#0b485e", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                                            onClick={() => {
                                                                setOpenEditBar(availableBook._id);
                                                                setSelectedBook(availableBook);
                                                            }}
                                                        >
                                                            <EditSquare/>
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                if (confirm("Bạn có chắc muốn xoá sách này không?")) {
                                                                    handleDeleteBook(availableBook._id);
                                                                }
                                                            }}
                                                            sx={{ color: "error.main", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                                        >
                                                            <DeleteIcon/>
                                                        </Button>
                                                        <Button
                                                            sx={{ color: "#0b485e", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                                            onClick={() => setOpenDetailsBar(prev => 
                                                                prev === availableBook._id ? null : availableBook._id
                                                            )}
                                                        >
                                                            <ListRounded/>
                                                        </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {openDetailsBar === availableBook._id && (
                                                        <tr>
                                                            <td colSpan="11" style={{ padding: "10px", backgroundColor: "#f0f4f8" }}>
                                                                <table style={{ width: "100%", background: "white", borderRadius: "8px", borderCollapse: "collapse", border: "1px solid #ddd" }}>
                                                                    <thead style={{ backgroundColor: "#e0e7ff" }}>
                                                                        <tr>
                                                                            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ccc" }}>ID</th>
                                                                            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ccc" }}>Vị trí</th>
                                                                            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ccc" }}>Trạng thái</th>
                                                                            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ccc" }}>Thông tin</th>
                                                                            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ccc" }}>Hành động</th>
                                                                            <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #ccc" }}>Lịch sử mượn</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            availableBook.locations
                                                                            .filter((l) => !activeFilter || l.status === activeFilter)
                                                                            .map((l) => {
                                                                                const hasChanges = 
                                                                                    editData.position !== l.position || 
                                                                                    editData.status !== l.status || 
                                                                                    String(editData.readerId || "") !== String(l.readerId?._id || l.readerId || "");
                                                                                return (
                                                                                <tr key={l._id}>
                                                                                    {openEditCopyBar === l._id ? (
                                                                                        // CHẾ ĐỘ EDIT BẢN COPY
                                                                                        <>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>{formatShortId(l._id)}</td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <Select
                                                                                                    options={availableLocationList}
                                                                                                    isSearchable fullwidth size="small" name="position" type="text" id="position"
                                                                                                    className={styles.idInput}
                                                                                                    onChange={(selected) => {
                                                                                                        setEditData(prev => ({...prev, position: selected.value}))
                                                                                                        setIsDirty(true)
                                                                                                    }}
                                                                                                    value={availableLocationList.find(opt => opt.value === editData.position) || null}
                                                                                                /> 
                                                                                            </td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <select
                                                                                                    style={{ width: "100%", padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
                                                                                                    name="status"
                                                                                                    value={editData.status || l.status}
                                                                                                    onChange={handleChange}   
                                                                                                >
                                                                                                    {statusList.filter(s => s.value === l.status && s.value !== null).map(s => (
                                                                                                        <option key={s.value} value={s.value} disabled>{s.label}</option>
                                                                                                    ))}
                                                                                                    {statusOptions[l.status].map((option) => (
                                                                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                            </td>
                                                                                            <td style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                                                                                                {editData.status === "borrowed" || editData.status === "reserved" ? (
                                                                                                    <>
                                                                                                        <Select
                                                                                                            options={readerOptions} isSearchable placeholder="Nhập ID người dùng..." fullwidth size="small" name="readerId" type="text" id="readerId" className={styles.idInput}
                                                                                                            onChange={(selected) => {
                                                                                                                setEditData(prev => ({...prev, readerId: selected.value}))
                                                                                                                setIsDirty(true)
                                                                                                            }}
                                                                                                            value={readerOptions.find(opt => opt.value === editData.readerId)}
                                                                                                            // FIX DROPDOWN BỊ ĐÈ
                                                                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                                                                                        /> 
                                                                                                        {!editData.readerId && ( <span style={{ color: "#d32f2f", fontSize: "12px", fontStyle: "italic" }}>* Cần chọn người mượn</span> )}
                                                                                                    </>
                                                                                                ) : ( <span>Hiện sách đang ở trên kệ</span> )} 
                                                                                            </td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                                                                                                    <Button
                                                                                                        sx={{ color: "white", backgroundColor: "#0b485e", minWidth: "40px", padding: "4px" }}
                                                                                                        onClick={handleSubmit} disabled={!hasChanges}
                                                                                                    >
                                                                                                        <SaveOutlined fontSize="small"/>
                                                                                                    </Button>
                                                                                                    <Button 
                                                                                                        sx={{ color: "white", backgroundColor: "#d32f2f", minWidth: "40px", padding: "4px" }}
                                                                                                        onClick={() => { setOpenCopyEditBar(null); setIsDirty(false); }}
                                                                                                    >
                                                                                                        <CancelOutlined fontSize="small"/>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                                                                    <Button sx={{ color: "#999", minWidth: "40px" }} disabled>
                                                                                                        <ListRounded/>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </>
                                                                                    ) : (
                                                                                        // CHẾ ĐỘ XEM THÔNG TIN BẢN COPY VÀ CÁC NÚT HÀNH ĐỘNG
                                                                                        <>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>{formatShortId(l._id)}</td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>{l.position}</td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                {Math.floor((Date.now() - new Date(l.dueDate))) > 0 && l.dueDate ? (
                                                                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                                                                                        <div className={`${styles['status']} ${styles[`${"overdue"}`]}`}></div>
                                                                                                        Quá hạn
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                                                                                        <div className={`${styles['status']} ${styles[`${l.status}`]}`}></div>
                                                                                                        {(() => {
                                                                                                            const matchedStatus = statusList.find(s => s.value === l.status);
                                                                                                            return matchedStatus ? matchedStatus.label : l.status;
                                                                                                        })()}
                                                                                                    </div>
                                                                                                )}
                                                                                            </td>
                                                                                            {l.readerId ? (
                                                                                                <td style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee" }}>
                                                                                                    <div style={{ marginBottom: "2px" }}><strong>Người mượn:</strong> {l.readerId?.fullName || l.readerName}</div>
                                                                                                    <div style={{ marginBottom: "2px" }}><strong>Vào lúc:</strong> {l.createdAt ? format(new Date(l.createdAt), 'dd-MM-yyyy HH:mm') : ""}</div>
                                                                                                    <div style={{ marginBottom: "2px" }}><strong>Hạn trả:</strong> {l.dueDate ? format(new Date(l.dueDate), 'dd-MM-yyyy HH:mm') : ""}</div>
                                                                                                    {Math.floor((Date.now() - new Date(l.dueDate))) > 0 && (
                                                                                                        <div style={{ color: "#d32f2f", fontWeight: "bold", marginTop: "4px" }}>
                                                                                                            Đã muộn {Math.floor((Date.now() - new Date(l.dueDate)) / (1000 * 60 * 60 * 24))} ngày {Math.floor(((Date.now() - new Date(l.dueDate)) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} giờ {Math.floor(((Date.now() - new Date(l.dueDate)) % (1000 * 60 * 60)) / (1000 * 60))} phút
                                                                                                        </div>
                                                                                                    )}
                                                                                                </td>
                                                                                            ) : (
                                                                                                <td style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #eee", color: "#666" }}>Hiện sách đang ở trên kệ</td>
                                                                                            )}
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                                                                                    
                                                                                                    {/* NÚT PHẠT */}
                                                                                                    {(l.status === 'borrowed' || l.status === 'overdue') && l.readerId && (
                                                                                                        <Button
                                                                                                            variant="outlined"
                                                                                                            size="small"
                                                                                                            color="error"
                                                                                                            sx={{ 
                                                                                                                fontWeight: "bold", 
                                                                                                                fontFamily: "Quicksand", 
                                                                                                                minWidth: "50px",
                                                                                                                padding: "2px 8px"
                                                                                                            }}
                                                                                                            onClick={() => {
                                                                                                                setViolationData({
                                                                                                                    readerId: l.readerId._id || l.readerId,
                                                                                                                    documentId: availableBook._id,
                                                                                                                    copyId: l._id,
                                                                                                                    coverPrice: availableBook.coverPrice // Truyền trực tiếp giá bìa
                                                                                                                });
                                                                                                                setIsViolationOpen(true);
                                                                                                            }}
                                                                                                        >
                                                                                                            PHẠT
                                                                                                        </Button>
                                                                                                    )}
                                                                                                    
                                                                                                    <Button
                                                                                                        sx={{ color: "#0b485e", minWidth: "40px", padding: "4px" }}
                                                                                                        onClick={() => {
                                                                                                            if (isDirty && openEditCopyBar !== l._id) {
                                                                                                                const confirmChange = window.confirm("Bạn chưa lưu thay đổi. Tiếp tục?");
                                                                                                                if (!confirmChange) return;
                                                                                                            }
                                                                                                            setOpenCopyEditBar(l._id);
                                                                                                            setEditData({
                                                                                                                position: l.position || "",
                                                                                                                status: l.status || "",
                                                                                                                readerId: l.readerId?._id || ""
                                                                                                            });
                                                                                                        }}
                                                                                                    >
                                                                                                        <EditSquare/>
                                                                                                    </Button>
                                                                                                    <Button 
                                                                                                        onClick={() => {
                                                                                                            if (confirm("Bạn có chắc muốn xoá bản copy này không?")) {
                                                                                                                handleDeleteCopy(l._id);
                                                                                                            }
                                                                                                        }}
                                                                                                        sx={{color: "error.main", minWidth: "40px", padding: "4px"}}
                                                                                                    >
                                                                                                        <DeleteIcon/>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                                                                <div style={{ display: "flex", justifyContent: "center" }}>
                                                                                                    <Button
                                                                                                        sx={{ color: "#0b485e", minWidth: "40px" }}
                                                                                                        onClick={() => {
                                                                                                            setOpenBorrowRecord(prev => prev === l._id ? null : l._id);
                                                                                                        }}
                                                                                                    >
                                                                                                        <ListRounded/>
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </>
                                                                                    )}
                                                                                </tr>    
                                                                                )   
                                                                            })
                                                                        }
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </Fragment>
                                        )
                                    )) : (
                                        <tr>
                                        <td colSpan="11" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                            Hiện đang không có cuốn sách nào.
                                        </td>
                                    </tr>
                                    ) 
                                }
                                {loading && (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                            Đang tải...
                                        </td>
                                    </tr>
                                )}
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
                
                <div className="footer">
                    <div className={styles.word}>THƯ VIỆN CẦU GIẤY</div>
                    <div className={styles.word}>Address: Cầu Giấy, Hà Nội, Việt Nam</div>
                    <div className={styles.word}>Contact: 0912 xxx xxx</div>
                    <div className={styles.word}>Copyright © Library System</div>
                </div>
                
                {/* CÁC MODAL ĐƯỢC RENDER Ở ĐÂY */}
                {openEditBar && (
                    <EditBook
                        book={selectedBook}
                        handleClose={() => setOpenEditBar(null)}
                        refreshAvailableBooks={refreshAvailableBooks}
                    />
                )}
                {openBorrowRecord && (
                    <BorrowRecord
                        copyId={openBorrowRecord}
                        handleClose={() => setOpenBorrowRecord(null)}
                    />
                )}
                {openAddBookBar && (
                    <AddBook
                        handleClose={() => setOpenAddBookBar(null)}
                        refreshAvailableBooks={refreshAvailableBooks}
                    />
                )}
                {openAddCopyModal && (
                    <AddCopy
                        bookId={openAddCopyModal}
                        handleClose={() => setOpenAddCopyModal(null)}
                        refreshAvailableBooks={refreshAvailableBooks}
                    />
                )}
                
                {/* MODAL LẬP BIÊN BẢN PHẠT */}
                {isViolationOpen && (
                    <CreateViolationModal
                        readerId={violationData.readerId}
                        documentId={violationData.documentId}
                        copyId={violationData.copyId}
                        coverPrice={violationData.coverPrice}
                        handleClose={() => setIsViolationOpen(false)}
                        onSuccess={() => {
                            refreshAvailableBooks(); 
                        }}
                    />
                )}
            </div>
        </>
    )
}