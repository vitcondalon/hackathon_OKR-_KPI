# Hệ Thống Quản Lý OKR / KPI HR

## Tài liệu chính

- Tài liệu Word chính: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- Slide tóm tắt: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_SLIDES.pptx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_SLIDES.pptx)
- Bản Markdown tổng hợp: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- Bản nghiệp vụ rút gọn: [TAI_LIEU_NGHIEP_VU_HE_THONG.md](./TAI_LIEU_NGHIEP_VU_HE_THONG.md)
- Tài liệu phân quyền: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- Hướng dẫn sử dụng: [USER_GUIDE.md](./USER_GUIDE.md)
- Hướng dẫn triển khai: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Ghi chú triển khai: [DEPLOY_NOTES.md](./DEPLOY_NOTES.md)
- Ghi chú kỹ thuật database: [database/notes.md](./database/notes.md)

## Tổng quan hệ thống hiện tại

Hệ thống hiện được tối giản về một luồng làm việc chính:

- route frontend đang dùng: `/login`, `/workspace`, `*`
- `workspace` là màn hình trung tâm để chọn nhân sự, chọn chu kỳ, cập nhật tiêu chí, nhận xét và phê duyệt
- giao diện hỗ trợ hai ngôn ngữ cho phần nhãn hiển thị: `VI` và `EN`
- dữ liệu nghiệp vụ mới được chuẩn hóa lưu ở dạng chuẩn tiếng Anh để tránh lệch dữ liệu giữa các môi trường
- hệ thống phân quyền hiện hành gồm `admin`, `hr`, `manager`, `employee`
- các API cũ như `objectives`, `key-results`, `kpis`, `checkins`, `dashboard` vẫn còn ở backend cho mục đích tương thích và mở rộng, nhưng luồng frontend chính hiện tập trung vào workspace đánh giá nhân sự

Các tính năng đã loại khỏi luồng đang dùng:

- `Trợ lý Funny`
- chuyển giao diện sáng/tối
- sidebar nhiều module kiểu dashboard cũ

## Cấu trúc repo

```text
backend/
  src/
    app.js
    server.js
    config/
    controllers/
    docs/
    middlewares/
    routes/
    services/
    utils/
  scripts/
    seed.js
    backfillManagerLinks.js
    backfillRatingLevels.js
  .env
  .env.example

frontend/
  src/
    App.jsx
    api/
    components/
    contexts/
    pages/
    routes/
    styles/
  .env.example

database/
  schema.sql
  seed.sql
  database.sql
  notes.md

deploy/
  nginx/
  systemd/
  update_app.sh
```

## Nguồn chuẩn cho database

- `database/schema.sql`: schema chính
- `database/seed.sql`: dữ liệu mẫu ổn định
- `database/database.sql`: snapshot schema + seed để tra cứu nhanh

`docker-compose.yml` hiện chỉ chạy PostgreSQL:

- service: `postgres`
- container: `okr_kpi_postgres`
- root `.env` local hiện đang cấu hình cổng `5433`

## Cấu hình môi trường local

Root `.env` hiện tại:

```env
POSTGRES_DB=okr_kpi_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5433
TZ=Asia/Ho_Chi_Minh
```

`backend/.env` local mẫu:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/okr_kpi_db
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Lưu ý rất quan trọng:

- `DATABASE_URL` trong `backend/.env` phải dùng đúng cổng đang map ở root `.env`
- nếu root `.env` để `POSTGRES_PORT=5433` mà backend vẫn trỏ `5432`, backend sẽ không kết nối được database

## Chạy local

### 1. Khởi động PostgreSQL

```bash
docker compose up -d postgres
docker compose ps
```

### 2. Chạy backend

```bash
cd backend
npm install
npm run dev
```

### 3. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Build frontend production

```bash
cd frontend
npm run build
```

## URL và điểm kiểm tra chính

- health check backend: `GET /health`
- Swagger UI: `http://localhost:8000/api/docs`
- OpenAPI JSON: `http://localhost:8000/api/docs/openapi.json`
- frontend local: `http://localhost:5173/login`
- workspace local: `http://localhost:5173/workspace`
- API prefix: `http://localhost:8000/api`

## Tài khoản demo

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

Bạn cũng có thể đăng nhập bằng `employee_code` trực tiếp, ví dụ `EMP-ENG-001`.

## Luồng nghiệp vụ đang dùng

### Đăng nhập

- chấp nhận `email`, `username`, `employee_code`, hoặc `employee_code@company`
- đăng nhập thành công sẽ vào `/workspace`

### Workspace

- chọn nhân sự theo phạm vi quyền được phép thấy
- chọn chu kỳ đánh giá
- tạo chu kỳ và hồ sơ đánh giá nếu có quyền
- cập nhật tiêu chí, mô tả, dự án, kế hoạch, thực đạt
- thêm nhận xét, gửi duyệt, phê duyệt, khóa, mở khóa theo luồng phê duyệt
- hiển thị biểu đồ snapshot, lịch sử đánh giá và lịch sử dự án

## Tóm tắt phân quyền

- `admin`: quản trị tài khoản, reset mật khẩu, xem danh sách user toàn hệ thống, mở khóa hồ sơ, phê duyệt cuối cùng
- `hr`: theo dõi đa phòng ban, tạo chu kỳ, tạo hồ sơ, phê duyệt HR, khóa hồ sơ
- `manager`: tạo chu kỳ, tạo hồ sơ trong phạm vi phụ trách, nhận xét và phê duyệt cấp quản lý
- `employee`: cập nhật hồ sơ của chính mình trong thời gian hiệu lực và gửi duyệt

Xem chi tiết tại [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md).

## API trọng tâm

### API đang phục vụ frontend hiện tại

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/workspace/bootstrap`
- `POST /api/workspace/periods`
- `POST /api/workspace/reviews`
- `POST /api/workspace/reviews/:reviewId/items`
- `PUT /api/workspace/reviews/:reviewId/items/:itemId`
- `POST /api/workspace/reviews/:reviewId/comments`
- `POST /api/workspace/reviews/:reviewId/actions`
- `GET /api/users` và CRUD user: chỉ dành cho `admin`

### API hỗ trợ vẫn còn ở backend

- `departments`
- `cycles`
- `objectives`
- `key-results`
- `checkins`
- `kpis`
- `dashboard`
- `guides`

## Seed và backfill

Reseed dữ liệu local:

```bash
cd backend
npm run seed
```

Sửa liên kết manager cho DB cũ:

```bash
npm run backfill:manager-links
```

Chuẩn hóa `rating_level` sang dạng chuẩn tiếng Anh cho DB cũ:

```bash
npm run backfill:rating-levels
```

## Ghi chú triển khai

- Docker compose hiện không build frontend/backend, chỉ quản lý PostgreSQL
- `deploy/update_app.sh` sẽ pull code, cài dependencies, build frontend, restart backend, reload nginx
- script deploy không tự `docker compose up -d postgres`, nên VPS phải có PostgreSQL container đang chạy sẵn hoặc được quản lý riêng

## Thứ tự nên đọc tài liệu

1. [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
2. [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
3. [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
4. [DEPLOYMENT.md](./DEPLOYMENT.md)
5. [DEPLOY_NOTES.md](./DEPLOY_NOTES.md)


