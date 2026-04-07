# TÀI LIỆU TỔNG HỢP HỆ THỐNG OKR/KPI HR

## Mục đích tài liệu

Tài liệu này là bản Markdown tổng hợp tương ứng với file Word chính của dự án. Nội dung phản ánh đúng trạng thái hệ thống hiện tại: một luồng đăng nhập chung, sau đó tách rõ thành hai không gian nghiệp vụ là `KPI` tại `/workspace` và `OKR` tại `/okr`.

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

Sau khi đăng nhập thành công, hệ thống chuyển đến `/workspace`. Từ đây người dùng có thể chuyển giữa `KPI` và `OKR` bằng tab điều hướng trên giao diện.

## 1.2 Bố cục hệ thống

Hệ thống hiện được tổ chức thành ba route chính:

- `/login`: đăng nhập
- `/workspace`: KPI và đánh giá hiệu suất nhân sự
- `/okr`: OKR basic để theo dõi mục tiêu và tiến độ

### KPI tại `/workspace`

KPI hiện được tổ chức thành các khối chính:

- khối tiêu đề hệ thống và chuyển ngôn ngữ `VI/EN`
- khu chọn nhân sự và chu kỳ đánh giá
- khu tạo chu kỳ và khởi tạo hồ sơ đánh giá
- khối thông tin hồ sơ đánh giá
- biểu đồ snapshot để nhìn nhanh tình trạng hồ sơ
- bảng tiêu chí đánh giá
- khối nhận xét và phê duyệt
- lịch sử dự án và lịch sử các kỳ đã đánh giá
- khối quản trị tài khoản nhân sự dành riêng cho admin

### OKR tại `/okr`

OKR hiện được tổ chức theo hướng basic và dễ tiếp cận:

- bộ lọc chu kỳ OKR và người phụ trách
- khối tổng quan nhanh
- danh sách objective
- key result hiển thị trong từng objective
- form tạo chu kỳ OKR
- form tạo objective
- form tạo key result
- form gửi check-in
- lịch sử check-in

## 1.3 Cách sử dụng theo vai trò

### Admin

Admin dùng hệ thống để:

- tạo tài khoản và reset mật khẩu
- xem danh sách nhân sự toàn hệ thống
- tạo chu kỳ KPI
- tạo hồ sơ đánh giá KPI cho từng nhân sự
- hỗ trợ mở khóa KPI đã khóa
- phê duyệt cuối cùng hoặc khóa KPI khi cần
- tạo chu kỳ OKR và theo dõi toàn bộ dữ liệu OKR

### HR

HR dùng hệ thống để:

- theo dõi nhiều hồ sơ KPI ở cấp công ty hoặc liên phòng ban
- tạo hồ sơ đánh giá KPI cho nhân sự trong phạm vi được nhìn thấy
- ghi nhận nhận xét HR
- thực hiện bước `hr_approve`
- khóa hồ sơ KPI khi đã hoàn tất
- xem và cập nhật dữ liệu OKR cơ bản

### Manager

Manager dùng hệ thống để:

- chọn nhân sự KPI thuộc phạm vi quản lý
- tạo hồ sơ KPI cho nhân sự của mình
- cập nhật hoặc bổ sung nhận xét quản lý
- thực hiện bước `manager_approve`
- trả hồ sơ KPI về để nhân sự bổ sung khi cần
- tạo chu kỳ OKR cơ bản
- tạo objective, key result và check-in trên trang OKR

Manager không có quyền:

- xem toàn bộ danh sách tài khoản hệ thống qua `/api/users`
- mở khóa hồ sơ KPI đã khóa
- quản trị tài khoản người dùng

### Employee

Employee dùng hệ thống để:

- xem KPI của chính mình
- cập nhật tiến độ, mô tả công việc, dự án, minh chứng ở KPI
- gửi nhận xét cá nhân trong KPI
- bấm `submit` để chuyển KPI sang bước duyệt
- xem objective / key result thuộc mình trên trang OKR
- gửi check-in tiến độ OKR trên dữ liệu thuộc mình

Employee chỉ được sửa KPI trong thời gian hiệu lực của chu kỳ. Nếu chu kỳ chưa đến hoặc đã hết hạn, hệ thống sẽ chặn cập nhật.

## 1.4 Quy trình thao tác khuyến nghị

### KPI

#### Tạo chu kỳ KPI

1. Admin, HR hoặc Manager nhập tên chu kỳ.
2. Chọn loại chu kỳ `monthly`, `quarterly` hoặc `yearly`.
3. Chọn ngày neo bắt đầu.
4. Hệ thống tự căn lại `start_date` và `end_date`.
5. Lưu chu kỳ đánh giá.

#### Tạo hồ sơ KPI

1. Chọn nhân sự.
2. Chọn chu kỳ.
3. Bấm tạo hồ sơ.
4. Hệ thống sinh sẵn các tiêu chí mặc định:
   - `Project KPI`
   - `Work Quality`
   - `Discipline and Collaboration`

#### Cập nhật KPI

1. Employee cập nhật dữ liệu nghiệp vụ bằng tiếng Anh.
2. Bổ sung kế hoạch, thực đạt, mô tả, mã dự án, minh chứng.
3. Nếu cần, Manager hoặc HR thêm nhận xét và cập nhật ghi chú quản lý.
4. Hệ thống tính tổng hệ số, tổng điểm và xếp loại tự động.

#### Phê duyệt KPI

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

### OKR

#### Tạo chu kỳ OKR

1. Mở tab `OKR`.
2. Nhập tên chu kỳ, ngày bắt đầu, ngày kết thúc và trạng thái.
3. Lưu chu kỳ OKR.

#### Tạo objective

1. Chọn chu kỳ OKR.
2. Chọn người phụ trách nếu role cho phép.
3. Nhập tiêu đề objective.
4. Nhập mô tả objective.
5. Chọn loại objective.
6. Chọn ngày đích.
7. Lưu objective.

#### Tạo key result

1. Chọn objective đang làm việc.
2. Nhập tiêu đề key result.
3. Nhập mô tả key result.
4. Nhập giá trị bắt đầu, hiện tại và mục tiêu.
5. Chọn đơn vị đo và hướng đo.
6. Lưu key result.

#### Gửi check-in OKR

1. Chọn key result.
2. Nhập giá trị sau cập nhật.
3. Chọn ngày check-in.
4. Nhập ghi chú cập nhật.
5. Nếu có, nhập vướng mắc hiện tại.
6. Lưu check-in.

---

## PHẦN 2. PHÂN QUYỀN, CẤP BẬC, HẠN CHẾ VÀ CƠ CHẾ HOẠT ĐỘNG

## 2.1 Thứ bậc quyền hạn

Thứ tự quyền từ cao xuống thấp:

1. `admin`
2. `hr`
3. `manager`
4. `employee`

## 2.2 Phạm vi dữ liệu nhìn thấy

### KPI tại `/workspace`

- `admin`: nhìn thấy toàn bộ user active không phải admin trong KPI workspace, đồng thời có quyền quản trị user toàn hệ thống qua API `/api/users`
- `hr`: nhìn thấy tập nhân sự phục vụ quy trình KPI, nhưng không có quyền CRUD toàn bộ user như admin
- `manager`: nhìn thấy chính mình, nhân sự trực tiếp báo cáo, và nhân sự thuộc phòng ban do mình quản lý
- `employee`: chỉ nhìn thấy dữ liệu KPI của chính mình

### OKR tại `/okr`

- `admin`: có thể nhìn toàn bộ dữ liệu OKR
- `hr`: có thể theo dõi và cập nhật dữ liệu OKR cơ bản
- `manager`: có thể vận hành trang OKR basic trong thực tế sử dụng nội bộ
- `employee`: chỉ nên thao tác check-in trên dữ liệu thuộc mình

## 2.3 Cơ chế nhập liệu

Các trường dữ liệu nghiệp vụ mới đang được giữ theo dạng chuẩn tiếng Anh ở database để đảm bảo:

- seed không bị lệch giữa các môi trường
- dễ kiểm soát validation
- dễ mở rộng đa ngôn ngữ cho phần giao diện
- giảm rủi ro cùng một loại dữ liệu nhưng tồn tại nhiều cách viết khác nhau

Điều này áp dụng cho các trường như:

- tên tiêu chí KPI
- tên dự án
- mô tả tiêu chí
- ghi chú minh chứng
- ghi chú phê duyệt
- title và description của objective / key result
- note và blocker note của check-in

Tên riêng của nhân sự không bị ép chuyển sang tiếng Anh.

## 2.4 Cơ chế tính điểm KPI

Hệ thống tính điểm KPI theo các nguyên tắc:

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

## 2.5 Cơ chế khóa dữ liệu KPI

- hồ sơ đã khóa sẽ hiện biểu tượng khóa màu đỏ
- item đã khóa không còn sửa được theo luồng thông thường
- `hr` hoặc `admin` có thể khóa hồ sơ KPI
- chỉ `admin` mới có thể mở khóa hồ sơ KPI đã khóa

## 2.6 Cơ chế chặn nghiệp vụ

Hệ thống chặn các trường hợp sau:

- employee sửa KPI ngoài khung thời gian của chu kỳ
- submit KPI khi còn thiếu dữ liệu bắt buộc
- submit KPI khi tổng hệ số vượt quá `7`
- manager phê duyệt KPI không thuộc phạm vi mình quản lý
- người không đủ quyền gọi action không tương ứng với role
- người không phải admin truy cập `/api/users`

Trang OKR hiện được thiết kế theo hướng basic, nên workflow đơn giản hơn KPI và không có luồng nhiều cấp tương tự.

---

## PHẦN 3. TỔNG THỂ WEB, ĐIỂM TỐT, NHƯỢC ĐIỂM VÀ KHẢ NĂNG ÁP DỤNG THỰC TẾ

## 3.1 Tổng thể web hiện tại

Website hiện được thiết kế theo hướng thực dụng cho môi trường nội bộ công ty:

- ít route
- ít thao tác chuyển trang
- KPI và OKR tách rõ nhưng vẫn dùng chung đăng nhập
- load nhanh
- bảng dữ liệu nhìn rõ, dễ nhập
- có snapshot KPI để nhìn nhanh tình trạng hồ sơ

## 3.2 Điểm tối ưu

- KPI và OKR được tách rõ đúng nghiệp vụ nhưng không làm hệ thống quá phức tạp
- không dùng chart library nặng cho snapshot đơn giản
- không dùng dark mode hoặc animation dư thừa
- quyền được chặn ở cả frontend và backend cho các luồng chính
- dữ liệu ngày dạng `DATE` đã được chuẩn hóa trả ra `YYYY-MM-DD`
- `rating_level` đã canonical hóa bằng tiếng Anh để giảm sai lệch dữ liệu

## 3.3 Điểm mạnh

- phù hợp quy trình đánh giá theo tháng, quý, năm
- có đủ vai trò `admin`, `hr`, `manager`, `employee`
- KPI đủ chặt để đánh giá hiệu suất theo kỳ
- OKR đủ basic để theo dõi mục tiêu và tiến độ
- dễ đào tạo người dùng vì giao diện không có quá nhiều module

## 3.4 Nhược điểm hiện tại

- chưa có automated test đầy đủ
- trang OKR hiện là bản basic, chưa phải một nền tảng OKR enterprise đầy đủ
- backend vẫn còn giữ các API cũ như dashboard để tương thích
- nếu doanh nghiệp cần nội dung song ngữ cho dữ liệu nghiệp vụ ở mức field-level thì cần thiết kế schema song ngữ riêng trong tương lai

## 3.5 Khả năng áp dụng thực tế

Hệ thống phù hợp với doanh nghiệp có nhu cầu:

- đánh giá hiệu suất nhân sự theo kỳ
- quản lý phê duyệt nhiều cấp trong KPI
- theo dõi mục tiêu và check-in OKR ở mức đủ dùng
- vận hành nội bộ với chi phí đào tạo thấp và thao tác đơn giản
