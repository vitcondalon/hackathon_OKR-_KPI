# Ghi Chú Kiến Trúc Database

## 1. Định hướng database hiện tại

Database hiện hỗ trợ đồng thời hai lớp dữ liệu:

- lớp `KPI review` đang phục vụ trực tiếp cho luồng `/workspace`
- lớp `OKR` đang phục vụ trực tiếp cho luồng `/okr`

Điều này có nghĩa là schema hiện tại không còn chỉ là một hệ thống theo dõi OKR truyền thống, cũng không chỉ là một hệ thống review KPI đơn lẻ. Nó đã được mở rộng để phục vụ cả đánh giá hiệu suất theo kỳ lẫn theo dõi mục tiêu theo dạng basic.

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

### Nhóm OKR

- `okr_cycles`
- `objectives`
- `key_results`
- `key_result_checkins`
- `kpi_metrics`
- `kpi_checkins`

Các bảng này hiện không còn chỉ là lớp tương thích ở backend. Chúng đang được dùng trực tiếp bởi trang `/okr` để phục vụ luồng OKR basic.

### Nhóm KPI review tại `/workspace`

- `review_periods`
- `employee_reviews`
- `employee_review_items`
- `review_comments`
- `review_approvals`

Đây là nhóm bảng đang phục vụ trực tiếp cho quy trình đánh giá hiệu suất trên KPI workspace.

## 3. KPI tại `/workspace` hiện dùng những gì

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

## 4. OKR tại `/okr` hiện dùng những gì

### `okr_cycles`

Lưu các chu kỳ OKR dùng cho objective và key result.

### `objectives`

Lưu mục tiêu chính, bao gồm:

- mã objective
- tiêu đề objective
- mô tả objective
- người phụ trách
- phòng ban liên quan nếu có
- loại objective
- trạng thái
- tiến độ
- ngày bắt đầu và ngày đích

### `key_results`

Lưu các kết quả then chốt thuộc objective, bao gồm:

- mã key result
- tiêu đề
- mô tả
- đơn vị đo
- giá trị bắt đầu
- giá trị hiện tại
- giá trị mục tiêu
- hướng đo
- tiến độ
- trạng thái

### `key_result_checkins`

Lưu từng lần cập nhật tiến độ cho key result, bao gồm:

- ngày check-in
- giá trị trước và sau cập nhật
- phần trăm tiến độ
- mức độ tự tin
- update note
- blocker note

## 5. Chiến lược seed hiện tại

Seed hiện tại đã được căn chỉnh theo đúng trạng thái sản phẩm đang dùng.

Seed bao gồm:

- 4 role
- 3 phòng ban
- admin, HR, manager và employee
- dữ liệu mẫu OKR để phục vụ trang `/okr`
- dữ liệu KPI review theo chu kỳ cho trang `/workspace`
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

## 6. Những quy tắc dữ liệu quan trọng

- `manager_user_id` đã được sửa và có script backfill để vá môi trường cũ khi cần
- `rating_level` được lưu theo dạng chuẩn tiếng Anh
- các field ngày được kỳ vọng trả ra từ backend theo định dạng `YYYY-MM-DD`
- dữ liệu nghiệp vụ mới nên giữ bằng tiếng Anh để đảm bảo tính nhất quán giữa các môi trường
- objective, key result và check-in của OKR hiện đang đi theo hướng basic, dễ dùng hơn là quá nhiều lớp ràng buộc phức tạp

## 7. Ghi chú vận hành

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

## 8. Các file nguồn chuẩn

- `database/schema.sql`: nguồn chuẩn cho schema
- `database/seed.sql`: dữ liệu mẫu ổn định
- `database/database.sql`: snapshot kết hợp để tra cứu nhanh

Nếu cần hiểu nghiệp vụ tổng thể, hãy xem thêm:

- [README.md](../README.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](../TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](../TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
