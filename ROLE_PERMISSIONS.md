# ROLE PERMISSIONS (VI)

Bang nay tong hop quyen hien tai cua he thong theo `role`.

## Vai tro

- `admin`: quyen cao nhat, quan tri toan he thong.
- `manager`: quan ly du lieu van hanh va doi nhom.
- `employee`: thao tac trong pham vi du lieu duoc giao.

## Ma tran quyen chinh

| Module | admin | manager | employee |
|---|---|---|---|
| Dashboard | xem | xem | xem |
| Funny Assistant | xem + chat | xem + chat | xem + chat |
| Users | xem + tao/sua/xoa | xem | xem |
| Departments | xem + tao/sua/xoa | xem + tao/sua | xem |
| Cycles | xem + tao/sua/xoa | xem + tao/sua/xoa* | xem |
| Objectives | xem + tao/sua/xoa | xem + tao/sua/xoa | chi thao tac trong pham vi owner |
| Key Results | xem + tao/sua/xoa | xem + tao/sua/xoa | chi thao tac trong pham vi owner |
| KPIs | xem + tao/sua/xoa | xem + tao/sua/xoa | chi thao tac trong pham vi owner |
| Check-ins | xem + tao | xem + tao | chi tao/xem cho metric duoc giao |
| Profile | xem | xem | xem |

\*Xoa cycle chi thanh cong khi cycle khong con linked objectives hoac KPI metrics.

## Ghi chu

- Frontend da an cac menu khong phu hop role (vi du: `employee` khong thay `Departments`/`Cycles`/`Users`).
- Backend van la lop chan cuoi, neu role khong du quyen se tra ve `403`.
