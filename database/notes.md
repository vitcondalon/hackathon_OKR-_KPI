# Ghi Chú Kiến Trúc Database

## 1. Định hướng database hiện tại

Database hiện hỗ trợ đồng thời hai lớp dữ liệu:

- lớp OKR/KPI cũ được giữ lại để tương thích và phục vụ mở rộng về sau
- lớp review tập trung đang phục vụ trực tiếp cho luồng `/workspace`

Điều này có nghĩa là schema hiện tại không còn chỉ là một hệ thống theo dõi OKR truyền thống. Nó đã được mở rộng để phục vụ thêm chu kỳ đánh giá nhân sự, tiêu chí đánh giá, nhận xét, phê duyệt và lịch sử dự án.

## 2. Các nhóm bảng chính

### Nhóm định danh và truy cập

- `roles`
- `users`
- `auth_sessions`

Các vai trò seed hiện tại:

- `admin`
- `hr`
- `manager`
- `employee`

### Nhóm cơ cấu tổ chức

- `departments`
- `projects`
- `employee_projects`

### Nhóm OKR/KPI cũ để tương thích

- `okr_cycles`
- `objectives`
- `key_results`
- `key_result_checkins`
- `kpi_metrics`
- `kpi_checkins`

Các bảng này vẫn còn tồn tại vì backend vẫn đang mở các API hỗ trợ cho OKR/KPI. Tuy nhiên, đây không còn là luồng frontend chính ở thời điểm hiện tại.

### Nhóm schema review đang dùng cho workspace

- `review_periods`
- `employee_reviews`
- `employee_review_items`
- `review_comments`
- `review_approvals`

Đây là nhóm bảng đang phục vụ trực tiếp cho quy trình đánh giá hiệu suất trên workspace.

## 3. Workspace hiện dùng những gì

### `review_periods`

Lưu các khoảng thời gian đánh giá theo tháng, quý hoặc năm.

### `employee_reviews`

Lưu một hồ sơ đánh giá cho mỗi nhân sự theo từng chu kỳ, bao gồm:

- trạng thái hồ sơ
- liên kết quản lý phụ trách
- liên kết phòng ban
- tổng hệ số
- tổng điểm
- `rating_level`

### `employee_review_items`

Lưu các dòng tiêu chí trong hồ sơ đánh giá, bao gồm:

- tên tiêu chí
- mã dự án và tên dự án
- mô tả
- hệ số
- phần trăm kế hoạch
- phần trăm thực đạt
- ghi chú minh chứng
- ghi chú quản lý
- trạng thái khóa

### `review_comments`

Lưu nhận xét do nhân viên, quản lý, HR hoặc người kết luận cuối cùng nhập vào.

### `review_approvals`

Lưu lịch sử luồng phê duyệt như:

- `submit`
- `manager_approve`
- `hr_approve`
- `approve`
- `return`
- `lock`
- `unlock`

## 4. Chiến lược seed hiện tại

Seed hiện tại đã được căn chỉnh theo đúng trạng thái sản phẩm đang dùng.

Seed bao gồm:

- 4 role
- 3 phòng ban
- admin, HR, manager và employee
- dữ liệu mẫu OKR để tương thích backend
- dữ liệu review theo chu kỳ
- lịch sử dự án của nhân sự

Tài khoản demo hiện tại:

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

## 5. Những quy tắc dữ liệu quan trọng

- `manager_user_id` đã được sửa và có script backfill để vá môi trường cũ khi cần
- `rating_level` được lưu theo dạng chuẩn tiếng Anh
- các field ngày được kỳ vọng trả ra từ backend theo định dạng `YYYY-MM-DD`
- dữ liệu nghiệp vụ mới nên giữ bằng tiếng Anh để đảm bảo tính nhất quán giữa các môi trường

## 6. Ghi chú vận hành

### Reseed môi trường mới hoàn toàn

```bash
cd backend
npm run seed
```

### Vá môi trường cũ mà không reset toàn bộ database

```bash
npm run backfill:manager-links
npm run backfill:rating-levels
```

## 7. Các file nguồn chuẩn

- `database/schema.sql`: nguồn chuẩn cho schema
- `database/seed.sql`: dữ liệu mẫu ổn định
- `database/database.sql`: snapshot kết hợp để tra cứu nhanh

Nếu cần hiểu nghiệp vụ tổng thể, hãy xem thêm:

- [README.md](../README.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](../TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](../TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)



