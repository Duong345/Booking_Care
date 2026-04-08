# Hướng Dẫn Chạy Project Từ A-Z

Đây là project full-stack bao gồm Backend (Node.js) và Frontend (React.js). Hướng dẫn này sẽ giúp bạn setup và chạy project từ đầu.

---

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy cài đặt những phần mềm sau:

### 1. Node.js và npm
- **Download**: https://nodejs.org/
- **Chọn phiên bản**: LTS (Long Term Support) - phiên bản ổn định nhất
- **Kiểm tra cài đặt**: Mở Command Prompt/PowerShell và chạy:
  ```bash
  node --version
  npm --version
  ```
- Nếu hiển thị version thì cài đặt thành công

### 2. MySQL Server
- **Download**: https://dev.mysql.com/downloads/mysql/
- **Chọn phiên bản**: MySQL Community Server (miễn phí)
- **Cài đặt**: Làm theo hướng dẫn trên trang chủ
- **Kiểm tra**: Mở Command Prompt và chạy:
  ```bash
  mysql --version
  ```

### 3. MySQL Workbench (Tùy chọn nhưng khuyến khích)
- **Download**: https://dev.mysql.com/downloads/workbench/
- **Tác dụng**: Giúp quản lý database dễ dàng hơn

### 4. Git (Tùy chọn)
- **Download**: https://git-scm.com/
- **Tác dụng**: Quản lý version code

### 5. Visual Studio Code (hoặc trình editor khác)
- **Download**: https://code.visualstudio.com/
- **Tác dụng**: Dùng để edit code

---

## 🗄️ Phần 1: Setup Database

### Bước 1: Tạo Database
1. Mở **MySQL Workbench** (hoặc Command Line MySQL)
2. Kết nối với MySQL Server bằng username `root` (mật khẩu để trống nếu không set)
3. Chạy lệnh SQL sau để tạo database:
   ```sql
   CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Kiểm tra: Bạn sẽ thấy database `test` trong danh sách

### Bước 2: Verify Database Connection
- Chạy câu lệnh:
  ```sql
  USE test;
  SHOW TABLES;
  ```
- Nếu không có lỗi, database đã setup thành công

---

## 🔧 Phần 2: Setup Backend (Node.js)

### Bước 1: Mở Terminal tại thư mục `nodejs`
1. Mở **Command Prompt** hoặc **PowerShell**
2. Di chuyển đến thư mục project:
   ```bash
   cd C:\Users\Admin\Downloads\Web2\nodejs
   ```
   (Thay đổi đường dẫn nếu project của bạn ở vị trí khác)

### Bước 2: Cài đặt Dependencies
Chạy lệnh sau để tải về tất cả các thư viện cần thiết:
```bash
npm install
```
- **Thời gian**: Có thể mất 2-5 phút tùy vào tốc độ internet
- **Kết quả**: Sẽ tạo ra thư mục `node_modules/` chứa tất cả dependencies

### Bước 3: Setup Migrations (Tạo bảng trong Database)
Chạy các lệnh migrate để tạo các bảng trong database:
```bash
npx sequelize-cli db:migrate
```
- **Kết quả**: Sẽ tạo các bảng trong database `test`
- Nếu muốn xem lại, hãy kiểm tra trong MySQL Workbench: `SHOW TABLES;`

### Bước 4: Seed Data (Tùy chọn - Thêm dữ liệu mẫu)
Nếu muốn có dữ liệu mẫu để test:
```bash
npx sequelize-cli db:seed:all
```

### Bước 5: Chạy Backend Server
Chạy lệnh sau để khởi động server Node.js:
```bash
npm start
```

**Kết quả khi chạy thành công:**
- Terminal sẽ hiển thị: `Server is running on port 8080`
- Server đang chạy tại: `http://localhost:8080`
- **Giữ nguyên terminal này, không đóng lại**

---

## ⚛️ Phần 3: Setup Frontend (React.js)

### Bước 1: Mở Terminal Mới tại thư mục `reactjs`
1. **Mở Command Prompt hoặc PowerShell mới** (không dùng terminal đang chạy backend)
2. Di chuyển đến thư mục project:
   ```bash
   cd C:\Users\Admin\Downloads\Web2\reactjs
   ```

### Bước 2: Cài đặt Dependencies
Chạy lệnh sau để tải về tất cả các thư viện cần thiết:
```bash
npm install
```
- **Thời gian**: Có thể mất 3-10 phút tùy vào tốc độ internet
- **Kết quả**: Sẽ tạo ra thư mục `node_modules/` chứa tất cả dependencies

### Bước 3: Chạy Frontend Server
Chạy lệnh sau để khởi động React App:
```bash
npm start
```

**Kết quả khi chạy thành công:**
- Trình duyệt sẽ tự động mở
- Ứng dụng sẽ chạy tại: `http://localhost:3000`
- Nếu trình duyệt không tự động mở, hãy truy cập địa chỉ trên theo cách thủ công

---

## 🎉 Kiểm Tra Project Đang Chạy

Khi cả 2 server đang chạy, bạn sẽ thấy:

| Thành phần | URL | Port | Terminal |
|-----------|-----|------|----------|
| Backend API | http://localhost:8080 | 8080 | Terminal 1 (Node.js) |
| Frontend UI | http://localhost:3000 | 3000 | Terminal 2 (React.js) |
| Database | localhost | 3306 | MySQL Service |

---

## 🐛 Troubleshooting (Khắc Phục Sự Cố)

### ❌ Lỗi: Port 8080 hoặc 3000 đã được sử dụng
**Nguyên nhân**: Có chương trình khác đang sử dụng port này
**Giải pháp**: 
- Chạy lại các server hoặc
- Đóng chương trình khác đang dùng port đó hoặc
- Thay đổi port trong `.env` file

### ❌ Lỗi: "Unable to connect to the database"
**Nguyên nhân**: MySQL Server chưa chạy hoặc database chưa được tạo
**Giải pháp**:
1. Kiểm tra MySQL Server đã khởi động chưa
2. Chạy lại lệnh tạo database: `CREATE DATABASE test;`
3. Kiểm tra username/password trong `nodejs/config/connectDB.js`

### ❌ Lỗi: "npm: command not found"
**Nguyên nhân**: Node.js chưa được cài đặt hoặc PATH chưa được cấu hình
**Giải pháp**:
1. Cài đặt lại Node.js từ https://nodejs.org/
2. Khởi động lại Command Prompt
3. Kiểm tra: `node --version`

### ❌ Lỗi: "nodemon: command not found"
**Nguyên nhân**: Module nodemon chưa được cài đặt
**Giải pháp**:
```bash
cd nodejs
npm install nodemon --save-dev
npm start
```

### ❌ Lỗi: "Cannot find module '@babel/core'"
**Nguyên nhân**: Dependencies chưa được cài đặt đầy đủ
**Giải pháp**:
```bash
# Trong thư mục nodejs
rm -r node_modules package-lock.json
npm install
```

---

## 📁 Cấu Trúc Project

```
Web2/
├── nodejs/              # Backend (Node.js + Express)
│   ├── config/          # Cấu hình database
│   ├── migrations/      # Database migrations
│   ├── models/          # Database models (Sequelize)
│   ├── seeders/         # Dữ liệu mẫu
│   └── src/             # Source code chính
│       ├── controllers/ # Xử lý logic
│       ├── services/    # Business logic
│       └── route/       # API routes
│
└── reactjs/             # Frontend (React.js)
    ├── public/          # Static files
    ├── src/             # Source code
    │   ├── containers/  # Page components
    │   ├── components/  # Reusable components
    │   ├── services/    # API calls
    │   ├── redux/       # State management
    │   └── assets/      # Images, icons
    └── server/          # Proxy server (tùy chọn)
```

---

## 🚀 Các Lệnh Hay Dùng

### Backend (Node.js)
```bash
cd nodejs

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Tạo migration mới
npx sequelize-cli migration:generate --name migration-name

# Chạy tất cả migrations
npx sequelize-cli db:migrate

# Undo migration cuối cùng
npx sequelize-cli db:migrate:undo

# Tạo seeder mới
npx sequelize-cli seed:generate --name seeder-name

# Chạy tất cả seeders
npx sequelize-cli db:seed:all
```

### Frontend (React.js)
```bash
cd reactjs

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build cho production
npm run build

# Chạy tests
npm test
```

---

## 💡 Tips & Tricks

1. **Giữ các terminal mở**: Để project chạy bình thường, bạn cần giữ cả 2 terminal (Backend + Frontend) mở cùng một lúc
   
2. **Tự động reload**: Khi bạn sửa code:
   - Backend sẽ tự động reload nhờ nodemon
   - Frontend sẽ tự động reload nhờ React hot reload

3. **Xóa node_modules khi gặp lỗi**: Nếu gặp lỗi lạ, hãy xóa thư mục `node_modules` và cài lại:
   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

4. **Kiểm tra port**: Để xem những port nào đang được sử dụng:
   ```bash
   # Windows (PowerShell)
   Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort
   ```

5. **Sử dụng .env**: Tạo file `.env` trong thư mục `nodejs` để cấu hình:
   ```
   PORT=8080
   NODE_ENV=development
   ```

---

## 📞 Liên Hệ & Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra lại các bước setup
2. Xem phần Troubleshooting ở trên
3. Kiểm tra console/terminal có thông báo lỗi gì không
4. Tìm kiếm lỗi trên Google hoặc Stack Overflow

---

## ✅ Checklist Hoàn Thành Setup

- [ ] Cài đặt Node.js
- [ ] Cài đặt MySQL Server
- [ ] Tạo database `test`
- [ ] Cài đặt dependencies backend: `npm install` trong `nodejs`
- [ ] Chạy migrations: `npx sequelize-cli db:migrate`
- [ ] Chạy backend: `npm start` trong `nodejs`
- [ ] Cài đặt dependencies frontend: `npm install` trong `reactjs`
- [ ] Chạy frontend: `npm start` trong `reactjs`
- [ ] Truy cập http://localhost:3000 và kiểm tra ứng dụng

**Nếu đã hoàn thành tất cả các bước trên, bạn đã setup thành công project!** 🎉

---

## 📝 Ghi Chú

- Database name: `test`
- Backend port: `8080`
- Frontend port: `3000`
- MySQL user: `root`
- MySQL password: (để trống nếu không set)
- Timezone: UTC+7 (Việt Nam)

---

**Chúc bạn code vui vẻ!** 🚀
