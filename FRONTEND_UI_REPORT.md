# Báo Cáo Giao Diện Frontend

## Phạm vi hiện tại

Frontend đang chạy theo mô hình workspace tập trung.

Các route chính hiện dùng:

- `/login`
- `/workspace`
- `*` cho trang không tìm thấy

Mô hình nhiều trang kiểu dashboard cũ không còn là trải nghiệm chính của người dùng.

## Mục tiêu giao diện

- thực dụng cho môi trường nội bộ công ty
- tải nhanh
- chữ rõ, dễ đọc, có dấu đầy đủ
- khoảng trắng hợp lý
- trạng thái hiển thị rõ ràng
- giảm số lần chuyển trang để nhân viên dễ thao tác

## Những điểm đã cải thiện

- Dồn luồng thao tác chính về một workspace duy nhất thay vì rải ra nhiều trang.
- Bổ sung nhãn giao diện song ngữ cho `VI` và `EN`.
- Loại bỏ dark mode khỏi luồng đang dùng để giao diện ổn định và dễ đào tạo hơn.
- Loại bỏ `Trợ lý Funny` khỏi bề mặt sản phẩm đang dùng thật.
- Thêm tìm kiếm nhân sự theo mã hoặc tên trước khi chọn hồ sơ.
- Thêm khối snapshot nhẹ để nhìn nhanh điểm số, số mục đang mở, số mục đã khóa và tiến độ từng tiêu chí.
- Tăng độ rõ của badge trạng thái và biểu tượng khóa màu đỏ cho các mục bị khóa.
- Chỉnh lại khoảng cách, cách trình bày form và bảng để dễ nhìn hơn trên màn hình laptop.

## Các module frontend đang dùng

- `src/pages/LoginPage.jsx`
- `src/pages/WorkspacePage.jsx`
- `src/routes/AppRouter.jsx`
- `src/contexts/AuthContext.jsx`
- `src/contexts/LocaleContext.jsx`
- `src/api/workspaceApi.js`
- `src/api/usersApi.js`
- `src/api/departmentsApi.js`
- `src/styles/index.css`

## Luồng tương tác hiện tại

### Trang đăng nhập

- có phần giới thiệu vai trò rõ ràng
- có form đăng nhập trực tiếp
- có nút đổi ngôn ngữ `VI/EN`
- có gợi ý tài khoản mẫu

### Trang workspace

- khu chọn nhân sự và chu kỳ đánh giá ở phía trên
- khối thiết lập chu kỳ đánh giá
- khối thông tin tóm tắt nhân sự
- khối biểu đồ snapshot
- bảng tiêu chí đánh giá có thể chỉnh sửa theo quyền
- khối nhận xét và thao tác phê duyệt
- khối lịch sử công tác và lịch sử đánh giá
- khối quản trị tài khoản chỉ dành cho admin

## Ghi chú về hiệu năng

- Giao diện hiện tại tránh dùng thư viện animation nặng.
- Khối snapshot dùng cách render nhẹ thay vì phụ thuộc chart library lớn.
- Số route ít hơn nên giảm chi phí điều hướng và giảm cảm giác rối cho người dùng.
- Thiết kế ưu tiên tốc độ thao tác nghiệp vụ hơn là hiệu ứng trình bày.

## Nguyên tắc thiết kế đang áp dụng

- không có nút chuyển dark mode trong luồng active
- không có khu AI/funny assistant trong luồng active
- không dùng hiệu ứng màu mè nặng
- ưu tiên giao diện nghiệp vụ rõ ràng, bảng và form dễ đọc
- ưu tiên tiếng Việt hiển thị có dấu đầy đủ ở các phần nhãn giao diện

## Trạng thái xác nhận

- frontend đã được kiểm tra build bằng `npm run build`
- `workspace` vẫn là màn hình trung tâm đang phục vụ production
- giao diện song ngữ áp dụng cho phần nhãn hiển thị, còn dữ liệu nghiệp vụ trong database vẫn giữ dạng chuẩn tiếng Anh


