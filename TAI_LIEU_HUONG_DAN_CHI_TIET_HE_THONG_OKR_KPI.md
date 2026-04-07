# TÀI LIỆU HƯỚNG DẪN CHI TIẾT HỆ THỐNG OKR/KPI HR

## 1. Mục đích tài liệu

Tài liệu này được viết cho người mới tiếp nhận hệ thống, kể cả khi chưa biết gì về sản phẩm trước đó.

Mục tiêu của tài liệu:

- giúp hiểu hệ thống đang dùng để làm gì
- giúp hiểu từng vai trò được làm gì và không được làm gì
- giúp hiểu từng khu trên giao diện và từng trường dữ liệu quan trọng
- giúp hiểu luồng KPI từ lúc tạo đến lúc khóa
- giúp hiểu trang OKR basic đang hoạt động như thế nào
- giúp hiểu các điểm mạnh, giới hạn và lưu ý vận hành thực tế

## 2. Hệ thống này dùng để làm gì

Đây là hệ thống phục vụ hai nhu cầu nghiệp vụ chính trong doanh nghiệp:

- `KPI` tại `/workspace`: đánh giá hiệu suất nhân sự theo chu kỳ tháng, quý hoặc năm
- `OKR` tại `/okr`: theo dõi objective, key result và check-in tiến độ ở mức cơ bản

Nói ngắn gọn:

- KPI dùng để đánh giá và phê duyệt kết quả công việc theo kỳ
- OKR dùng để theo dõi mục tiêu và tiến độ thực hiện mục tiêu

## 3. Triết lý thiết kế hiện tại

Hệ thống được thiết kế theo hướng thực dụng cho nội bộ công ty:

- ít route
- ít bước bấm
- tách KPI và OKR để tránh rối
- giao diện rõ, chữ dễ đọc, tải nhanh
- không dùng dark mode trong luồng chính
- không dùng AI hoặc funny assistant trong luồng chính

## 4. Các route chính

- `/login`: đăng nhập
- `/workspace`: không gian KPI
- `/okr`: không gian OKR basic

Người dùng đăng nhập thành công sẽ vào `/workspace`, sau đó có thể chuyển giữa `KPI` và `OKR` bằng tab điều hướng trên giao diện.

## 5. Các vai trò trong hệ thống

Hệ thống hiện có 4 vai trò:

1. `admin`
2. `hr`
3. `manager`
4. `employee`

### 5.1 Admin

Admin có thể:

- tạo user mới
- reset mật khẩu
- xem danh sách user toàn hệ thống
- tạo chu kỳ KPI
- tạo hồ sơ KPI
- hỗ trợ mở khóa KPI đã khóa
- phê duyệt cuối cùng hoặc khóa hồ sơ KPI
- tạo chu kỳ OKR
- theo dõi toàn bộ dữ liệu OKR

Admin là lớp quyền cuối cùng để xử lý ngoại lệ.

### 5.2 HR

HR có thể:

- tạo hồ sơ KPI
- theo dõi KPI liên phòng ban
- thêm nhận xét HR
- thực hiện `hr_approve`
- thực hiện `approve`
- khóa hồ sơ KPI
- xem và cập nhật dữ liệu OKR cơ bản

HR không có quyền:

- CRUD user toàn hệ thống như admin
- mở khóa KPI đã khóa
- tạo chu kỳ OKR qua giao diện hiện tại

### 5.3 Manager

Manager có thể:

- xem KPI của nhân sự trong phạm vi phụ trách
- tạo hồ sơ KPI cho nhân sự thuộc phạm vi mình quản lý
- cập nhật ghi chú quản lý
- thực hiện `manager_approve`
- trả KPI về bằng `return`
- tạo chu kỳ OKR cơ bản
- tạo objective, key result và check-in ở trang OKR

Manager không có quyền:

- xem toàn bộ user qua `/api/users`
- mở khóa KPI đã khóa
- quản trị tài khoản user

### 5.4 Employee

Employee có thể:

- xem KPI của chính mình
- cập nhật mô tả công việc, tiến độ, minh chứng, dữ liệu dự án trong KPI
- gửi nhận xét cá nhân
- `submit` KPI để chuyển sang bước duyệt
- xem objective hoặc key result thuộc mình
- gửi check-in OKR trên dữ liệu thuộc mình

Employee không có quyền:

- tạo chu kỳ KPI
- tạo hồ sơ KPI
- đổi trọng số hoặc cấu trúc tiêu chí gốc
- duyệt KPI của người khác

## 6. Cách đăng nhập

Hệ thống chấp nhận các định danh sau:

- mã nhân viên
- mã nhân viên kèm `@company`
- email hệ thống
- username

Tài khoản demo:

- `ADM-001@company / Admin@123`
- `MGR-ENG-001@company / Manager@123`
- `MGR-SAL-001@company / Manager@123`
- `MGR-HR-001@company / Manager@123`
- `HR-001@company / Manager@123`
- `EMP-ENG-001@company / Employee@123`
- `EMP-SAL-001@company / Employee@123`
- `EMP-HR-001@company / Employee@123`

Nếu màn hình login báo không kết nối được API, cần kiểm tra backend local có đang chạy ở cổng `8000` hay không.

## 7. Bố cục trang KPI tại `/workspace`

Trang KPI gồm các khu chính:

- khu tiêu đề hệ thống và chuyển ngôn ngữ
- khu chọn nhân sự và chu kỳ đánh giá
- khu thiết lập chu kỳ KPI
- khối thông tin tóm tắt hồ sơ nhân sự
- khối snapshot để nhìn nhanh tình trạng hồ sơ
- bảng tiêu chí đánh giá
- khối nhận xét và thao tác phê duyệt
- lịch sử công tác và lịch sử đánh giá
- khu quản trị tài khoản dành riêng cho admin

## 8. Bố cục trang OKR tại `/okr`

Trang OKR gồm các khu chính:

- bộ lọc chu kỳ OKR và người phụ trách
- khối tổng quan nhanh về objective và key result
- danh sách objective
- danh sách key result nằm trong từng objective
- form tạo chu kỳ OKR
- form tạo objective
- form tạo key result
- form gửi check-in tiến độ
- lịch sử check-in

Trang OKR hiện được làm theo hướng basic, thực dụng, không đi theo workflow phức tạp như KPI.

## 9. Luồng KPI tổng quát

Một vòng đời KPI thường diễn ra như sau:

1. Admin, HR hoặc Manager tạo chu kỳ đánh giá
2. Admin, HR hoặc Manager tạo hồ sơ KPI cho nhân sự
3. Hệ thống sinh sẵn các tiêu chí mặc định
4. Employee cập nhật dữ liệu công việc
5. Employee gửi hồ sơ bằng `submit`
6. Manager xem và duyệt bằng `manager_approve`, hoặc trả về bằng `return`
7. HR xem và duyệt bằng `hr_approve`
8. HR hoặc Admin thực hiện `approve`
9. HR hoặc Admin thực hiện `lock`
10. Nếu cần chỉnh lại hồ sơ đã khóa, chỉ Admin mới có thể `unlock`

## 10. Trạng thái KPI

Các trạng thái chính:

- `draft`: đang nhập liệu
- `employee_submitted`: nhân viên đã gửi duyệt
- `manager_reviewed`: quản lý đã duyệt
- `hr_reviewed`: HR đã duyệt
- `approved`: hồ sơ đã được phê duyệt hoàn tất
- `locked`: hồ sơ đã khóa
- `returned`: hồ sơ bị trả về để bổ sung

Ý nghĩa vận hành:

- `draft` và `returned` là hai trạng thái hay dùng cho nhập liệu
- `locked` là trạng thái chốt dữ liệu
- hồ sơ đã khóa thì người dùng thông thường không được sửa

## 11. Các trường quan trọng trong KPI

### 11.1 Tiêu chí

Đây là tên đầu việc hoặc nhóm đánh giá.

Ví dụ:

- `Project KPI`
- `Work Quality`
- `Discipline and Collaboration`

### 11.2 Mô tả

Đây là phần mô tả chi tiết nhân sự đã làm gì hoặc cần đạt điều gì.

### 11.3 Mã dự án

`Mã dự án` là mã nhận diện ngắn của dự án hoặc công việc liên quan đến tiêu chí KPI.

Ví dụ:

- `PRJ-API-01`
- `CRM-SALES-Q2`
- `HR-ONBOARD-2026`

Hiện tại trường này đang theo hướng:

- có thể do người thao tác nhập thủ công
- có thể để trống nếu tiêu chí không gắn với một dự án cụ thể
- dùng để tham chiếu nhanh khi đối chiếu giữa nhiều tiêu chí hoặc nhiều kỳ

Nói đơn giản:

- có dòng có mã dự án vì tiêu chí đó gắn với một dự án thật
- có dòng không có mã dự án vì đó là tiêu chí chung như kỷ luật, phối hợp hoặc sáng kiến

### 11.4 Hệ số

Hệ số thể hiện mức độ quan trọng của tiêu chí.

Quy tắc hiện tại:

- tổng hệ số phải lớn hơn `0`
- tổng hệ số không vượt quá `7`

### 11.5 Phần trăm kế hoạch và phần trăm thực đạt

Hai trường này dùng để so sánh kế hoạch và kết quả thực tế.

Hệ thống sẽ dùng chúng để tính điểm theo logic đã thiết kế ở backend.

## 12. Luồng OKR tổng quát

Một vòng làm việc OKR cơ bản thường diễn ra như sau:

1. Chọn hoặc tạo chu kỳ OKR
2. Tạo objective cho cá nhân hoặc bộ phận
3. Tạo key result cho objective
4. Nhập giá trị bắt đầu, hiện tại và mục tiêu
5. Thực hiện check-in định kỳ
6. Theo dõi objective nào đang `on_track`, objective nào `at_risk`, objective nào `completed`

## 13. Các khái niệm chính của OKR

### 13.1 Objective

Objective là mục tiêu cần đạt.

Ví dụ:

- nâng chất lượng onboarding cho kỹ thuật
- cải thiện tốc độ phản hồi sale
- nâng tỷ lệ giữ chân nhân sự

### 13.2 Key Result

Key result là kết quả then chốt dùng để đo objective.

Ví dụ:

- thời gian onboarding giảm còn 3 ngày
- tỷ lệ chuyển đổi tăng lên 25 phần trăm
- tỷ lệ nghỉ việc giảm xuống dưới 8 phần trăm

### 13.3 Check-in

Check-in là lần cập nhật tiến độ mới nhất cho key result.

Một check-in thường gồm:

- ngày check-in
- giá trị sau cập nhật
- ghi chú cập nhật
- mức độ tự tin
- vướng mắc nếu có

## 14. Quy tắc dữ liệu và ngôn ngữ

Các trường dữ liệu nghiệp vụ mới trong hệ thống hiện được giữ bằng tiếng Anh ở database để:

- đồng bộ dữ liệu giữa local và production
- giảm lệch seed
- tránh một khái niệm có nhiều cách viết khác nhau
- thuận tiện mở rộng giao diện song ngữ sau này

Điều này áp dụng cho:

- tên tiêu chí KPI
- mô tả KPI
- objective title
- key result title
- check-in note
- các dữ liệu nghiệp vụ tương tự

Tên riêng của nhân sự không bị ép sang tiếng Anh.

## 15. Các giới hạn hiện tại của hệ thống

- KPI hiện là phần chặt và đầy đủ hơn OKR
- OKR hiện mới là bản basic, chưa phải nền tảng OKR enterprise hoàn chỉnh
- backend vẫn còn giữ một số API cũ để tương thích
- chưa có bộ automated test đầy đủ cho toàn hệ thống

## 16. Khi nào hệ thống phù hợp để áp dụng thực tế

Hệ thống hiện phù hợp với doanh nghiệp cần:

- đánh giá hiệu suất theo kỳ
- quản lý phê duyệt KPI nhiều cấp
- theo dõi mục tiêu OKR ở mức đơn giản
- ưu tiên thao tác nhanh, dễ đào tạo, dễ vận hành

## 17. Tài liệu nên đọc tiếp

- [README.md](./README.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
