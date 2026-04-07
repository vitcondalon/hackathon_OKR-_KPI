# Tài Liệu Phân Quyền Hệ Thống

Tài liệu này mô tả phân quyền thực tế của hệ thống ở thời điểm hiện tại. Luồng active hiện nay là `login -> KPI tại /workspace` và `OKR tại /okr`.

## Vai trò trong hệ thống

- `admin`: quyền cao nhất, quản trị tài khoản và xử lý ngoại lệ cuối cùng
- `hr`: điều phối ở cấp nhân sự, phê duyệt HR và khóa hồ sơ KPI
- `manager`: quản lý trực tiếp, tạo hồ sơ KPI trong phạm vi phụ trách và vận hành OKR cơ bản
- `employee`: cập nhật KPI của chính mình và gửi check-in OKR trên dữ liệu thuộc mình

## Phạm vi dữ liệu nhìn thấy

### KPI tại `/workspace`

- `admin`: thấy toàn bộ nhân sự đang hoạt động trong workspace, trừ các tài khoản admin khác trong danh sách chọn đánh giá
- `hr`: thấy toàn bộ tập nhân sự phục vụ quy trình đánh giá
- `manager`: thấy chính mình, nhân sự trực tiếp báo cáo, và nhân sự trong phòng ban do mình quản lý
- `employee`: chỉ thấy bản thân

### OKR tại `/okr`

- `admin`: có thể xem toàn bộ dữ liệu OKR
- `hr`: có thể theo dõi và cập nhật dữ liệu OKR cơ bản
- `manager`: có thể vận hành OKR cơ bản trong thực tế sử dụng nội bộ
- `employee`: chỉ nên thao tác trên objective, key result và check-in thuộc mình

## Ma trận quyền chính

| Chức năng | admin | hr | manager | employee |
|---|---|---|---|---|
| Đăng nhập hệ thống | có | có | có | có |
| Vào trang KPI `/workspace` | có | có | có | có |
| Vào trang OKR `/okr` | có | có | có | có |
| Chọn nhân sự khác để xem KPI | có | có | trong phạm vi phụ trách | không |
| Tạo chu kỳ KPI | có | có | có | không |
| Tạo hồ sơ KPI | có | có | có, trong phạm vi phụ trách | không |
| Thêm tiêu chí KPI | có | có | có, trong phạm vi phụ trách | không |
| Sửa tiêu chí, trọng số, ghi chú quản lý KPI | có | có | có, trong phạm vi phụ trách | không |
| Cập nhật mô tả, dự án, kế hoạch, thực đạt của KPI | có | có | có | có, chỉ hồ sơ của mình và đúng thời gian |
| Gửi nhận xét KPI | có | có | có | có |
| `submit` hồ sơ KPI | có | có | có | có, chỉ hồ sơ của mình |
| `manager_approve` KPI | có | có | có, nếu là quản lý được gán | không |
| `hr_approve` KPI | có | có | không | không |
| `approve` cuối cùng của KPI | có | có | không | không |
| `return` hồ sơ KPI để bổ sung | có | có | có, nếu là quản lý được gán | không |
| `lock` hồ sơ KPI | có | có | không | không |
| `unlock` hồ sơ KPI | có | không | không | không |
| Tạo chu kỳ OKR | có | không | có | không |
| Tạo objective OKR | có | có | có | có, trên dữ liệu thuộc mình |
| Tạo key result OKR | có | có | có | có, trên dữ liệu thuộc mình |
| Gửi check-in OKR | có | có | có | có, trên dữ liệu thuộc mình |
| Xem danh sách user toàn hệ thống qua `/api/users` | có | không | không | không |
| Tạo user mới | có | không | không | không |
| Reset mật khẩu user | có | không | không | không |
| Xóa user | có | không | không | không |

## Hạn chế quan trọng theo vai trò

### Admin

- là lớp cuối cùng cho các thao tác đặc biệt
- có thể mở khóa hồ sơ KPI đã khóa
- là role duy nhất quản trị tài khoản toàn hệ thống

### HR

- không có CRUD user toàn hệ thống
- có thể thực hiện `hr_approve`, `approve`, `lock` ở KPI
- không thể `unlock`
- không tạo chu kỳ OKR qua giao diện hiện tại

### Manager

- không đọc được `/api/users`
- không mở khóa hồ sơ KPI
- chỉ `manager_approve` hoặc `return` đối với KPI thuộc phạm vi mình phụ trách
- có thể dùng trang OKR theo hướng basic nhưng không có quyền quản trị user

### Employee

- chỉ được sửa KPI của chính mình
- bị chặn sửa KPI ngoài thời gian hiệu lực của chu kỳ
- không tạo chu kỳ KPI hoặc hồ sơ KPI
- chỉ nên thao tác check-in OKR trên dữ liệu thuộc mình

## Quy tắc backend đang chặn thực tế

- truy cập không đủ quyền trả `403`
- truy cập sai resource trả `404`
- submit KPI thiếu dữ liệu bắt buộc trả `400`
- tổng hệ số KPI lớn hơn `7` bị chặn
- manager phê duyệt KPI sai scope bị chặn
- quyền xem danh sách user toàn hệ thống chỉ dành cho `admin`
