# Hướng Dẫn Sử Dụng Hệ Thống OKR/KPI HR

## 1. Giới thiệu

Sản phẩm hiện tại dùng mô hình làm việc tập trung theo workspace:

- đăng nhập tại `/login`
- thao tác chính trên một màn hình duy nhất là `/workspace`
- đánh giá hiệu suất nhân sự theo tháng, quý hoặc năm
- ghi nhận nhận xét, phê duyệt và lịch sử xử lý ngay trên cùng một luồng

Giao diện hỗ trợ nhãn hiển thị bằng tiếng Việt và tiếng Anh. Tuy nhiên, dữ liệu nghiệp vụ mới trong hồ sơ vẫn nên nhập bằng tiếng Anh để đồng bộ database.

## 2. Đăng nhập

Hệ thống chấp nhận các định danh sau:

- mã nhân viên, ví dụ `EMP-ENG-001`
- tài khoản dạng mã nhân viên, ví dụ `EMP-ENG-001@company`
- email hệ thống được tạo từ mã nhân viên
- username hệ thống

Tài khoản demo:

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

Đăng nhập thành công sẽ chuyển đến `/workspace`.

## 3. Vai trò sử dụng

### Admin

Admin có thể:

- tạo và quản lý tài khoản người dùng
- reset mật khẩu
- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá
- phê duyệt, khóa và mở khóa hồ sơ
- theo dõi toàn bộ luồng phê duyệt

### HR

HR có thể:

- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá
- thêm nhận xét HR
- thực hiện bước phê duyệt HR
- khóa hồ sơ sau khi hoàn tất

### Manager

Manager có thể:

- mở hồ sơ nhân sự trong phạm vi phụ trách
- tạo hồ sơ đánh giá cho phạm vi của mình
- cập nhật ghi chú quản lý
- phê duyệt hoặc trả hồ sơ về bổ sung

### Employee

Employee có thể:

- mở hồ sơ của chính mình
- cập nhật dữ liệu dự án, tiến độ và minh chứng
- thêm nhận xét cá nhân
- gửi hồ sơ để duyệt

## 4. Bố cục workspace

Workspace hiện gồm các khu chính:

- khu chọn nhân sự và chu kỳ đánh giá
- khu thiết lập chu kỳ
- khu thông tin tóm tắt hồ sơ nhân sự
- khu biểu đồ snapshot để nhìn nhanh trạng thái
- bảng tiêu chí đánh giá
- khu nhận xét và thao tác phê duyệt
- lịch sử công tác và lịch sử đánh giá
- khu quản trị tài khoản dành riêng cho admin

## 5. Luồng thao tác cơ bản

### Tạo chu kỳ đánh giá

1. Chọn loại chu kỳ: tháng, quý hoặc năm.
2. Nhập tên chu kỳ.
3. Chọn ngày neo bắt đầu.
4. Hệ thống tự căn chỉnh khoảng ngày hợp lệ.
5. Lưu chu kỳ đánh giá.

### Tạo hồ sơ đánh giá

1. Chọn nhân sự.
2. Chọn chu kỳ.
3. Bấm tạo hồ sơ.
4. Hệ thống sinh sẵn các tiêu chí mặc định.

### Cập nhật chi tiết hồ sơ

Các trường thường dùng:

- tên tiêu chí
- mã dự án hoặc tên dự án
- mô tả
- hệ số
- phần trăm kế hoạch
- phần trăm thực đạt
- ghi chú minh chứng
- ghi chú quản lý

### Gửi duyệt và phê duyệt

Luồng trạng thái chuẩn:

- `draft`
- `employee_submitted`
- `manager_reviewed`
- `hr_reviewed`
- `approved`
- `locked`

Các thao tác đặc biệt:

- `return`
- `unlock` chỉ dành cho admin

## 6. Quy tắc quan trọng

- Nhân viên chỉ được sửa dữ liệu trong khoảng thời gian hiệu lực của chu kỳ.
- Mục đã khóa sẽ hiện biểu tượng khóa màu đỏ.
- Trước khi submit, các trường bắt buộc phải được điền đầy đủ.
- Tổng hệ số phải lớn hơn `0` và không vượt quá `7`.
- Manager không được dùng endpoint danh sách user toàn hệ thống.
- Dữ liệu nghiệp vụ mới nên giữ bằng tiếng Anh để đảm bảo nhất quán dữ liệu.

## 7. Các endpoint tài liệu online

Backend hiện có các endpoint tài liệu:

- `GET /api/guides/user-guide`
- `GET /api/guides/user-guide/view`
- `GET /api/guides/user-guide/download`

## 8. Tài liệu liên quan

- Tài liệu Word chính: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- Tài liệu phân quyền: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- Tài liệu triển khai: [DEPLOYMENT.md](./DEPLOYMENT.md)

