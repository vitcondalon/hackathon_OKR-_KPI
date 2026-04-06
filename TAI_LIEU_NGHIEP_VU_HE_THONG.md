# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG OKR/KPI HR

## Phạm vi tài liệu

Đây là bản nghiệp vụ rút gọn để mô tả cách hệ thống đang vận hành thực tế ở thời điểm hiện tại. Nguồn tài liệu đầy đủ nên ưu tiên đọc là:

- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)

## Mục tiêu hệ thống

Hệ thống dùng để quản lý hồ sơ đánh giá hiệu suất nhân sự theo chu kỳ `tháng`, `quý`, `năm` trên một workspace tập trung.

Trọng tâm nghiệp vụ:

- chọn nhân sự và chu kỳ đánh giá
- tạo hồ sơ đánh giá
- cập nhật tiêu chí và số liệu thực hiện
- ghi nhận nhận xét nhiều cấp
- phê duyệt theo luồng phê duyệt
- khóa hồ sơ sau khi hoàn tất

## Đối tượng sử dụng

- `admin`: quản trị toàn hệ thống
- `hr`: điều phối và phê duyệt ở cấp nhân sự
- `manager`: phê duyệt ở cấp quản lý trực tiếp
- `employee`: cập nhật hồ sơ của chính mình

## Đơn vị dữ liệu chính

- `review_periods`: chu kỳ đánh giá
- `employee_reviews`: hồ sơ đánh giá theo nhân sự và chu kỳ
- `employee_review_items`: từng tiêu chí đánh giá trong hồ sơ
- `review_comments`: nhận xét theo vai trò
- `review_approvals`: lịch sử thao tác phê duyệt
- `employee_projects`: lịch sử dự án của nhân sự

## Nguyên tắc vận hành

### 1. Một màn hình làm việc chính

Frontend hiện dồn quy trình vào `/workspace` để giảm thao tác chuyển trang và giảm lỗi vận hành cho người dùng nội bộ.

### 2. Workflow rõ ràng

Luồng chuẩn:

- `draft`
- `employee_submitted`
- `manager_reviewed`
- `hr_reviewed`
- `approved`
- `locked`

Luồng bổ sung:

- `returned`
- `unlock`

### 3. Khóa dữ liệu theo vai trò và thời gian

- Employee chỉ sửa được hồ sơ của mình
- Employee chỉ sửa được trong thời gian hiệu lực của chu kỳ
- Manager chỉ phê duyệt hồ sơ thuộc phạm vi quản lý
- HR và Admin là hai lớp phê duyệt sau
- Admin là người duy nhất mở khóa hồ sơ đã khóa

### 4. Dữ liệu nghiệp vụ mới dùng dạng chuẩn tiếng Anh

Phần dữ liệu nghiệp vụ mới được giữ ở tiếng Anh để:

- đồng bộ seed và dữ liệu runtime
- giảm mâu thuẫn khi đổi giao diện VI/EN
- dễ chuẩn hóa hơn cho backend và báo cáo

## Kết luận nghiệp vụ

Nếu cần hiểu chi tiết hơn về hướng dẫn sử dụng, phân quyền và điểm mạnh yếu của hệ thống, hãy xem tài liệu tổng hợp chính tại [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md).


