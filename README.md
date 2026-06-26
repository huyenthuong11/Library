## Hệ thống quản lý thư viện thông minh (Library Management System)

Hệ thống được phát triển nhằm số hóa và tự động hóa các nghiệp vụ quản lý thư viện truyền thống, giúp thủ thư giảm tải công việc thủ công, đồng thời mang đến cho người đọc một nền tảng tra cứu, mượn sách và đọc ebook tiện lợi mọi lúc, mọi nơi.

## Features

### User Access Control
- Quản lý tài khoản người dùng (Reader, Librarian, Admin)
- Phân quyền truy cập theo vai trò (Role-Based Access Control)
- Bảo mật tài khoản bằng JWT Authentication và bcrypt
  
### Library Management System
- Quản lý đầu sách, bản sao, ebook và nhà xuất bản
- Theo dõi trạng thái sách (available / reserved / borrowed / overdue)
- Upload ảnh bìa bằng Multer

### Borrowing/Returning System
- Mượn / trả sách và lưu lịch sử giao dịch
- Theo dõi hạn trả và trạng thái mượn
- Ghi nhận vi phạm (quá hạn, hư hỏng, mất sách)
- Tính tiền phạt theo số ngày trễ hạn

### Digital Reading
- Đọc ebook trực tuyến ngay trên trình duyệt

### Reservation System
- Cho phép đặt trước sách
- Tự động hủy đặt chỗ khi hết hạn

### Search/Recommendation
- Tìm kiếm sách theo nhiều tiêu chí (tên, tác giả, thể loại,...)
- Bộ lọc thông minh giúp truy xuất nhanh
- Gợi ý sách theo nhu cầu người dùng

### AI Chatbot (Groq API + GPT-OSS-120B)
- Chatbot hiểu ngôn ngữ tự nhiên
- Phân tích cảm xúc người dùng
- Gợi ý sách theo sở thích cá nhân kèm vị trí sách

### Analytics/Dashboard
- Thống kê mượn / trả sách
- Theo dõi vi phạm và xu hướng đọc
- Hỗ trợ quản trị viên ra quyết định

### Automated System (Cron Jobs)
- Tự động reset sách đặt trước khi hết hạn
- Tự động phát hiện sách quá hạn và cập nhật trạng thái
- Tự động tạo/cập nhật biên bản vi phạm
- Tính tiền phạt theo số ngày trễ hạn
- Tự động khóa tài khoản vi phạm quá hạn > 15 ngày

### QR Code Integration
- Tích hợp QR cho người dùng và sách
- Hỗ trợ check-in / check-out nhanh chóng

## Tech Stack

### Backend
- **Node.js + Express**: Xây dựng RESTful API server
- **MongoDB + Mongoose**: Database NoSQL, schema validation
- **Redis**: Cache dữ liệu, lưu OTP, tối ưu hiệu năng
- **JWT + Middleware**: Authentication & Role-based Authorization (Admin / Librarian / Reader)
- **Multer**: Upload file (ảnh bìa, PDF, EPUB)
- **SendGrid**: Gửi email xác thực OTP
- **Groq API + GPT-OSS-120B**: AI chatbot phản hồi real-time
- **bcrypt**: Hash mật khẩu an toàn

### Frontend
- **Next.js**: React framework hỗ trợ SSR & routing
- **Material-UI (MUI)**: UI components hiện đại
- **react-select**: Dropdown search thông minh
- **date-fns**: Xử lý & format ngày giờ
- **Axios**: HTTP client gọi API backend
- **html5-qrcode**: Quét mã QR
- **CSS Modules**: Scoped styling cho từng component

### Tools & DevOps
- **Git**: Version control
- **Draw.io / Mermaid**: Thiết kế diagram (use case, DFD, activity)
  
### Hướng dẫn cài đặt và chạy dự án
### 1. Clone repository
```
git clone <link-repo>
cd <tên-project>
```

### 2. Cài đặt backend dependencies
```npm install express mongoose dotenv cors jsonwebtoken bcryptjs```

### 3. Cài đặt dev dependencies
```npm install nodemon --save-dev```

### 4. Cấu hình scripts (package.json)
```
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### 5. Cài Redis
```
sudo apt install redis -y
sudo service redis-server start
```

### 6. Cài frontend dependencies

```cd frontend

npm install axios react-router-dom
npm install react react-dom```


