# TÀI LIỆU HƯỚNG DẪN CHI TIẾT HỆ THỐNG OKR/KPI HR

## 1. Mục đích tài liệu

Tài liệu này là bản hướng dẫn sử dụng chi tiết theo trạng thái hệ thống hiện tại, dùng cho:

- đội vận hành nội bộ;
- đội demo/hackathon;
- người dùng mới tiếp nhận hệ thống.

Mục tiêu:

1. Thống nhất cách hiểu nghiệp vụ KPI và OKR.
2. Hướng dẫn thao tác đúng theo vai trò.
3. Giảm lỗi demo do sai luồng hoặc sai phân quyền.

## 2. Phạm vi hệ thống

Hệ thống gồm hai không gian nghiệp vụ chính:

1. `KPI Workspace` tại `/workspace`.
2. `OKR Workspace` tại `/okr`.

Luồng truy cập chuẩn:

1. Đăng nhập tại `/login`.
2. Đăng nhập thành công chuyển vào `/workspace`.
3. Chuyển tab giữa `KPI` và `OKR` theo nhu cầu.

## 3. Vai trò người dùng

Hệ thống có bốn vai trò:

- `admin`
- `hr`
- `manager`
- `employee`

## 4. Ma trận phân quyền chính

| Chức năng | admin | hr | manager | employee |
|---|---|---|---|---|
| Truy cập `/workspace` | Có | Có | Có | Có |
| Truy cập `/okr` | Có | Có | Có | Có |
| Tạo chu kỳ KPI | Có | Có | Có | Không |
| Tạo hồ sơ KPI | Có | Có | Có (đúng phạm vi) | Không |
| `manager_approve` KPI | Có | Có | Có (đúng manager được gán) | Không |
| `hr_approve`, `approve`, `lock` KPI | Có | Có | Không | Không |
| `unlock` KPI | Có | Không | Không | Không |
| Tạo chu kỳ OKR | Có | Không | Có | Không |
| Tạo objective/KR/check-in | Có | Có | Có | Có (dữ liệu thuộc mình) |
| Xem danh sách user `/api/users` | Có | Không | Không | Không |
| Tạo user/reset mật khẩu | Có | Không | Không | Không |

## 5. Hướng dẫn chi tiết KPI Workspace (`/workspace`)

## 5.1 Chọn nhân sự và chu kỳ

1. Chọn nhân sự ở danh sách `Nhân sự được đánh giá`.
2. Chọn chu kỳ ở danh sách `Chu kỳ đánh giá`.
3. Hệ thống tải hồ sơ theo cặp `(nhân sự, chu kỳ)`.

Lưu ý trạng thái chưa có hồ sơ:

- giao diện hiển thị `Chưa tạo hồ sơ`;
- vẫn hiển thị thông tin nhân sự và chu kỳ đang chọn;
- tránh cảm giác mất dữ liệu khi đổi kỳ.

## 5.2 Tạo chu kỳ KPI

1. Chọn loại chu kỳ: tháng/quý/năm.
2. Nhập tên chu kỳ.
3. Chọn mốc ngày bắt đầu (hệ thống tự chuẩn hóa theo loại kỳ).
4. Nhấn `Khởi tạo chu kỳ`.

## 5.3 Tạo hồ sơ KPI

1. Chọn nhân sự.
2. Chọn chu kỳ.
3. Nhấn `Khởi tạo hồ sơ đánh giá cho nhân sự đã chọn`.

Ràng buộc:

- mỗi cặp `(employee_user_id, period_id)` chỉ có một hồ sơ KPI.

## 5.4 Cập nhật tiêu chí đánh giá

Một tiêu chí KPI thường gồm:

- nhóm tiêu chí;
- mã/tên dự án;
- mô tả;
- hệ số;
- kế hoạch (%);
- thực đạt (%);
- minh chứng;
- ghi chú quản lý.

Ràng buộc quan trọng:

- tổng hệ số toàn hồ sơ phải `> 0` và `<= 7`;
- hồ sơ `locked` bị chặn sửa (trừ khi admin mở khóa).

## 5.5 Nhận xét và lịch sử thao tác

Hệ thống lưu:

- nhận xét theo vai trò (`employee_self`, `manager`, `hr`, `final`);
- lịch sử thao tác duyệt (`submit`, `manager_approve`, `hr_approve`, `approve`, `return`, `lock`, `unlock`).

## 5.6 Luồng trạng thái KPI

| Trạng thái | Mô tả |
|---|---|
| `draft` | Hồ sơ đang nhập liệu |
| `employee_submitted` | Nhân viên đã gửi duyệt |
| `manager_reviewed` | Quản lý đã duyệt |
| `hr_reviewed` | HR đã duyệt |
| `approved` | Hồ sơ đã phê duyệt |
| `locked` | Hồ sơ đã khóa |
| `returned` | Hồ sơ trả về để bổ sung |

Nguyên tắc kiểm soát:

- manager chỉ duyệt hồ sơ do mình phụ trách;
- employee chỉ submit hồ sơ của chính mình;
- `unlock` chỉ dành cho admin.

## 5.7 Quy tắc thời gian cho employee

- employee chỉ chỉnh KPI của mình trong khoảng ngày hiệu lực của chu kỳ;
- nếu chưa đến kỳ hoặc quá kỳ, backend chặn và trả lỗi nghiệp vụ.

## 6. Hướng dẫn chi tiết OKR Workspace (`/okr`)

## 6.1 Luồng thao tác chuẩn

1. Chọn hoặc tạo chu kỳ OKR.
2. Tạo objective.
3. Tạo key result cho objective.
4. Tạo check-in để cập nhật tiến độ.

## 6.2 Tạo objective

Các trường chính:

- `title`, `description`;
- `cycle_id`;
- `owner_user_id`;
- `objective_type`;
- `start_date`, `due_date`.

Lưu ý quyền:

- employee tạo objective cho chính mình;
- role khác có thể tạo objective theo quyền được cấp.

## 6.3 Tạo key result

Các trường chính:

- `objective_id`, `title`;
- `direction` (`increase`, `decrease`, `maintain`);
- `start_value`, `current_value`, `target_value`;
- `measurement_unit`.

Lưu ý quyền:

- employee không được tạo KR vào objective không thuộc quyền của mình.

## 6.4 Tạo check-in

Check-in hỗ trợ cập nhật:

- giá trị sau cập nhật;
- ngày check-in;
- mức độ tự tin;
- ghi chú cập nhật;
- blocker (nếu có).

Ràng buộc:

- phải có `note` hoặc `update_note`;
- sai quyền trả `403`, sai dữ liệu trả `400`.

## 7. Quy tắc dữ liệu và ngôn ngữ

Để đồng bộ giữa local, seed và production:

- dữ liệu nghiệp vụ mới nên nhập bằng tiếng Anh;
- tên riêng nhân sự giữ nguyên theo thực tế;
- giao diện có thể hiển thị song ngữ `VI/EN`.

## 8. Tài khoản demo chuẩn

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

## 9. Checklist chạy nhanh trước demo

- [ ] Chạy `backend` seed thành công.
- [ ] Chạy build `frontend` thành công.
- [ ] Chạy smoke API pass toàn bộ case.
- [ ] Kiểm tra `/workspace`: đổi nhân sự, đổi chu kỳ, không rơi trạng thái trống khó hiểu.
- [ ] Kiểm tra `/okr`: tạo objective, KR, check-in đúng quyền.

Lệnh tham chiếu:

```bash
cd backend
npm.cmd run seed

cd ../frontend
npm.cmd run build

cd ..
powershell -ExecutionPolicy Bypass -File tools/smoke_api.ps1
```

## 10. Xử lý sự cố thường gặp

1. Không gọi được API:
   - kiểm tra backend đang chạy `http://127.0.0.1:8000`.
2. Đổi chu kỳ không có hồ sơ:
   - kiểm tra đã có review cho cặp nhân sự-kỳ chưa;
   - nếu cần chạy lại seed.
3. Thao tác bị từ chối:
   - kiểm tra role hiện tại và phạm vi dữ liệu.

## 11. Endpoint tài liệu online

Backend cung cấp endpoint tài liệu:

- `GET /api/guides/user-guide`
- `GET /api/guides/user-guide/view`
- `GET /api/guides/user-guide/download`

## 12. Tài liệu liên quan

- [USER_GUIDE.md](./USER_GUIDE.md)
- [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- [TAI_LIEU_NGHIEP_VU_HE_THONG.md](./TAI_LIEU_NGHIEP_VU_HE_THONG.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
