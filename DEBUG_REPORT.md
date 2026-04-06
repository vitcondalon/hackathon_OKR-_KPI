# Báo Cáo Debug Kỹ Thuật

## Mục đích file này

Đây là file ghi chú lịch sử debug và không còn là nguồn tài liệu nghiệp vụ hay triển khai chính của dự án.

Nếu cần tài liệu hiện hành, hãy ưu tiên:

- [README.md](./README.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [DEPLOY_NOTES.md](./DEPLOY_NOTES.md)

## Những lỗi lớn đã từng xảy ra và đã được xử lý

### 1. Lệch cổng database giữa Docker và backend

Từng xảy ra tình huống:

- root `.env` map PostgreSQL sang `5433`
- `backend/.env` vẫn trỏ `5432`

Hậu quả:

- đăng nhập lỗi
- backend không kết nối được database
- dữ liệu không tải ra workspace

### 2. Liên kết manager trong seed bị sai

Seed cũ từng khiến `manager_user_id` không được gắn đúng cho user. Điều này đã được sửa bằng:

- điều chỉnh `database/seed.sql`
- thêm `npm run backfill:manager-links`

### 3. `rating_level` legacy không đồng nhất

Dữ liệu cũ từng dùng các code kiểu Việt như `tot`, `dat`, `khong_dat`. Hiện tại đã được chuẩn hóa sang dạng chuẩn tiếng Anh và có script:

- `npm run backfill:rating-levels`

### 4. Field ngày trả ra timestamp có timezone

Các field ngày từng bị trả ra dạng timestamp ISO thay vì `YYYY-MM-DD`. Hiện backend đã chuẩn hóa contract ngày cho các luồng chính.

## Cách dùng file này

Hãy xem file này như nhật ký kỹ thuật tham khảo. Không dùng file này làm nguồn hướng dẫn chính cho người dùng hoặc quy trình deploy mới.


