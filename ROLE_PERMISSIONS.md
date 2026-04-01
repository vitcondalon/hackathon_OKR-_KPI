# ROLE PERMISSIONS

Bảng này tổng hợp quyền hiện tại của hệ thống theo `role`.

## Vai trò

- `admin`: quyền cao nhất, quản trị toàn hệ thống.
- `manager`: quản lý dữ liệu vận hành và đội nhóm.
- `employee`: thao tác trong phạm vi dữ liệu được giao.

## Ma trận quyền chính

| Module | admin | manager | employee |
|---|---|---|---|
| Dashboard | xem | xem | xem |
| Funny Assistant | xem + chat | xem + chat | xem + chat |
| Users | xem + tạo/sửa/xóa | xem | xem |
| Departments | xem + tạo/sửa/xóa | xem + tạo/sửa | xem |
| Cycles | xem + tạo/sửa/xóa | xem + tạo/sửa/xóa* | xem |
| Objectives | xem + tạo/sửa/xóa | xem + tạo/sửa/xóa | chỉ thao tác trong phạm vi owner |
| Key Results | xem + tạo/sửa/xóa | xem + tạo/sửa/xóa | chỉ thao tác trong phạm vi owner |
| KPIs | xem + tạo/sửa/xóa | xem + tạo/sửa/xóa | chỉ thao tác trong phạm vi owner |
| Check-ins | xem + tạo | xem + tạo | chỉ tạo/xem cho metric được giao |
| Profile | xem | xem | xem |

\* Xóa cycle chỉ thành công khi cycle không còn linked objectives hoặc KPI metrics.

## Ghi chú

- Frontend đã ẩn các menu không phù hợp role, ví dụ `employee` không thấy `Departments`, `Cycles`, `Users`.
- Backend vẫn là lớp chặn cuối. Nếu role không đủ quyền, API sẽ trả về `403`.
