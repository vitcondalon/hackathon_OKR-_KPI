# Hướng Dẫn Sử Dụng Hệ Thống OKR/KPI HR

## 1. Giới thiệu

Sản phẩm hiện tại có hai không gian nghiệp vụ chính sau khi đăng nhập:

- `KPI` tại `/workspace`
- `OKR` tại `/okr`

Mục tiêu của cách tổ chức này:

- giữ phần đánh giá hiệu suất tách biệt với phần theo dõi mục tiêu
- giúp nhân viên dễ tiếp cận
- giúp quản lý và HR thao tác ít rối hơn
- vẫn đủ tính năng cốt lõi cho vận hành thực tế

Giao diện hỗ trợ nhãn hiển thị bằng tiếng Việt và tiếng Anh. Tuy nhiên, dữ liệu nghiệp vụ mới trong KPI và OKR vẫn nên nhập bằng tiếng Anh để đồng bộ database.

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

Đăng nhập thành công sẽ chuyển đến `/workspace`. Từ đây người dùng có thể chuyển qua `KPI` hoặc `OKR` bằng tab điều hướng ở phía trên giao diện.

## 3. Vai trò sử dụng

### Admin

Admin có thể:

- tạo và quản lý tài khoản người dùng
- reset mật khẩu
- tạo chu kỳ KPI
- tạo chu kỳ OKR
- tạo hồ sơ đánh giá KPI
- phê duyệt, khóa và mở khóa hồ sơ KPI
- theo dõi toàn bộ luồng dữ liệu KPI và OKR

### HR

HR có thể:

- tạo hồ sơ KPI
- thêm nhận xét HR
- thực hiện bước phê duyệt HR
- khóa hồ sơ KPI sau khi hoàn tất
- xem và cập nhật dữ liệu OKR cơ bản

### Manager

Manager có thể:

- mở KPI của nhân sự trong phạm vi phụ trách
- tạo hồ sơ KPI cho phạm vi của mình
- cập nhật ghi chú quản lý
- phê duyệt hoặc trả KPI về bổ sung
- tạo chu kỳ OKR cơ bản
- tạo objective, key result và check-in theo nhu cầu vận hành

### Employee

Employee có thể:

- mở KPI của chính mình
- cập nhật dữ liệu dự án, tiến độ và minh chứng
- thêm nhận xét cá nhân
- gửi hồ sơ KPI để duyệt
- xem objective / key result thuộc mình trên trang OKR
- gửi check-in tiến độ OKR cho dữ liệu thuộc mình

## 4. Bố cục giao diện

### Trang đăng nhập

- giới thiệu hệ thống
- mô tả vai trò chính
- chọn ngôn ngữ `VI/EN`
- form đăng nhập
- gợi ý tài khoản mẫu

### Trang KPI tại `/workspace`

- khu chọn nhân sự và chu kỳ đánh giá
- khu thiết lập chu kỳ đánh giá
- khối thông tin tóm tắt hồ sơ nhân sự
- khối snapshot để nhìn nhanh trạng thái
- bảng tiêu chí đánh giá
- khối nhận xét và thao tác phê duyệt
- lịch sử công tác và lịch sử đánh giá
- khu quản trị tài khoản dành riêng cho admin

### Trang OKR tại `/okr`

- bộ lọc chu kỳ OKR và người phụ trách
- khối tổng quan nhanh
- danh sách objective
- danh sách key result nằm dưới từng objective
- form tạo chu kỳ OKR
- form tạo objective
- form tạo key result
- form gửi check-in tiến độ
- lịch sử check-in

## 5. Luồng thao tác KPI cơ bản

### Tạo chu kỳ đánh giá

1. Chọn loại chu kỳ: tháng, quý hoặc năm.
2. Nhập tên chu kỳ.
3. Chọn ngày bắt đầu.
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

## 6. Luồng thao tác OKR cơ bản

### Tạo chu kỳ OKR

1. Mở tab `OKR`.
2. Chọn hoặc tạo chu kỳ OKR.
3. Nhập tên chu kỳ, ngày bắt đầu, ngày kết thúc và trạng thái.
4. Lưu chu kỳ.

### Tạo objective

1. Chọn chu kỳ OKR.
2. Chọn người phụ trách nếu role cho phép.
3. Nhập tiêu đề objective.
4. Nhập mô tả objective.
5. Chọn loại objective.
6. Chọn ngày đích.
7. Lưu objective.

### Tạo key result

1. Chọn objective đang làm việc.
2. Nhập tiêu đề key result.
3. Nhập mô tả key result.
4. Nhập giá trị bắt đầu, hiện tại và mục tiêu.
5. Chọn đơn vị đo và hướng đo.
6. Lưu key result.

### Gửi check-in

1. Chọn key result.
2. Nhập giá trị sau cập nhật.
3. Chọn ngày check-in.
4. Nhập ghi chú cập nhật.
5. Nếu có, nhập vướng mắc hiện tại.
6. Lưu check-in.

## 7. Quy tắc quan trọng

- Nhân viên chỉ được sửa dữ liệu KPI trong khoảng thời gian hiệu lực của chu kỳ.
- Mục KPI đã khóa sẽ hiện biểu tượng khóa màu đỏ.
- Trước khi submit KPI, các trường bắt buộc phải được điền đầy đủ.
- Tổng hệ số KPI phải lớn hơn `0` và không vượt quá `7`.
- `GET /api/users` chỉ dành cho `admin`.
- Dữ liệu nghiệp vụ mới nên giữ bằng tiếng Anh để đảm bảo nhất quán dữ liệu.
- Trang OKR hiện được thiết kế theo hướng basic, thực dụng, không đi theo workflow phức tạp như KPI.

## 8. Các endpoint tài liệu online

Backend hiện có các endpoint tài liệu:

- `GET /api/guides/user-guide`
- `GET /api/guides/user-guide/view`
- `GET /api/guides/user-guide/download`

## 9. Tài liệu liên quan

- Tài liệu Word chính: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- Tài liệu phân quyền: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- Tài liệu triển khai: [DEPLOYMENT.md](./DEPLOYMENT.md)
