# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG OKR/KPI HR

## Phạm vi tài liệu

Đây là bản nghiệp vụ rút gọn để mô tả cách hệ thống đang vận hành thực tế ở thời điểm hiện tại. Nguồn tài liệu đầy đủ nên ưu tiên đọc là:

- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)

## Mục tiêu hệ thống

Hệ thống hiện phục vụ đồng thời hai nhu cầu nghiệp vụ:

- `KPI` tại `/workspace`: quản lý hồ sơ đánh giá hiệu suất nhân sự theo chu kỳ `tháng`, `quý`, `năm`
- `OKR` tại `/okr`: theo dõi objective, key result và check-in ở mức basic, dễ dùng

Trọng tâm nghiệp vụ hiện tại:

- chọn nhân sự và chu kỳ KPI
- tạo hồ sơ đánh giá
- cập nhật tiêu chí và số liệu thực hiện
- ghi nhận nhận xét nhiều cấp
- phê duyệt theo luồng phê duyệt
- khóa hồ sơ KPI sau khi hoàn tất
- theo dõi mục tiêu OKR và cập nhật check-in tiến độ

## Đối tượng sử dụng

- `admin`: quản trị toàn hệ thống
- `hr`: điều phối và phê duyệt ở cấp nhân sự
- `manager`: phê duyệt ở cấp quản lý trực tiếp và vận hành OKR cơ bản
- `employee`: cập nhật KPI của chính mình và gửi check-in OKR trên dữ liệu thuộc mình

## Đơn vị dữ liệu chính

### Nhóm KPI

- `review_periods`: chu kỳ đánh giá
- `employee_reviews`: hồ sơ đánh giá theo nhân sự và chu kỳ
- `employee_review_items`: từng tiêu chí đánh giá trong hồ sơ
- `review_comments`: nhận xét theo vai trò
- `review_approvals`: lịch sử thao tác phê duyệt
- `employee_projects`: lịch sử dự án của nhân sự

### Nhóm OKR

- `okr_cycles`: chu kỳ OKR
- `objectives`: mục tiêu
- `key_results`: kết quả then chốt
- `key_result_checkins`: lịch sử check-in key result

## Nguyên tắc vận hành

### 1. Hai không gian nghiệp vụ rõ ràng

Frontend hiện tách thành:

- `/workspace` cho KPI và đánh giá hiệu suất
- `/okr` cho OKR basic

Cách tách này giúp người dùng ít bị rối hơn khi thao tác.

### 2. Workflow KPI rõ ràng

Luồng KPI chuẩn:

- `draft`
- `employee_submitted`
- `manager_reviewed`
- `hr_reviewed`
- `approved`
- `locked`

Luồng bổ sung:

- `returned`
- `unlock`

### 3. KPI bị khóa theo vai trò và thời gian

- Employee chỉ sửa được KPI của mình
- Employee chỉ sửa được trong thời gian hiệu lực của chu kỳ
- Manager chỉ phê duyệt KPI thuộc phạm vi quản lý
- HR và Admin là hai lớp phê duyệt sau
- Admin là người duy nhất mở khóa KPI đã khóa

### 4. OKR theo hướng basic, thực dụng

- tập trung vào objective, key result và check-in
- không đi theo workflow nhiều cấp phức tạp như KPI
- ưu tiên thao tác nhanh và dễ hiểu cho nội bộ công ty

### 5. Dữ liệu nghiệp vụ mới dùng dạng chuẩn tiếng Anh

Phần dữ liệu nghiệp vụ mới được giữ ở tiếng Anh để:

- đồng bộ seed và dữ liệu runtime
- giảm mâu thuẫn khi đổi giao diện VI/EN
- dễ chuẩn hóa hơn cho backend và báo cáo

## Kết luận nghiệp vụ

Hệ thống hiện phù hợp với mô hình doanh nghiệp cần:

- một trang KPI đủ chặt để đánh giá hiệu suất theo kỳ
- một trang OKR basic để theo dõi mục tiêu và tiến độ
- ít route nhưng tách đúng nghiệp vụ để người dùng dễ tiếp cận

Nếu cần hiểu chi tiết hơn về hướng dẫn sử dụng, phân quyền và điểm mạnh yếu của hệ thống, hãy xem tài liệu tổng hợp chính tại [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md).
