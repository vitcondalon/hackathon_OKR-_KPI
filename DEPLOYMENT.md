# Hướng Dẫn Triển Khai

## Kiến trúc triển khai hiện tại

Mô hình triển khai hiện tại của hệ thống gồm:

- PostgreSQL chạy bằng Docker Compose
- backend Node.js chạy dưới dạng service trên `127.0.0.1:8000`
- frontend được build ra thư mục `frontend/dist`
- Nginx phục vụ frontend tĩnh và proxy `/api` sang backend

Frontend sau khi build sẽ phục vụ cùng lúc ba route nghiệp vụ chính:

- `/login`
- `/workspace` cho KPI
- `/okr` cho OKR basic

## Quy tắc triển khai quan trọng

`deploy/update_app.sh` không tự khởi động PostgreSQL cho bạn.

Điều đó có nghĩa là trên VPS phải có sẵn một trong hai trạng thái sau:

- container `postgres` đã chạy sẵn
- hoặc PostgreSQL được quản lý ở nơi khác và `DATABASE_URL` đang trỏ đúng tới instance đó

Nếu `docker compose ps` không thấy container database đang chạy, backend sẽ không đăng nhập được và dữ liệu KPI hoặc OKR sẽ không tải ra giao diện.

## Các file môi trường cần có

### Root `.env` cho container PostgreSQL

```env
POSTGRES_DB=okr_kpi_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5433
TZ=Asia/Ho_Chi_Minh
```

### `backend/.env`

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/okr_kpi_db
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d
```

### `frontend/.env`

```env
VITE_API_BASE_URL=/api
```

## Kiểm tra đồng bộ cổng database

Cổng database trong backend phải khớp với cổng publish ở root `.env`.

Lưu ý để tránh hiểu nhầm:

- PostgreSQL trong container luôn chạy ở cổng nội bộ `5432`
- backend không kết nối vào cổng nội bộ đó
- backend phải kết nối vào cổng publish ra host, hiện chuẩn hóa là `5433`

Ví dụ đúng:

- root `.env` dùng `POSTGRES_PORT=5433`
- `backend/.env` cũng phải trỏ `127.0.0.1:5433`

Lệch cổng này từng gây lỗi production thật trên VPS, nên đây là bước bắt buộc phải kiểm tra.

## Thiết lập VPS lần đầu

1. Clone repo vào `/var/www/okr-kpi`.
2. Tạo các file `.env` cần thiết ở root, `backend`, và `frontend`.
3. Khởi động PostgreSQL:

```bash
cd /var/www/okr-kpi
docker compose up -d postgres
docker compose ps
```

4. Cài dependency backend:

```bash
cd /var/www/okr-kpi/backend
npm ci
```

5. Cài dependency và build frontend:

```bash
cd /var/www/okr-kpi/frontend
npm ci
npm run build
```

6. Cài cấu hình systemd và nginx nếu cần:

```bash
bash /var/www/okr-kpi/deploy/update_app.sh --init
```

## Quy trình release tiêu chuẩn trên VPS

```bash
cd /var/www/okr-kpi
git pull
docker compose up -d postgres
cd backend && npm ci
cd ../frontend && npm ci && npm run build
sudo systemctl restart okr-kpi-backend
sudo systemctl reload nginx
```

## Tự động deploy bằng GitHub Actions

Repo này có thể tự động deploy lên VPS khi push lên `main`.

Luồng hiện tại:

- GitHub Actions SSH vào VPS
- chạy `deploy/update_app.sh`
- script sẽ cập nhật source, cài dependencies, build frontend, restart backend và reload nginx

Secret cần có:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_KNOWN_HOSTS`
- `APP_DIR` nếu muốn ghi đè đường dẫn mặc định

## Tóm tắt routing của Nginx

- phục vụ thư mục `frontend/dist`
- proxy `/api` sang `http://127.0.0.1:8000`
- chỉ public traffic qua `80/443`
- không mở cổng backend trực tiếp ra internet
- phục vụ cùng một frontend build cho `login`, `KPI` và `OKR`

## Thao tác với database

### Reseed dữ liệu demo

```bash
cd /var/www/okr-kpi/backend
npm run seed
```

### Sửa môi trường cũ mà không reset toàn bộ database

```bash
npm run backfill:manager-links
npm run backfill:rating-levels
```

Chỉ reseed khi bạn chấp nhận nạp lại dữ liệu demo. Nếu muốn sửa môi trường cũ mà không làm mới toàn bộ, hãy dùng backfill.


