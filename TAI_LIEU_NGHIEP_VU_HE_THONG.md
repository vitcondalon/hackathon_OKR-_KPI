# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG OKR/KPI HR

## 1. Mục tiêu tài liệu

Tài liệu này mô tả nghiệp vụ lõi của hệ thống theo trạng thái triển khai hiện tại, dùng để:

- thống nhất hiểu biết giữa nghiệp vụ và kỹ thuật;
- làm chuẩn đối chiếu khi kiểm thử/demo;
- làm nền cho mở rộng tính năng sau hackathon.

## 2. Phạm vi nghiệp vụ

Hệ thống gồm 2 module chính:

1. `KPI` tại `/workspace`: đánh giá hiệu suất nhân sự theo chu kỳ.
2. `OKR` tại `/okr`: quản lý mục tiêu và tiến độ thực hiện.

Luồng hệ thống trọng tâm:

- đăng nhập -> KPI workspace;
- từ KPI chuyển qua OKR khi cần theo dõi mục tiêu.

## 3. Thực thể dữ liệu nghiệp vụ

## 3.1 Khối dữ liệu KPI

- `review_periods`: chu kỳ đánh giá.
- `employee_reviews`: hồ sơ đánh giá theo nhân sự và kỳ.
- `employee_review_items`: tiêu chí chi tiết trong hồ sơ.
- `review_comments`: nhận xét theo vai trò.
- `review_approvals`: lịch sử hành động duyệt.
- `employee_projects`: lịch sử phân công dự án.

## 3.2 Khối dữ liệu OKR

- `okr_cycles`: chu kỳ OKR.
- `objectives`: mục tiêu.
- `key_results`: kết quả then chốt.
- `key_result_checkins`: lịch sử cập nhật tiến độ KR.

## 4. Quy tắc nghiệp vụ KPI

## 4.1 Quy tắc hồ sơ

- Mỗi cặp `(employee_user_id, period_id)` chỉ có một hồ sơ KPI.
- Hồ sơ gắn với một quản lý phụ trách và một phòng ban.

## 4.2 Quy tắc nhập liệu

- Tổng hệ số KPI phải `> 0` và `<= 7`.
- Trạng thái `locked` chặn sửa dữ liệu nghiệp vụ.
- Employee chỉ sửa hồ sơ của chính mình và trong cửa sổ thời gian chu kỳ.

## 4.3 Quy tắc workflow

Trạng thái chính:

- `draft`
- `employee_submitted`
- `manager_reviewed`
- `hr_reviewed`
- `approved`
- `locked`
- `returned`

Hành động chính:

- `submit`
- `manager_approve`
- `hr_approve`
- `approve`
- `return`
- `lock`
- `unlock` (admin)

## 5. Quy tắc nghiệp vụ OKR

- Chu kỳ OKR do `admin` hoặc `manager` tạo.
- Objective/KR/check-in có thể thao tác bởi nhiều vai trò theo quyền.
- Employee chỉ thao tác dữ liệu thuộc scope của mình.
- Tạo KR/check-in sai scope bị chặn `403`.
- Dữ liệu không hợp lệ bị chặn `400`.

## 6. Quy tắc phân quyền theo phạm vi dữ liệu

- `admin`: toàn quyền dữ liệu và xử lý ngoại lệ cuối.
- `hr`: giám sát và duyệt KPI cấp HR, không mở khóa.
- `manager`: duyệt KPI trong phạm vi quản lý; vận hành OKR cơ bản.
- `employee`: nhập và submit dữ liệu của chính mình.

## 7. Chuẩn dữ liệu và ngôn ngữ

- Dữ liệu nghiệp vụ mới nên nhập tiếng Anh để đồng bộ seed và DB.
- Giao diện hiển thị hỗ trợ VI/EN.
- Tên riêng nhân sự được giữ theo dữ liệu thực tế.

## 8. Dữ liệu mẫu và vận hành demo

Mục tiêu gói dữ liệu demo:

- đủ account cho 4 vai trò;
- đủ chu kỳ để đổi kỳ không bị trống khó hiểu;
- đủ dữ liệu KPI/OKR để demo xuyên suốt luồng.

## 9. Giới hạn hiện tại

- KPI đang hoàn thiện hơn OKR về chiều sâu workflow.
- OKR hiện theo hướng basic, ưu tiên thao tác gọn nhẹ.
- Chưa có bộ test tự động toàn diện cho mọi case nghiệp vụ.

## 10. Kết luận

Hệ thống phù hợp với doanh nghiệp cần:

1. vận hành đánh giá KPI theo kỳ có kiểm soát quyền;
2. theo dõi mục tiêu OKR mức thực dụng;
3. giao diện gọn, dễ đào tạo và dễ trình diễn.

Tài liệu hướng dẫn thao tác chi tiết xem tại:

- [TAI_LIEU_HUONG_DAN_CHI_TIET_HE_THONG_OKR_KPI.md](./TAI_LIEU_HUONG_DAN_CHI_TIET_HE_THONG_OKR_KPI.md)
