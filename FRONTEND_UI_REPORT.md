# Báo Cáo Giao Diện Frontend

## Phạm vi hiện tại

Frontend hiện vận hành theo mô hình hai không gian nghiệp vụ rõ ràng:

- `/login`
- `/workspace`
- `/okr`
- `*` cho trang không tìm thấy

Trong đó:

- `/workspace` là trang KPI và đánh giá hiệu suất nhân sự
- `/okr` là trang OKR basic để theo dõi objective, key result và check-in

## Mục tiêu giao diện

- thực dụng cho môi trường nội bộ công ty
- tải nhanh
- chữ rõ, dễ đọc, có dấu đầy đủ
- khoảng trắng hợp lý
- trạng thái hiển thị rõ ràng
- ít chuyển trang nhưng vẫn tách được KPI và OKR để người dùng không bị rối

## Những điểm đã cải thiện

- Tách rõ `KPI` và `OKR` thành hai route riêng nhưng vẫn dùng chung đăng nhập.
- Giữ KPI ở `/workspace` để phục vụ đánh giá hiệu suất theo chu kỳ.
- Bổ sung trang `/okr` theo hướng basic, dễ tiếp cận và đủ dùng cho thực tế.
- Bổ sung nhãn giao diện song ngữ cho `VI` và `EN`.
- Loại bỏ dark mode khỏi luồng đang dùng để giao diện ổn định và dễ đào tạo hơn.
- Loại bỏ `Trợ lý Funny` khỏi bề mặt sản phẩm đang dùng thật.
- Thêm tìm kiếm nhân sự theo mã hoặc tên trước khi chọn hồ sơ KPI.
- Thêm khối snapshot nhẹ để nhìn nhanh điểm số KPI, số mục đang mở, số mục đã khóa và tiến độ từng tiêu chí.
- Thêm tab điều hướng `KPI / OKR` dùng chung ở lớp giao diện.
- Chỉnh lại khoảng cách, cách trình bày form và bảng để dễ nhìn hơn trên màn hình laptop.

## Các module frontend đang dùng

- `src/pages/LoginPage.jsx`
- `src/pages/WorkspacePage.jsx`
- `src/pages/OkrPage.jsx`
- `src/routes/AppRouter.jsx`
- `src/contexts/AuthContext.jsx`
- `src/contexts/LocaleContext.jsx`
- `src/api/workspaceApi.js`
- `src/api/okrApi.js`
- `src/api/usersApi.js`
- `src/api/departmentsApi.js`
- `src/components/layout/AppModeTabs.jsx`
- `src/styles/index.css`

## Luồng tương tác hiện tại

### Trang đăng nhập

- có phần giới thiệu vai trò rõ ràng
- có form đăng nhập trực tiếp
- có nút đổi ngôn ngữ `VI/EN`
- có gợi ý tài khoản mẫu
- nếu không kết nối được backend, giao diện sẽ báo rõ lỗi kết nối API

### Trang KPI tại `/workspace`

- khu chọn nhân sự và chu kỳ đánh giá ở phía trên
- khối thiết lập chu kỳ đánh giá
- khối thông tin tóm tắt nhân sự
- khối biểu đồ snapshot
- bảng tiêu chí đánh giá có thể chỉnh sửa theo quyền
- khối nhận xét và thao tác phê duyệt
- khối lịch sử công tác và lịch sử đánh giá
- khối quản trị tài khoản chỉ dành cho admin

### Trang OKR tại `/okr`

- bộ lọc chu kỳ OKR và người phụ trách
- khối tổng quan số lượng objective, key result và tiến độ trung bình
- danh sách objective theo chu kỳ
- key result hiển thị ngay trong từng objective
- form tạo chu kỳ OKR cho `admin` và `manager`
- form tạo objective
- form tạo key result
- form gửi check-in và khối lịch sử check-in

## Ghi chú về hiệu năng

- Giao diện hiện tại tránh dùng thư viện animation nặng.
- Khối snapshot KPI dùng cách render nhẹ thay vì phụ thuộc chart library lớn.
- Trang OKR dùng layout đơn giản, không kéo thêm chart library riêng.
- Số route ít nhưng phân vai trò rõ hơn, nên vừa nhanh vừa ít gây rối cho người dùng.
- Thiết kế ưu tiên tốc độ thao tác nghiệp vụ hơn là hiệu ứng trình bày.

## Nguyên tắc thiết kế đang áp dụng

- không có nút chuyển dark mode trong luồng active
- không có khu AI hoặc funny assistant trong luồng active
- không dùng hiệu ứng màu mè nặng
- ưu tiên giao diện nghiệp vụ rõ ràng, bảng và form dễ đọc
- ưu tiên tiếng Việt hiển thị có dấu đầy đủ ở các phần nhãn giao diện
- giữ dữ liệu nghiệp vụ mới ở dạng chuẩn tiếng Anh trong database

## Trạng thái xác nhận

- frontend đã được kiểm tra build bằng `npm run build`
- `workspace` là không gian KPI đang phục vụ production
- `/okr` là trang OKR basic mới được thêm vào để kích hoạt lớp OKR đã có ở backend
- giao diện song ngữ áp dụng cho phần nhãn hiển thị, còn dữ liệu nghiệp vụ trong database vẫn giữ dạng chuẩn tiếng Anh
