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

Hệ thống hiện vận hành theo hai không gian nghiệp vụ rõ ràng sau khi đăng nhập:

- `KPI` tại `/workspace`: đánh giá hiệu suất nhân sự theo chu kỳ
- `OKR` tại `/okr`: theo dõi mục tiêu, key result và check-in ở mức cơ bản, dễ dùng

Route frontend đang dùng:

- `/login`
- `/workspace`
- `/okr`
- `*`

Các nguyên tắc chính hiện tại:

- giao diện hỗ trợ nhãn `VI` và `EN`
- dữ liệu nghiệp vụ mới vẫn lưu theo dạng chuẩn tiếng Anh để tránh lệch dữ liệu giữa các môi trường
- hệ thống phân quyền hiện hành gồm `admin`, `hr`, `manager`, `employee`
- không còn `Trợ lý Funny`
- không còn dark mode trong luồng chính
- Docker Compose trong repo hiện chỉ quản lý PostgreSQL

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
- PostgreSQL bên trong container luôn nghe ở cổng `5432`
- cổng mà backend phải dùng là cổng publish ra host, hiện chuẩn hóa là `5433`

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

Lưu ý quan trọng:

- `DATABASE_URL` trong `backend/.env` phải dùng đúng cổng đang map ở root `.env`
- nếu root `.env` để `POSTGRES_PORT=5433` mà backend vẫn trỏ `5432`, backend sẽ không kết nối được database
- frontend dev hiện proxy `/api` sang `http://127.0.0.1:8000`, nên backend phải chạy ở cổng `8000`

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
- KPI local: `http://localhost:5173/workspace`
- OKR local: `http://localhost:5173/okr`
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
- người dùng có thể chuyển giữa `KPI` và `OKR` bằng tab điều hướng trên giao diện

### KPI tại `/workspace`

- chọn nhân sự theo phạm vi quyền được phép thấy
- chọn chu kỳ đánh giá
- tạo chu kỳ và hồ sơ đánh giá nếu có quyền
- cập nhật tiêu chí, mô tả, dự án, kế hoạch, thực đạt
- thêm nhận xét, gửi duyệt, phê duyệt, khóa, mở khóa theo luồng phê duyệt
- hiển thị biểu đồ snapshot, lịch sử đánh giá và lịch sử dự án

### OKR tại `/okr`

- chọn chu kỳ OKR
- lọc theo người phụ trách
- xem danh sách objective
- xem key result trong từng objective
- tạo chu kỳ OKR mới nếu có quyền
- tạo objective, key result và check-in tiến độ
- xem lịch sử check-in

## Tóm tắt phân quyền

- `admin`: quản trị tài khoản, reset mật khẩu, xem danh sách user toàn hệ thống, mở khóa hồ sơ KPI, tạo chu kỳ KPI và OKR, quản trị dữ liệu chung
- `hr`: theo dõi KPI đa phòng ban, tạo hồ sơ đánh giá, phê duyệt HR và khóa hồ sơ, đồng thời có thể thao tác dữ liệu OKR cơ bản
- `manager`: tạo chu kỳ KPI, tạo hồ sơ KPI trong phạm vi phụ trách, phê duyệt cấp quản lý, và tạo chu kỳ OKR cơ bản
- `employee`: cập nhật KPI của chính mình trong thời gian hiệu lực, đồng thời cập nhật check-in OKR trên dữ liệu thuộc mình

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
- `GET /api/cycles`
- `POST /api/cycles`
- `GET /api/objectives`
- `POST /api/objectives`
- `GET /api/key-results`
- `POST /api/key-results`
- `GET /api/checkins`
- `POST /api/checkins`
- `GET /api/users` và CRUD user: chỉ dành cho `admin`

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

- Docker Compose hiện không build frontend/backend, chỉ quản lý PostgreSQL
- `deploy/update_app.sh` sẽ pull code, cài dependencies, build frontend, restart backend, reload nginx
- script deploy không tự `docker compose up -d postgres`, nên VPS phải có PostgreSQL container đang chạy sẵn hoặc được quản lý riêng

## Thứ tự nên đọc tài liệu

1. [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
2. [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
3. [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
4. [USER_GUIDE.md](./USER_GUIDE.md)
5. [DEPLOYMENT.md](./DEPLOYMENT.md)
6. [DEPLOY_NOTES.md](./DEPLOY_NOTES.md)
