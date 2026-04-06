# Tài Liệu Phân Quyền Hệ Thống

Tài liệu này mô tả phân quyền thực tế của hệ thống ở thời điểm hiện tại. Luồng đang dùng là `login -> workspace`.

## Vai trò trong hệ thống

- `admin`: quyền cao nhất, quản trị tài khoản và xử lý ngoại lệ cuối cùng
- `hr`: điều phối ở cấp nhân sự, phê duyệt HR và khóa hồ sơ
- `manager`: quản lý trực tiếp, tạo hồ sơ trong phạm vi phụ trách và phê duyệt cấp quản lý
- `employee`: cập nhật hồ sơ của chính mình và gửi duyệt

## Phạm vi dữ liệu nhìn thấy

- `admin`: thấy toàn bộ nhân sự đang hoạt động trong workspace, trừ các tài khoản admin khác trong danh sách chọn đánh giá
- `hr`: thấy toàn bộ tập nhân sự phục vụ quy trình đánh giá
- `manager`: thấy chính mình, nhân sự trực tiếp báo cáo, và nhân sự trong phòng ban do mình quản lý
- `employee`: chỉ thấy bản thân

## Ma trận quyền chính

| Chức năng | admin | hr | manager | employee |
|---|---|---|---|---|
| Đăng nhập hệ thống | có | có | có | có |
| Vào workspace | có | có | có | có |
| Chọn nhân sự khác để xem | có | có | trong phạm vi phụ trách | không |
| Tạo chu kỳ đánh giá | có | có | có | không |
| Tạo hồ sơ đánh giá | có | có | có, trong phạm vi phụ trách | không |
| Thêm tiêu chí đánh giá | có | có | có, trong phạm vi phụ trách | không |
| Sửa tiêu chí, trọng số, ghi chú quản lý | có | có | có, trong phạm vi phụ trách | không |
| Cập nhật mô tả, dự án, kế hoạch, thực đạt của hồ sơ | có | có | có | có, chỉ hồ sơ của mình và đúng thời gian |
| Gửi nhận xét | có | có | có | có |
| `submit` hồ sơ | có | có | có | có, chỉ hồ sơ của mình |
| `manager_approve` | có | có | có, nếu là quản lý được gán | không |
| `hr_approve` | có | có | không | không |
| `approve` cuối cùng | có | có | không | không |
| `return` hồ sơ để bổ sung | có | có | có, nếu là quản lý được gán | không |
| `lock` hồ sơ | có | có | không | không |
| `unlock` hồ sơ | có | không | không | không |
| Xem danh sách user toàn hệ thống qua `/api/users` | có | không | không | không |
| Tạo user mới | có | không | không | không |
| Reset mật khẩu user | có | không | không | không |
| Xóa user | có | không | không | không |

## Hạn chế quan trọng theo vai trò

### Admin

- là lớp cuối cùng cho các thao tác đặc biệt
- có thể mở khóa hồ sơ đã khóa
- là role duy nhất quản trị tài khoản toàn hệ thống

### HR

- không có CRUD user toàn hệ thống
- có thể thực hiện `hr_approve`, `approve`, `lock`
- không thể `unlock`

### Manager

- không đọc được `/api/users`
- không mở khóa hồ sơ
- chỉ `manager_approve` hoặc `return` đối với hồ sơ thuộc phạm vi mình phụ trách

### Employee

- chỉ được sửa hồ sơ của chính mình
- bị chặn sửa ngoài thời gian hiệu lực của chu kỳ
- không tạo chu kỳ, không tạo hồ sơ, không thêm tiêu chí quản trị

## Quy tắc backend đang chặn thực tế

- truy cập không đủ quyền trả `403`
- truy cập sai resource trả `404`
- submit thiếu dữ liệu bắt buộc trả `400`
- tổng hệ số lớn hơn `7` bị chặn
- manager phê duyệt sai scope bị chặn
- quyền xem danh sách user toàn hệ thống chỉ dành cho `admin`


