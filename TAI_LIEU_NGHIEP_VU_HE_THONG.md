# TÀI LIỆU NGHIỆP VỤ HỆ THỐNG OKR/KPI HR

## 1. Mục đích tài liệu

Tài liệu này giải thích ý nghĩa nghiệp vụ, mục đích sử dụng và cách vận hành của từng chức năng trong hệ thống OKR/KPI HR.

Tài liệu được viết để trả lời các câu hỏi như:
- Chức năng này dùng để làm gì?
- Vì sao có module có `Edit/Delete`, có module không có?
- Mục đích của `Check-in`, `Objective`, `Key Result`, `KPI`, `Cycle`, `Department`, `User` là gì?
- Mỗi `role` được làm gì và không được làm gì?

---

## 2. Tổng quan hệ thống

Hệ thống OKR/KPI HR dùng để quản lý mục tiêu và tiến độ công việc trong doanh nghiệp.

Hệ thống gồm các nhóm chức năng chính:
- `Dashboard`: xem tổng quan tình hình hệ thống.
- `Objectives`: quản lý mục tiêu.
- `Key Results`: quản lý kết quả đo lường được của objective.
- `KPIs`: quản lý chỉ số đánh giá hiệu suất.
- `Check-ins`: ghi nhận các lần cập nhật tiến độ theo thời gian.
- `Departments`: quản lý phòng ban.
- `Cycles`: quản lý chu kỳ lập kế hoạch.
- `Users`: quản lý tài khoản và vai trò.
- `Profile`: xem thông tin tài khoản đang đăng nhập.
- `Funny Assistant`: trợ lý hỗ trợ xem nhanh, đặt câu hỏi và gợi ý hành động.

Nội dung cốt lõi của hệ thống là:
- Quản lý mục tiêu.
- Theo dõi tiến độ.
- Phân quyền theo vai trò.
- Giữ lịch sử cập nhật để dễ audit và báo cáo.

---

## 3. Các vai trò trong hệ thống

### 3.1 Admin

`Admin` là vai trò quản trị cao nhất.

Mục đích:
- Quản lý toàn hệ thống.
- Quản lý tài khoản, phòng ban, chu kỳ.
- Theo dõi tổng quan dữ liệu và cấp quyền.

Thường sử dụng khi:
- Tạo user mới.
- Chỉnh role.
- Xóa user.
- Xóa phòng ban.
- Theo dõi toàn cảnh hệ thống.

### 3.2 Manager

`Manager` là vai trò quản lý vận hành.

Mục đích:
- Quản lý đội nhóm.
- Theo dõi objective, KPI, check-in của nhóm.
- Tạo và cập nhật dữ liệu vận hành.

Thường sử dụng khi:
- Tạo objective, key result, KPI cho nhóm.
- Theo dõi rủi ro và tiến độ.
- Tạo cycle mới.
- Cập nhật phòng ban, nhưng không xóa phòng ban nếu hệ thống để quyền xóa cho admin.

### 3.3 Employee

`Employee` là vai trò thực thi.

Mục đích:
- Theo dõi mục tiêu được giao.
- Cập nhật KPI, Key Result, Check-in trong phạm vi dữ liệu của mình.

Thường sử dụng khi:
- Xem dashboard của bản thân.
- Tạo check-in.
- Cập nhật objective/KPI nằm trong phạm vi được giao.

Nguyên tắc:
- Employee không được thấy tất cả các khu quản trị.
- Employee chỉ thao tác trên dữ liệu thuộc phạm vi owner hoặc metric được giao.

---

## 4. Dashboard

### Mục đích

`Dashboard` là màn hình tổng quan đầu tiên sau khi đăng nhập.

Nó cho biết:
- Số liệu tổng quan.
- Mục tiêu đang chạy.
- Rủi ro cần xử lý.
- Các mục ưu tiên tiếp theo.

### Ý nghĩa nghiệp vụ

`Dashboard` không phải nơi để sửa dữ liệu chi tiết.

Nó có vai trò:
- Tổng hợp.
- Định hướng.
- Dẫn đường sang các module cần xử lý.

Nghĩa là:
- Muốn chỉnh sửa chi tiết thì đi sang `Objectives`, `Key Results`, `KPIs`, `Users`, ...
- Muốn nhìn toàn cảnh thì vào `Dashboard`.

---

## 5. Objectives

### Mục đích

`Objective` là mục tiêu cần đạt được trong một chu kỳ.

Ví dụ:
- Nâng cao chất lượng vận hành.
- Cải thiện trải nghiệm nhân viên.
- Tăng hiệu suất phòng ban.

### Ý nghĩa nghiệp vụ

Objective trả lời câu hỏi:
- Chúng ta đang muốn đạt điều gì?

Objective thường có:
- Chu kỳ.
- Người phụ trách.
- Phòng ban.
- Trạng thái.
- Tiến trình tổng.

### Vì sao Objective có `Edit/Delete`

Objective là bản ghi gốc để quản lý mục tiêu.

Do đó:
- Cần `Create` để tạo mục tiêu mới.
- Cần `Edit` để đổi tiêu đề, owner, cycle, status.
- Cần `Delete` khi mục tiêu tạo sai, trùng hoặc không còn hợp lệ.

### Lưu ý nghiệp vụ

Tiến trình của objective thường được suy ra từ `Key Results`.

Nếu objective chưa có key result:
- Hệ thống có thể cho phép nhập tiến trình tạm.
- Hoặc giữ giá trị hiện có.

Nếu objective đã có key result:
- Tiến trình objective thường là tổng hợp từ key result.

---

## 6. Key Results

### Mục đích

`Key Result` là kết quả đo lường được để chứng minh objective đang tiến triển.

Ví dụ:
- Tỷ lệ hoàn thành onboarding đạt 95%.
- Giảm lỗi vận hành xuống dưới 3%.

### Ý nghĩa nghiệp vụ

Objective trả lời:
- Muốn đạt điều gì?

Key Result trả lời:
- Đo bằng cách nào?
- Kết quả cần đạt là bao nhiêu?

### Vì sao Key Result có `Edit/Delete`

Đây là bản ghi mục tiêu con, vẫn là dữ liệu gốc để quản lý.

Nên cần:
- `Create`
- `Edit`
- `Delete`

### Quan hệ với Check-in

`Check-in` sẽ cập nhật giá trị thực tế cho Key Result.

Ví dụ:
- Bắt đầu là 10.
- Mục tiêu là 100.
- Hôm nay check-in cập nhật lên 55.

Lúc đó:
- Key Result đổi `current_value`.
- Tiến trình sẽ thay đổi theo.

---

## 7. KPIs

### Mục đích

`KPI` là chỉ số đánh giá hiệu suất.

Khác với objective:
- Objective nghiêng về mục tiêu chiến lược.
- KPI nghiêng về chỉ số vận hành và đo lường hiệu suất.

### Ý nghĩa nghiệp vụ

KPI dùng để trả lời:
- Hiệu suất hiện tại đang ở mức nào?
- Chỉ số này có đạt kỳ vọng không?

### Vì sao KPI có `Edit/Delete`

KPI là dữ liệu quản trị chính thức.

Nên cần:
- `Create`
- `Edit`
- `Delete`

### Quan hệ với Check-in

Tương tự Key Result, KPI cũng có thể được cập nhật bằng `Check-in`.

Điều này giúp:
- Giữ lịch sử thay đổi.
- Theo dõi mức cải thiện theo thời gian.
- Phân tích xu hướng.

---

## 8. Check-ins

### Mục đích

`Check-in` là bản ghi cập nhật tiến độ theo từng thời điểm.

Ví dụ:
- Hôm nay KPI tăng từ 60 lên 72.
- Tuần này Key Result đạt 55%.

### Ý nghĩa nghiệp vụ

Check-in giống như nhật ký tiến độ.

Nó trả lời:
- Hôm nay có cập nhật gì?
- Tiến độ thay đổi ra sao theo thời gian?
- Mục tiêu nào đang bị chậm cập nhật?

### Vì sao Check-in không có `Edit/Delete` trong thiết kế hiện tại

Đây là điểm rất quan trọng về nghiệp vụ.

Check-in không phải dữ liệu cấu hình gốc, mà là dữ liệu lịch sử.

Mục tiêu của việc giữ `Create/View` mà không cho `Edit/Delete` là:
- Giữ tính trung thực của lịch sử cập nhật.
- Tránh xóa dấu vết thao tác.
- Dễ audit.
- Thuận lợi khi xem timeline tiến độ.

Nói đơn giản:
- `Objective`, `Key Result`, `KPI` là thứ mình đang quản lý nên cần sửa/xóa.
- `Check-in` là dấu mốc thời gian đã diễn ra nên thường chỉ ghi nhận, không sửa/xóa.

### Khi nào có thể mở `Edit/Delete` cho Check-in

Chỉ nên mở nếu doanh nghiệp muốn:
- Linh hoạt hơn khi nhập sai số.
- Không quá nặng về audit.

Nếu mở quyền này thì nên có:
- Log chỉnh sửa.
- Người sửa cuối.
- Thời gian sửa cuối.

---

## 9. Departments

### Mục đích

`Department` dùng để tổ chức dữ liệu theo phòng ban.

Ví dụ:
- HR
- Sales
- Engineering

### Ý nghĩa nghiệp vụ

Department giúp:
- Gán owner theo cơ cấu tổ chức.
- Phân nhóm KPI/Objectives.
- Báo cáo theo đơn vị.

### Vì sao manager có thể sửa nhưng không phải lúc nào cũng được xóa

Xóa phòng ban là hành động có rủi ro cao vì ảnh hưởng tới:
- User.
- Objective.
- KPI.
- Dữ liệu liên kết khác.

Vì vậy nhiều hệ thống chỉ để `Admin` xóa phòng ban.

Manager thường chỉ:
- Tạo mới.
- Cập nhật mô tả.
- Cập nhật người phụ trách.

---

## 10. Cycles

### Mục đích

`Cycle` là chu kỳ lập kế hoạch hoặc chu kỳ đánh giá.

Ví dụ:
- Q1/2026
- Tháng 04/2026
- Chu kỳ bán niên

### Ý nghĩa nghiệp vụ

Cycle giúp:
- Gom Objective/KPI theo giai đoạn.
- Dễ báo cáo theo kỳ.
- Phân biệt mục tiêu nào đang active, planning hay closed.

### Vì sao Cycle có `Delete`

Cycle là dữ liệu cấu hình.

Nếu tạo sai hoặc tạo trùng thì cần xóa.

Tuy nhiên thường chỉ xóa được khi:
- Không còn objective liên kết.
- Không còn KPI liên kết.

Lý do là để tránh làm gãy dữ liệu lịch sử.

---

## 11. Users

### Mục đích

`Users` là nơi quản lý tài khoản sử dụng hệ thống.

Bao gồm:
- Họ tên.
- Username.
- Email.
- Vai trò.
- Phòng ban.
- Trạng thái kích hoạt.

### Ý nghĩa nghiệp vụ

User là gốc của phân quyền.

Nếu role và phòng ban không đúng thì:
- Dữ liệu nhìn thấy sẽ sai.
- Quyền thao tác sẽ sai.
- Báo cáo owner sẽ sai.

### Vì sao không phải ai cũng có quyền sửa/xóa user

Đây là chức năng nhạy cảm.

Nếu manager hoặc employee đều sửa được user thì có thể gây:
- Sai quyền.
- Mất kiểm soát tài khoản.
- Thay đổi cơ cấu quản trị trái phép.

Do đó hệ thống thường để:
- `Admin`: tạo/sửa/xóa user.
- `Manager`: chủ yếu xem.
- `Employee`: không can thiệp quản trị tài khoản.

---

## 12. Profile

### Mục đích

`Profile` là nơi người dùng xem thông tin tài khoản của chính mình.

### Ý nghĩa nghiệp vụ

Profile giúp người dùng xác nhận:
- Mình đang đăng nhập bằng tài khoản nào.
- Role hiện tại là gì.
- Thuộc phòng ban nào.

Profile không phải nơi quản trị người dùng toàn hệ thống.

---

## 13. Funny Assistant

### Mục đích

`Funny Assistant` là trợ lý nội bộ giúp hỏi nhanh dữ liệu vận hành.

Ví dụ:
- Hiện tại có bao nhiêu nhân viên?
- KPI nào đang rủi ro?
- Department nào có hiệu suất tốt nhất?

### Ý nghĩa nghiệp vụ

Mục tiêu không phải thay thế dashboard, mà là:
- Truy vấn nhanh.
- Gợi ý câu hỏi.
- Hỗ trợ người dùng đọc dữ liệu dễ hơn.

### Vì sao Funny không được quyền làm mọi thứ

Để đảm bảo an toàn:
- Funny chỉ dùng các truy vấn backend cho phép.
- Không chạy SQL tự do.
- Vẫn bị chặn theo role.

Điều này giúp tránh:
- Rò rỉ dữ liệu.
- Trả lời ngoài phạm vi quyền hạn.
- Lạm dụng AI để truy cập dữ liệu không nên thấy.

---

## 14. Nguyên tắc `Create / Edit / Delete / View`

Có thể hiểu nhanh như sau:

### Nhóm dữ liệu gốc, dữ liệu cấu hình

Bao gồm:
- `Objectives`
- `Key Results`
- `KPIs`
- `Cycles`
- `Departments`
- `Users`

Đây là những dữ liệu cần quản lý trực tiếp nên thường có:
- `Create`
- `Edit`
- `Delete`
- `View`

### Nhóm dữ liệu lịch sử, nhật ký

Bao gồm:
- `Check-ins`

Nhóm này thường ưu tiên:
- `Create`
- `View`

Và có thể không có:
- `Edit`
- `Delete`

Lý do:
- Bảo toàn lịch sử.
- Dễ audit.
- Dễ truy vết.

---

## 15. Kết luận

Hệ thống OKR/KPI HR không chỉ là nơi nhập dữ liệu, mà là công cụ quản lý mục tiêu, đo lường hiệu suất và theo dõi tiến độ có phân quyền.

Điểm quan trọng nhất để hiểu hệ thống là:
- Dữ liệu gốc thì cần sửa/xóa được.
- Dữ liệu lịch sử thì thường nên giữ nguyên.
- Role quyết định phạm vi nhìn thấy và phạm vi thao tác.
- Mỗi module được thiết kế theo mục đích nghiệp vụ, không phải chỉ để đủ CRUD.
