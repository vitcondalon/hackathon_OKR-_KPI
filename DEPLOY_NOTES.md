# Ghi Chú Triển Khai

## 1. Hợp đồng đăng nhập hiện tại

Endpoint đăng nhập đang dùng là:

```http
POST /api/auth/login
```

Payload:

```json
{
  "identifier": "ADM-001@company",
  "password": "Admin@123"
}
```

Các kiểu định danh được chấp nhận:

- `employee_code`
- `employee_code@company`
- email hệ thống
- username

## 2. Tài khoản demo hiện tại

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

## 3. Checklist kiểm tra cổng database

Trước khi restart backend, hãy kiểm tra hai giá trị này phải khớp nhau:

- root `.env` -> `POSTGRES_PORT`
- `backend/.env` -> cổng nằm trong `DATABASE_URL`

Ví dụ đúng:

```env
POSTGRES_PORT=5433
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/okr_kpi_db
```

## 4. Chẩn đoán nhanh trên VPS

### Kiểm tra PostgreSQL trong Docker

```bash
cd /var/www/okr-kpi
docker compose ps
```

Nếu không có container nào hiện ra, nghĩa là PostgreSQL chưa chạy.

### Kiểm tra env của backend

```bash
grep -n "DATABASE_URL\|HOST\|PORT\|JWT_SECRET" backend/.env
```

### Kiểm tra health của backend

```bash
curl http://127.0.0.1:8000/health
```

### Kiểm tra log backend

```bash
sudo journalctl -u okr-kpi-backend -n 80 --no-pager
```

## 5. Các lỗi production thường gặp nhất

- backend vẫn trỏ `5432` trong khi Docker PostgreSQL đang publish ở `5433`
- container PostgreSQL bị tắt sau khi reboot server
- frontend đã build lại nhưng backend chưa được restart
- tài khoản demo cũ vẫn đang được dùng từ tài liệu cũ
- mọi người tưởng seed sẽ tự chạy lại trên volume database cũ

## 6. Những sự thật runtime cần nhớ

- Docker Compose trong repo này chỉ quản lý PostgreSQL.
- Backend và frontend không chạy bằng Docker Compose trong mô hình deploy hiện tại.
- Frontend build hiện phục vụ chung cho `/login`, `/workspace` và `/okr`.
- Các file trong `docker-entrypoint-initdb.d` chỉ chạy khi volume PostgreSQL được tạo mới.
- `npm run seed` sẽ chủ động nạp lại schema và demo data.

## 7. Bộ lệnh release chuẩn

### Release thông thường

```bash
cd /var/www/okr-kpi
git pull
docker compose up -d postgres
cd backend && npm ci
cd ../frontend && npm ci && npm run build
sudo systemctl restart okr-kpi-backend
sudo systemctl reload nginx
```

### Nếu cần sửa manager link hoặc rating level cho môi trường cũ

```bash
cd /var/www/okr-kpi/backend
npm run backfill:manager-links
npm run backfill:rating-levels
sudo systemctl restart okr-kpi-backend
```

## 8. Thứ tự ưu tiên khi đọc tài liệu

Khi onboarding hoặc xử lý sự cố, nên đọc theo thứ tự sau:

1. [README.md](./README.md)
2. [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
3. [DEPLOYMENT.md](./DEPLOYMENT.md)
4. [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
