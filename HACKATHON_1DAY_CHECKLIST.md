# TÀI LIỆU HƯỚNG DẪN CHI TIẾT HỆ THỐNG OKR/KPI HR

## 1. Thông tin tài liệu

- Tên tài liệu: Hướng dẫn vận hành và demo hệ thống OKR/KPI HR.
- Phiên bản: `v1.0`.
- Ngày cập nhật: `08/04/2026`.
- Phạm vi áp dụng: bản dự án hiện tại dùng cho môi trường local/demo và triển khai VPS.

## 2. Mục tiêu và phạm vi

Tài liệu này giúp đội dự án và người dùng nội bộ:

1. Hiểu đúng nghiệp vụ đang chạy thực tế.
2. Thao tác đúng vai trò và đúng luồng duyệt.
3. Demo sản phẩm mạch lạc trong 5 phút.
4. Kiểm tra nhanh chất lượng hệ thống trước khi trình bày.

Phạm vi chức năng hiện tại:

- Không gian KPI: `/workspace`.
- Không gian OKR: `/okr`.
- Luồng đăng nhập: `/login` -> `/workspace`.

## 3. Tổng quan hệ thống

Hệ thống bao gồm 2 module cốt lõi:

1. `KPI Workspace` (`/workspace`): đánh giá hiệu suất nhân sự theo chu kỳ.
2. `OKR Workspace` (`/okr`): theo dõi mục tiêu, kết quả then chốt và check-in tiến độ.

Định hướng vận hành hiện tại:

- KPI là luồng chặt chẽ, có phê duyệt nhiều cấp.
- OKR là luồng thực dụng, gọn để bám theo tiến độ mục tiêu.
- Giao diện hỗ trợ song ngữ `VI/EN`; dữ liệu nghiệp vụ mới nên nhập tiếng Anh để đồng bộ cơ sở dữ liệu.

## 4. Tài khoản và đăng nhập

Hệ thống chấp nhận các định danh:

- Mã nhân viên (`EMP-ENG-001`).
- Mã nhân viên dạng email (`EMP-ENG-001@company`).
- Email hệ thống.
- Username.

Tài khoản demo chuẩn:

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

## 5. Ma trận phân quyền

| Chức năng | admin | hr | manager | employee |
|---|---|---|---|---|
| Truy cập `/workspace` | Có | Có | Có | Có |
| Truy cập `/okr` | Có | Có | Có | Có |
| Tạo chu kỳ KPI | Có | Có | Có | Không |
| Tạo hồ sơ KPI | Có | Có | Có (đúng phạm vi) | Không |
| Duyệt `manager_approve` | Có | Có | Có (đúng scope manager) | Không |
| Duyệt `hr_approve`, `approve`, `lock` | Có | Có | Không | Không |
| `unlock` hồ sơ KPI | Có | Không | Không | Không |
| Tạo chu kỳ OKR | Có | Không | Có | Không |
| Tạo objective/KR/check-in | Có | Có | Có | Có (dữ liệu thuộc mình) |
| Xem `/api/users` | Có | Không | Không | Không |
| Tạo user, reset mật khẩu | Có | Không | Không | Không |

Phạm vi dữ liệu KPI:

- `admin`: xem toàn bộ nhân sự hoạt động.
- `hr`: xem tập dữ liệu phục vụ đánh giá toàn công ty.
- `manager`: xem chính mình và nhân sự trong phạm vi phụ trách.
- `employee`: chỉ xem dữ liệu của chính mình.

## 6. Hướng dẫn chi tiết module KPI (`/workspace`)

### 6.1 Chọn nhân sự và chu kỳ

1. Chọn nhân sự tại danh sách `Nhân sự được đánh giá`.
2. Chọn chu kỳ tại danh sách `Chu kỳ đánh giá`.
3. Hệ thống tải hồ sơ tương ứng theo cặp `(nhân sự, chu kỳ)`.

Trường hợp chưa có hồ sơ:

- Giao diện hiển thị trạng thái “Chưa tạo hồ sơ”.
- Vẫn hiển thị thông tin nhân sự và chu kỳ đang chọn.
- Tránh tình trạng màn hình trắng gây hiểu nhầm mất dữ liệu.

### 6.2 Tạo chu kỳ đánh giá

1. Chọn loại chu kỳ: tháng/quý/năm.
2. Nhập tên chu kỳ.
3. Chọn ngày bắt đầu và ngày kết thúc.
4. Nhấn `Khởi tạo chu kỳ`.

Lưu ý:

- Chu kỳ dùng để gom dữ liệu đánh giá theo kỳ vận hành.
- Chu kỳ nên đặt tên rõ theo tháng/quý/năm để dễ truy vết.

### 6.3 Tạo hồ sơ đánh giá

1. Chọn nhân sự.
2. Chọn chu kỳ.
3. Nhấn `Khởi tạo hồ sơ đánh giá cho nhân sự đã chọn`.

Ràng buộc:

- Mỗi nhân sự trong mỗi chu kỳ chỉ có một hồ sơ KPI.

### 6.4 Cập nhật tiêu chí KPI

Các trường chính của một dòng tiêu chí:

- Tên tiêu chí.
- Mã dự án / tên dự án (nếu có).
- Mô tả công việc.
- Hệ số.
- Kế hoạch (%).
- Thực đạt (%).
- Minh chứng.
- Ghi chú quản lý.

Ràng buộc dữ liệu:

- Tổng hệ số tất cả tiêu chí phải `> 0` và `<= 7`.
- Hồ sơ đã `locked` chỉ admin mới có thể mở khóa để sửa.

### 6.5 Nhận xét và thao tác duyệt

Các thao tác hỗ trợ:

- `submit`
- `manager_approve`
- `hr_approve`
- `approve`
- `return`
- `lock`
- `unlock` (admin)

### 6.6 Vòng đời trạng thái KPI

| Trạng thái | Ý nghĩa |
|---|---|
| `draft` | Hồ sơ đang nhập liệu |
| `employee_submitted` | Nhân viên đã gửi duyệt |
| `manager_reviewed` | Quản lý đã duyệt |
| `hr_reviewed` | HR đã duyệt |
| `approved` | Hồ sơ đã được phê duyệt |
| `locked` | Hồ sơ đã khóa |
| `returned` | Hồ sơ bị trả về để bổ sung |

Chuyển trạng thái nghiệp vụ chính:

- `submit`: từ `draft`/`returned`/`employee_submitted`.
- `manager_approve`: từ `employee_submitted`/`manager_reviewed`.
- `hr_approve`: từ `manager_reviewed`/`hr_reviewed`.
- `approve`: từ `manager_reviewed`/`hr_reviewed`/`approved`.
- `return`: từ `employee_submitted`/`manager_reviewed`/`hr_reviewed`/`returned`.
- `lock`: từ `approved`/`hr_reviewed`/`locked`.
- `unlock`: từ `locked`/`approved`.

### 6.7 Quy tắc bảo vệ dữ liệu

- Employee chỉ được sửa KPI của chính mình trong thời gian hiệu lực chu kỳ.
- Manager duyệt trong phạm vi nhân sự được gán quản lý.
- Quyền không hợp lệ bị chặn bằng mã lỗi `403`.
- Dữ liệu không hợp lệ bị chặn bằng mã lỗi `400`.

## 7. Hướng dẫn chi tiết module OKR (`/okr`)

### 7.1 Luồng cơ bản

1. Chọn chu kỳ OKR.
2. Tạo objective.
3. Tạo key result trong objective.
4. Thực hiện check-in để cập nhật tiến độ.

### 7.2 Quy tắc chính

- Employee chỉ thao tác trên objective/KR/check-in thuộc quyền của mình.
- Không thể tạo KR trên objective không thuộc scope.
- Check-in cần nhập dữ liệu hợp lệ theo schema backend.

## 8. Dữ liệu mẫu (mock data) và seed

Mục tiêu dữ liệu demo hiện tại:

- Số lượng account vừa đủ để demo nhanh.
- Có dữ liệu cho nhiều phòng ban.
- Dữ liệu KPI được phủ theo nhiều chu kỳ để giảm trường hợp trống.

Lệnh seed local:

```bash
cd backend
npm.cmd run seed
```

Sau seed, cần kiểm tra nhanh:

- đăng nhập các tài khoản mẫu;
- đổi nhân sự và đổi chu kỳ tại `/workspace`;
- xem objective/KR/check-in tại `/okr`.

## 9. Checklist chạy hệ thống trước khi demo

### 9.1 Bắt buộc

- [ ] Cập nhật source mới nhất.
- [ ] Chạy seed backend.
- [ ] Build frontend thành công.
- [ ] Chạy smoke test API pass toàn bộ.
- [ ] Mở UI kiểm tra 2 route `/workspace` và `/okr`.

### 9.2 Lệnh tham chiếu

```bash
cd backend
npm.cmd run seed

cd ../frontend
npm.cmd run build

cd ..
powershell -ExecutionPolicy Bypass -File tools/smoke_api.ps1
```

## 10. Kịch bản demo chuẩn 5 phút

1. `0:00 - 0:40`: đăng nhập admin, giới thiệu mục tiêu hệ thống.
2. `0:40 - 2:00`: vào `/workspace`, đổi nhân sự và chu kỳ, trình bày dữ liệu KPI.
3. `2:00 - 3:10`: thực hiện một bước workflow duyệt KPI.
4. `3:10 - 4:20`: chuyển `/okr`, tạo objective -> KR -> check-in.
5. `4:20 - 5:00`: kết luận giá trị vận hành và khả năng mở rộng.

## 11. Q&A ngắn khi phản biện

1. Vì sao đổi chu kỳ không trống dữ liệu?
   - Vì dữ liệu seed đã phủ theo nhiều chu kỳ và UI có fallback rõ ràng.
2. Phân quyền có chặt không?
   - Có, backend kiểm soát theo role + scope; sai quyền trả `403`.
3. Nếu gần giờ demo bị lỗi?
   - Chạy lại seed và smoke script để xác nhận pass/fail ngay.

## 12. Sự cố thường gặp và cách xử lý

1. Không gọi được API:
   - kiểm tra backend có chạy ở `http://127.0.0.1:8000`.
2. Giao diện không cập nhật dữ liệu mới:
   - kiểm tra đã chạy seed đúng môi trường chưa.
3. Lỗi phân quyền khi thao tác:
   - kiểm tra tài khoản đang đăng nhập có đúng role nghiệp vụ không.

## 13. Tài liệu liên quan

- [USER_GUIDE.md](./USER_GUIDE.md)
- [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- [TAI_LIEU_NGHIEP_VU_HE_THONG.md](./TAI_LIEU_NGHIEP_VU_HE_THONG.md)
- [TAI_LIEU_HUONG_DAN_CHI_TIET_HE_THONG_OKR_KPI.md](./TAI_LIEU_HUONG_DAN_CHI_TIET_HE_THONG_OKR_KPI.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
