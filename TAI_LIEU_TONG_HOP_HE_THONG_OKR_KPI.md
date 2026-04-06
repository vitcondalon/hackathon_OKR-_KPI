# TÀI LIỆU TỔNG HỢP HỆ THỐNG OKR/KPI HR

## Mục đích tài liệu

Tài liệu này là bản Markdown tổng hợp tương ứng với file Word chính của dự án. Nội dung tập trung vào đúng trạng thái hệ thống hiện tại: một màn hình làm việc trung tâm cho quy trình đánh giá hiệu suất nhân sự theo chu kỳ.

Tài liệu Word chính:
- [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)

---

## PHẦN 1. HƯỚNG DẪN SỬ DỤNG

## 1.1 Đăng nhập

Người dùng đăng nhập tại `/login` bằng một trong các định danh sau:

- `employee_code`, ví dụ `EMP-ENG-001`
- `employee_code@company`, ví dụ `EMP-ENG-001@company`
- email hệ thống được tạo từ mã nhân viên
- username hệ thống

Sau khi đăng nhập thành công, hệ thống chuyển đến `/workspace`.

## 1.2 Bố cục workspace

Workspace hiện được tổ chức thành các khối chính:

- khối tiêu đề hệ thống và chuyển ngôn ngữ `VI/EN`
- khu chọn nhân sự và chu kỳ đánh giá
- khu tạo chu kỳ và khởi tạo hồ sơ đánh giá
- khối thông tin hồ sơ đánh giá
- biểu đồ snapshot để nhìn nhanh tình trạng hồ sơ
- bảng tiêu chí đánh giá
- khối nhận xét và phê duyệt
- lịch sử dự án và lịch sử các kỳ đã đánh giá
- khối quản trị tài khoản nhân sự dành riêng cho admin

## 1.3 Cách sử dụng theo vai trò

### Admin

Admin dùng hệ thống để:

- tạo tài khoản và reset mật khẩu
- xem danh sách nhân sự toàn hệ thống
- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá cho từng nhân sự
- hỗ trợ mở khóa hồ sơ đã khóa
- phê duyệt cuối cùng hoặc khóa hồ sơ khi cần

Luồng thường dùng:

1. vào workspace
2. chọn nhân sự và chu kỳ
3. nếu chưa có chu kỳ thì tạo chu kỳ
4. nếu chưa có hồ sơ thì tạo hồ sơ đánh giá
5. theo dõi các bước submit, manager review, HR review
6. xử lý approve, lock hoặc unlock khi cần

### HR

HR dùng hệ thống để:

- theo dõi nhiều hồ sơ đánh giá ở cấp công ty hoặc liên phòng ban
- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá cho nhân sự trong phạm vi được nhìn thấy
- ghi nhận nhận xét HR
- thực hiện bước `hr_approve`
- khóa hồ sơ khi đã hoàn tất

### Manager

Manager dùng hệ thống để:

- chọn nhân sự thuộc phạm vi quản lý
- tạo hồ sơ đánh giá cho nhân sự của mình
- cập nhật hoặc bổ sung nhận xét quản lý
- thực hiện bước `manager_approve`
- trả hồ sơ về để nhân sự bổ sung khi cần

Manager không có quyền:

- xem toàn bộ danh sách tài khoản hệ thống qua `/api/users`
- mở khóa hồ sơ đã khóa
- quản trị tài khoản người dùng

### Employee

Employee dùng hệ thống để:

- xem hồ sơ đánh giá của chính mình
- cập nhật tiến độ, mô tả công việc, dự án, minh chứng
- gửi nhận xét cá nhân
- bấm `submit` để chuyển hồ sơ sang bước duyệt

Employee chỉ được sửa dữ liệu trong thời gian hiệu lực của chu kỳ. Nếu chu kỳ chưa đến hoặc đã hết hạn, hệ thống sẽ chặn cập nhật.

## 1.4 Quy trình thao tác khuyến nghị

### Tạo chu kỳ

1. Admin, HR hoặc Manager nhập tên chu kỳ
2. chọn loại chu kỳ `monthly`, `quarterly` hoặc `yearly`
3. chọn ngày neo bắt đầu
4. hệ thống tự căn lại `start_date` và `end_date`
5. lưu chu kỳ đánh giá

### Tạo hồ sơ đánh giá

1. chọn nhân sự
2. chọn chu kỳ
3. bấm tạo hồ sơ
4. hệ thống sinh sẵn ba tiêu chí mặc định:
   - `Project KPI`
   - `Work Quality`
   - `Discipline and Collaboration`

### Cập nhật hồ sơ

1. Employee cập nhật dữ liệu nghiệp vụ bằng tiếng Anh
2. bổ sung kế hoạch, thực đạt, mô tả, mã dự án, minh chứng
3. nếu cần, Manager hoặc HR thêm nhận xét và cập nhật ghi chú quản lý
4. hệ thống tính tổng hệ số, tổng điểm và xếp loại tự động

### Phê duyệt

Luồng trạng thái chuẩn:

- `draft`
- `employee_submitted`
- `manager_reviewed`
- `hr_reviewed`
- `approved`
- `locked`

Luồng bổ sung:

- `returned` để trả hồ sơ về bổ sung
- `unlock` chỉ dành cho admin

---

## PHẦN 2. PHÂN QUYỀN, CẤP BẬC, HẠN CHẾ VÀ CƠ CHẾ HOẠT ĐỘNG

## 2.1 Thứ bậc quyền hạn

Thứ tự quyền từ cao xuống thấp:

1. `admin`
2. `hr`
3. `manager`
4. `employee`

## 2.2 Phạm vi dữ liệu nhìn thấy

- `admin`: nhìn thấy toàn bộ user active không phải admin trong workspace, đồng thời có quyền quản trị user toàn hệ thống qua API `/api/users`
- `hr`: nhìn thấy tập nhân sự phục vụ quy trình đánh giá, nhưng không có quyền CRUD toàn bộ user như admin
- `manager`: nhìn thấy chính mình, nhân sự trực tiếp báo cáo, và nhân sự thuộc phòng ban do mình quản lý
- `employee`: chỉ nhìn thấy dữ liệu của chính mình

## 2.3 Cơ chế nhập liệu

Các trường dữ liệu nghiệp vụ mới đang được giữ theo dạng chuẩn tiếng Anh ở database để đảm bảo:

- seed không bị lệch giữa các môi trường
- dễ kiểm soát validation
- dễ mở rộng đa ngôn ngữ cho phần giao diện
- giảm rủi ro cùng một loại dữ liệu nhưng tồn tại nhiều cách viết khác nhau

Điều này áp dụng cho các trường như:

- tên tiêu chí
- tên dự án
- mô tả tiêu chí
- ghi chú minh chứng
- ghi chú phê duyệt

Tên riêng của nhân sự không bị ép chuyển sang tiếng Anh.

## 2.4 Cơ chế tính điểm

Hệ thống tính điểm theo các nguyên tắc:

- `total_weight` là tổng hệ số của các tiêu chí
- tổng hệ số hợp lệ phải lớn hơn `0` và không vượt quá `7`
- `achievement_score` được tính từ tỷ lệ `% actual / % plan`
- `weighted_score` dùng để tổng hợp điểm theo hệ số
- `rating_level` được chuẩn hóa theo dạng chuẩn tiếng Anh

Các mức xếp loại hiện hành:

- `excellent`
- `good`
- `meets_expectations`
- `needs_improvement`
- `does_not_meet_expectations`
- `not_rated`

## 2.5 Cơ chế khóa hồ sơ

- hồ sơ đã khóa sẽ hiện biểu tượng khóa màu đỏ
- item đã khóa không còn sửa được theo luồng thông thường
- `hr` hoặc `admin` có thể khóa hồ sơ
- chỉ `admin` mới có thể mở khóa hồ sơ đã khóa

## 2.6 Cơ chế chặn nghiệp vụ

Hệ thống chặn các trường hợp sau:

- employee sửa hồ sơ ngoài khung thời gian của chu kỳ
- submit khi còn thiếu dữ liệu bắt buộc
- submit khi tổng hệ số vượt quá `7`
- manager phê duyệt hồ sơ không thuộc phạm vi mình quản lý
- người không đủ quyền gọi action không tương ứng với role
- người không phải admin truy cập `/api/users`

---

## PHẦN 3. TỔNG THỂ WEB, ĐIỂM TỐT, NHƯỢC ĐIỂM VÀ KHẢ NĂNG ÁP DỤNG THỰC TẾ

## 3.1 Tổng thể web hiện tại

Website hiện được thiết kế theo hướng thực dụng cho môi trường nội bộ công ty:

- ít route
- ít thao tác chuyển trang
- tập trung một workspace chính
- load nhanh
- bảng dữ liệu nhìn rõ, dễ nhập
- có snapshot biểu đồ nhẹ để nhìn nhanh tình trạng hồ sơ

## 3.2 Điểm tối ưu

- luồng làm việc tập trung, nhân sự không bị rối bởi nhiều module
- không dùng chart library nặng cho snapshot đơn giản
- không dùng dark mode hoặc animation dư thừa
- quyền được chặn ở cả frontend và backend
- dữ liệu ngày dạng `DATE` đã được chuẩn hóa trả ra `YYYY-MM-DD`
- `rating_level` đã canonical hóa bằng tiếng Anh để giảm sai lệch dữ liệu

## 3.3 Điểm mạnh

- phù hợp quy trình đánh giá theo tháng, quý, năm
- có đủ vai trò `admin`, `hr`, `manager`, `employee`
- thể hiện rõ trạng thái hồ sơ và lịch sử phản hồi
- có thể triển khai nhanh cho nội bộ doanh nghiệp quy mô nhỏ đến vừa
- dễ đào tạo người dùng vì gần như chỉ cần dùng một màn hình chính

## 3.4 Nhược điểm hiện tại

- chưa có automated test đầy đủ
- backend vẫn còn giữ các API cũ như dashboard, objectives, kpis để tương thích, nên codebase chưa hoàn toàn tối giản ở lớp API
- một số tài liệu kỹ thuật cũ cần được giữ ở vai trò tham chiếu thay vì nguồn chuẩn
- nếu doanh nghiệp cần nội dung song ngữ cho dữ liệu nghiệp vụ ở mức field-level thì cần thiết kế schema song ngữ riêng trong tương lai

## 3.5 Khả năng áp dụng thực tế

Hệ thống phù hợp với doanh nghiệp có nhu cầu:

- đánh giá hiệu suất theo tháng, quý hoặc năm
- theo dõi hồ sơ nhân sự theo dự án
- tách rõ trách nhiệm nhập liệu, quản lý và phê duyệt
- muốn triển khai nhanh một web nội bộ để chuẩn hóa thao tác đánh giá

Để triển khai production tốt hơn, nên đi tiếp theo lộ trình:

1. bổ sung automated smoke test hoặc integration test cho các API chính
2. đồng bộ tài liệu vận hành cho môi trường VPS thật
3. chuẩn hóa thêm OpenAPI và `.env.example` nếu muốn onboarding nhanh cho đội kỹ thuật mới
4. cân nhắc thêm audit log chi tiết cho các thao tác HR và admin

