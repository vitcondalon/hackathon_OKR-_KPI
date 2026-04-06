# TÀI LIỆU HƯỚNG DẪN CHI TIẾT HỆ THỐNG OKR/KPI HR

## 1. Mục đích tài liệu

Tài liệu này được viết cho người mới tiếp nhận hệ thống, kể cả khi chưa biết gì về sản phẩm trước đó.

Mục tiêu của tài liệu:

- giúp hiểu hệ thống đang dùng để làm gì
- giúp hiểu từng vai trò được làm gì và không được làm gì
- giúp hiểu từng khu trên giao diện và từng trường dữ liệu quan trọng
- giúp hiểu cách hồ sơ đi từ lúc tạo đến lúc khóa
- giúp hiểu các điểm mạnh, giới hạn và lưu ý vận hành thực tế

Tài liệu này là bản chi tiết hơn so với bộ tài liệu tổng hợp hiện có và đóng vai trò như cẩm nang bàn giao.

## 2. Hệ thống này dùng để làm gì

Đây là hệ thống đánh giá hiệu suất nhân sự theo chu kỳ.

Hệ thống hỗ trợ doanh nghiệp:

- tạo chu kỳ đánh giá theo tháng, quý hoặc năm
- tạo hồ sơ đánh giá cho từng nhân sự
- cập nhật tiêu chí, kế hoạch, thực đạt và minh chứng
- ghi nhận nhận xét của nhân viên, quản lý và nhân sự
- phê duyệt hồ sơ theo nhiều cấp
- khóa hồ sơ để chốt dữ liệu sau khi hoàn tất
- lưu lịch sử đánh giá và lịch sử dự án của nhân sự

Nói ngắn gọn, đây là nơi tập trung để theo dõi một hồ sơ đánh giá hiệu suất trọn vẹn, từ lúc mở hồ sơ đến lúc chốt hồ sơ.

## 3. Triết lý thiết kế hiện tại

Hệ thống hiện được tối giản về một màn hình làm việc chính để tránh rối cho người dùng nội bộ.

Hiện trạng frontend:

- người dùng đăng nhập tại `/login`
- sau đó thao tác chủ yếu tại `/workspace`
- giao diện ưu tiên tốc độ, độ rõ ràng và ít bước bấm
- không dùng dark mode trong luồng chính
- không dùng trợ lý AI trong luồng chính

Mục tiêu của cách thiết kế này là:

- nhân viên dễ dùng
- quản lý dễ duyệt
- HR dễ kiểm soát
- admin dễ xử lý ngoại lệ

## 4. Các vai trò trong hệ thống

Hệ thống hiện có 4 vai trò:

1. `admin`
2. `hr`
3. `manager`
4. `employee`

### 4.1 Admin

Đây là quyền cao nhất của hệ thống.

Admin có thể:

- tạo tài khoản người dùng
- đổi hoặc reset mật khẩu
- xem danh sách user toàn hệ thống
- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá
- xem và điều phối quy trình duyệt
- phê duyệt cuối cùng
- khóa hồ sơ
- mở khóa hồ sơ đã khóa

Admin là lớp quyền cuối cùng để xử lý các trường hợp ngoại lệ.

### 4.2 HR

HR là vai trò điều phối và phê duyệt ở cấp nhân sự.

HR có thể:

- tạo chu kỳ đánh giá
- tạo hồ sơ đánh giá
- theo dõi nhiều hồ sơ ở cấp công ty hoặc liên phòng ban
- thêm nhận xét ở vai trò HR
- thực hiện `hr_approve`
- thực hiện `approve`
- khóa hồ sơ

HR không có quyền:

- quản trị toàn bộ tài khoản user như admin
- mở khóa hồ sơ đã khóa

### 4.3 Manager

Manager là người quản lý trực tiếp nhân sự hoặc phòng ban.

Manager có thể:

- xem nhân sự thuộc phạm vi phụ trách
- tạo hồ sơ đánh giá cho nhân sự trong phạm vi đó
- chỉnh sửa những phần được phép trong tiêu chí
- thêm nhận xét quản lý
- thực hiện `manager_approve`
- trả hồ sơ về để bổ sung bằng `return`

Manager không có quyền:

- xem toàn bộ user toàn hệ thống qua `/api/users`
- mở khóa hồ sơ đã khóa
- thực hiện `hr_approve`
- thực hiện mở khóa cuối cùng

### 4.4 Employee

Employee là người được đánh giá.

Employee có thể:

- xem hồ sơ đánh giá của chính mình
- cập nhật dữ liệu công việc trong thời gian hiệu lực
- bổ sung mô tả, tiến độ, minh chứng, mã dự án
- gửi nhận xét cá nhân
- bấm `submit` để chuyển hồ sơ sang bước duyệt

Employee không có quyền:

- tạo chu kỳ
- tạo hồ sơ đánh giá
- đổi trọng số hoặc tiêu chí gốc
- duyệt hồ sơ của người khác

## 5. Phạm vi dữ liệu mà mỗi vai trò nhìn thấy

### Admin

- nhìn thấy toàn bộ nhân sự đang hoạt động trong workspace
- có quyền quản trị user toàn hệ thống

### HR

- nhìn thấy tập nhân sự phục vụ quy trình đánh giá
- không có trang quản trị user đầy đủ như admin

### Manager

- nhìn thấy chính mình
- nhìn thấy nhân sự trực tiếp báo cáo cho mình
- nhìn thấy nhân sự thuộc phòng ban do mình quản lý

### Employee

- chỉ nhìn thấy hồ sơ của bản thân

## 6. Luồng sử dụng tổng quát

Một vòng đời hồ sơ thường diễn ra như sau:

1. Admin, HR hoặc Manager tạo chu kỳ đánh giá
2. Admin, HR hoặc Manager tạo hồ sơ đánh giá cho nhân sự
3. Hệ thống sinh sẵn các tiêu chí mặc định
4. Employee cập nhật dữ liệu công việc
5. Employee gửi hồ sơ bằng `submit`
6. Manager xem và phê duyệt bằng `manager_approve`, hoặc trả về bằng `return`
7. HR xem và phê duyệt bằng `hr_approve`
8. HR hoặc Admin thực hiện `approve` để chốt nội dung
9. HR hoặc Admin thực hiện `lock` để khóa hồ sơ
10. Nếu cần chỉnh lại hồ sơ đã khóa, chỉ Admin mới có thể `unlock`

## 7. Trạng thái hồ sơ

Các trạng thái chính:

- `draft`: hồ sơ đang nhập liệu
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

## 8. Các khu chính trên giao diện

## 8.1 Trang đăng nhập

Trang đăng nhập có các thành phần:

- phần giới thiệu hệ thống
- mô tả vai trò `Admin`, `Manager`, `Employee`
- nút đổi ngôn ngữ `VI/EN`
- ô nhập định danh đăng nhập
- ô nhập mật khẩu
- nút truy cập hệ thống
- gợi ý tài khoản mẫu

Định danh đăng nhập có thể là:

- mã nhân viên
- mã nhân viên kèm `@company`
- email hệ thống
- username

## 8.2 Khu chọn nhân sự và chu kỳ đánh giá

Đây là nơi người dùng chọn dữ liệu đang làm việc.

Các thành phần:

- ô tìm nhân sự theo mã hoặc tên
- danh sách chọn nhân sự
- danh sách chọn chu kỳ đánh giá
- khu hiển thị trạng thái hồ sơ
- ngày hệ thống

Ý nghĩa:

- nếu chọn nhân sự khác thì toàn bộ phần bên dưới sẽ đổi theo nhân sự đó
- nếu chọn chu kỳ khác thì hồ sơ tương ứng cũng đổi theo chu kỳ đó

## 8.3 Khu thiết lập chu kỳ đánh giá

Khu này dành cho `admin`, `hr`, `manager`.

Các trường:

- `Tên chu kỳ`
- `Loại chu kỳ`
- `Ngày bắt đầu`
- `Ngày kết thúc`

Giải thích:

- `Tên chu kỳ`: tên dễ đọc của kỳ đánh giá, ví dụ `Quý 2 / 2026`
- `Loại chu kỳ`: `monthly`, `quarterly`, `yearly`
- `Ngày bắt đầu`: ngày neo để hệ thống tính lại khoảng thời gian
- `Ngày kết thúc`: được hệ thống tự động căn theo loại chu kỳ

Ví dụ:

- chọn `quarterly` và ngày bắt đầu rơi vào tháng 4
- hệ thống sẽ tự căn chu kỳ thành từ `2026-04-01` đến `2026-06-30`

## 8.4 Khu thông tin hồ sơ đánh giá

Đây là khối tóm tắt để người xem biết mình đang đánh giá ai và trong kỳ nào.

Các thông tin thường hiển thị:

- trưởng bộ phận
- phòng ban
- nhân sự được đánh giá
- mã nhân viên
- thời gian áp dụng
- khung thời gian cập nhật
- thời điểm cập nhật gần nhất
- tổng điểm
- tổng hệ số
- xếp loại
- trạng thái hồ sơ

Giải thích nhanh:

- `Thời gian áp dụng`: khoảng ngày của chu kỳ đánh giá
- `Khung thời gian cập nhật`: cho biết hiện có còn trong thời gian được sửa không
- `Tổng điểm`: điểm trung bình có trọng số
- `Tổng hệ số`: tổng hệ số của các tiêu chí, tối đa là `7`
- `Xếp loại`: mức đánh giá tổng thể như `good`, `excellent`

## 8.5 Biểu đồ snapshot

Khối này giúp nhìn nhanh tình trạng hồ sơ mà không cần đọc toàn bộ bảng.

Những gì thường hiển thị:

- điểm hiệu suất tổng
- số tiêu chí đang mở
- số tiêu chí đã khóa
- thanh tiến độ theo từng tiêu chí

Mục đích:

- quản lý nhìn nhanh tiêu chí nào đang thấp
- HR nhìn nhanh hồ sơ nào đã gần hoàn thiện
- nhân viên nhìn nhanh mình đang ở mức nào

## 8.6 Bảng chi tiết tiêu chí đánh giá

Đây là phần quan trọng nhất của hồ sơ.

Mỗi dòng là một tiêu chí đánh giá.

Các cột hiện có:

1. `STT`
2. `Tiêu chí`
3. `Mô tả`
4. `Dự án`
5. `Hệ số`
6. `% Kế hoạch`
7. `% Thực đạt`
8. `Điểm`
9. `Cập nhật gần nhất`
10. `Khóa`
11. `Lưu`

### Giải thích từng cột

#### `STT`

Là số thứ tự của tiêu chí trong hồ sơ.

#### `Tiêu chí`

Là tên ngắn của hạng mục đang được đánh giá.

Ví dụ:

- `Project KPI`
- `Work Quality`
- `Discipline and Collaboration`
- `Improvement Initiative`

Người được sửa:

- `admin`, `hr`, `manager`
- `employee` không được đổi tên tiêu chí gốc

#### `Mô tả`

Là phần mô tả chi tiết công việc hoặc kết quả đạt được cho tiêu chí đó.

Ví dụ:

- đã hoàn thành nâng cấp API
- duy trì phối hợp đúng hạn với QA
- đề xuất cải tiến quy trình review code

Người được sửa:

- `employee` được sửa trong hồ sơ của mình
- `manager`, `hr`, `admin` cũng có thể sửa

#### `Dự án`

Hiện tại trên UI, cột này đang phục vụ chủ yếu cho `mã dự án`.

Ở backend, dòng tiêu chí có hai trường:

- `project_code`
- `project_name`

Nhưng trong workspace hiện tại, ô đang hiển thị giống một ô nhập `mã dự án`.

Ví dụ:

- `PRJ-API-01`
- `CRM-SALES-Q2`
- `ERP-MIG-02`

### Giải thích rất quan trọng về `mã dự án`

`Mã dự án` là mã nhận diện ngắn của dự án hoặc đầu việc gắn với tiêu chí đó.

Mục đích của `mã dự án`:

- giúp biết tiêu chí này thuộc dự án nào
- giúp tra cứu nhanh giữa nhiều kỳ và nhiều nhân sự
- giúp đối chiếu với lịch sử dự án của nhân sự
- giúp thống kê hoặc tổng hợp theo nhóm dự án về sau

Ai đặt `mã dự án`:

- hiện tại hệ thống không tự sinh mã dự án
- đây là trường nhập thủ công
- `admin`, `hr`, `manager` có thể nhập
- `employee` cũng có thể cập nhật trong hồ sơ của mình khi kỳ còn mở

Vì sao có dòng có mã, có dòng không:

- trường này hiện không bắt buộc
- tiêu chí nào gắn với một dự án thật thì nên điền
- tiêu chí mang tính chung như kỷ luật, phối hợp, sáng kiến cá nhân có thể để trống

Ví dụ:

- `Project KPI` có thể có mã `PRJ-API-01`
- `Discipline and Collaboration` có thể không cần mã dự án
- `Improvement Initiative` có thể để trống nếu đó là sáng kiến nội bộ không gắn project chính thức

Khuyến nghị vận hành:

- nếu công ty có quy ước mã dự án nội bộ thì nên dùng thống nhất
- nếu chưa có quy ước thì nên giao `manager` hoặc `admin` đặt mã
- nếu muốn chặt hơn trong tương lai, nên chuyển sang mô hình chọn từ danh sách `projects` có sẵn

#### `Hệ số`

Là độ quan trọng của tiêu chí trong tổng đánh giá.

Ví dụ:

- tiêu chí quan trọng có thể là `3`
- tiêu chí phụ có thể là `1` hoặc `2`

Nguyên tắc:

- tổng hệ số toàn bộ hồ sơ phải lớn hơn `0`
- tổng hệ số không được vượt quá `7`

Người được sửa:

- `admin`, `hr`, `manager`
- `employee` không được sửa hệ số

#### `% Kế hoạch`

Là mức mục tiêu dự kiến cho tiêu chí.

Thông thường hệ thống dùng thang `0` đến `100`.

Ví dụ:

- kế hoạch là `100`
- tức là kỳ vọng hoàn thành đủ mức mục tiêu

#### `% Thực đạt`

Là mức thực tế đạt được tại thời điểm đánh giá.

Ví dụ:

- kế hoạch `100`
- thực đạt `86`
- nghĩa là nhân sự đang đạt 86% so với mục tiêu dự kiến

Người được sửa:

- `employee` có thể cập nhật cho hồ sơ của mình
- `manager`, `hr`, `admin` cũng có thể chỉnh khi cần

#### `Điểm`

Là điểm tính tự động từ dữ liệu kế hoạch và thực đạt.

Về bản chất:

- hệ thống tính tỷ lệ đạt được
- sau đó nhân với hệ số để ra phần đóng góp vào tổng điểm

Người dùng không nhập trực tiếp cột này.

#### `Cập nhật gần nhất`

Cho biết tiêu chí được sửa lần cuối lúc nào.

Nếu mục đã khóa thì còn hiển thị thêm thời điểm khóa.

Ý nghĩa:

- giúp biết dòng nào vừa được cập nhật
- giúp audit lại quá trình chỉnh sửa

#### `Khóa`

Cho biết tiêu chí đó có đang bị khóa hay không.

Hai lớp khóa cần phân biệt:

1. khóa từng tiêu chí
2. khóa toàn bộ hồ sơ

Khóa từng tiêu chí:

- có thể bật trong dòng tiêu chí
- hiện tại `admin`, `hr`, `manager` có thể thay đổi cờ khóa cho từng dòng

Khóa toàn bộ hồ sơ:

- được thực hiện qua action `lock`
- chỉ `hr` hoặc `admin` mới thực hiện

Khi một dòng bị khóa:

- người dùng thông thường không sửa được dòng đó nữa
- trên giao diện sẽ hiện biểu tượng khóa màu đỏ

#### `Lưu`

Là nút ghi lại thay đổi của từng dòng.

Ý nghĩa:

- mỗi dòng lưu độc lập
- không cần đợi lưu toàn bảng mới cập nhật

## 8.7 Khu thêm tiêu chí mới

Bên dưới bảng có khu thêm tiêu chí mới.

Các ô thường có:

- tên tiêu chí mới
- hệ số
- mô tả ngắn

Người có thể thêm:

- `admin`
- `hr`
- `manager`

`employee` không phải người thêm tiêu chí quản trị mới.

## 8.8 Khu nhận xét và phê duyệt

Khu này gồm hai phần chính:

1. lịch sử phản hồi
2. thao tác phê duyệt

### Lịch sử phản hồi

Đây là nơi lưu toàn bộ nhận xét theo thứ tự thời gian.

Các loại nhận xét có thể gồm:

- nhận xét của nhân viên
- nhận xét của quản lý
- nhận xét của HR
- kết luận cuối cùng

Mục đích:

- theo dõi quá trình trao đổi
- minh bạch nội dung phê duyệt
- phục vụ audit sau này

### Thao tác phê duyệt

Các nút hành động hiển thị tùy theo vai trò và trạng thái hồ sơ.

Ví dụ:

- `submit`
- `manager_approve`
- `hr_approve`
- `approve`
- `return`
- `lock`
- `unlock`

Ý nghĩa từng hành động:

- `submit`: nhân viên gửi hồ sơ để duyệt
- `manager_approve`: quản lý duyệt bước quản lý
- `hr_approve`: HR duyệt bước nhân sự
- `approve`: chốt hồ sơ ở bước cuối
- `return`: trả hồ sơ về để bổ sung
- `lock`: khóa hồ sơ
- `unlock`: mở khóa hồ sơ

## 8.9 Khu lịch sử công tác và đánh giá

Khu này giúp người xem hiểu bối cảnh quá khứ của nhân sự.

Bao gồm:

- lịch sử dự án đã tham gia
- lịch sử các kỳ đã được đánh giá

Mục đích:

- nhìn lại thành tích cũ
- đối chiếu tiến độ qua nhiều kỳ
- thấy nhân sự từng tham gia những dự án nào

## 8.10 Khu quản trị tài khoản nhân sự

Khối này chỉ dành cho `admin`.

Chức năng chính:

- xem danh sách user
- tạo tài khoản mới
- reset hoặc đổi mật khẩu
- chỉnh role
- chỉnh phòng ban
- chỉnh trạng thái active

Đây là phần quản trị user trực tiếp trong workspace.

## 9. Những trường dữ liệu quan trọng cần hiểu

Ngoài `mã dự án`, các trường sau cũng rất quan trọng:

### 9.1 `plan_percent`

Mức kế hoạch dự kiến cho tiêu chí.

### 9.2 `actual_percent`

Mức thực đạt hiện tại của tiêu chí.

### 9.3 `achievement_score`

Điểm đạt được từ so sánh kế hoạch và thực đạt.

### 9.4 `weighted_score`

Điểm sau khi nhân theo hệ số.

### 9.5 `rating_level`

Mức xếp loại tổng thể của hồ sơ.

Các mã hiện hành:

- `excellent`
- `good`
- `meets_expectations`
- `needs_improvement`
- `does_not_meet_expectations`
- `not_rated`

## 10. Những gì employee được sửa và không được sửa

Employee hiện chỉ được sửa những trường nghiệp vụ sau trong dòng tiêu chí:

- `project_code`
- `project_name`
- `description`
- `plan_percent`
- `actual_percent`
- `evidence_note`

Employee không được sửa:

- `category`
- `weight`
- `manager_note`
- `is_required`
- `is_locked`

Điều này rất quan trọng khi bàn giao hệ thống, vì nó giải thích tại sao giao diện của employee có những ô sửa được và những ô bị khóa.

## 11. Quy tắc chặn nghiệp vụ quan trọng

### 11.1 Chặn theo thời gian

Employee chỉ được sửa hồ sơ khi ngày hiện tại nằm trong khoảng:

- `start_date`
- `end_date`

Nếu chưa đến kỳ hoặc đã quá kỳ:

- hệ thống chặn chỉnh sửa
- employee phải liên hệ `manager`, `hr` hoặc `admin`

### 11.2 Chặn khi submit

Trước khi `submit`, hệ thống sẽ kiểm tra:

- các trường bắt buộc đã đủ chưa
- tổng hệ số có hợp lệ không

Nếu thiếu dữ liệu:

- hệ thống báo lỗi rõ theo từng tiêu chí còn thiếu

### 11.3 Chặn theo phạm vi quyền

Ví dụ:

- manager không thể duyệt hồ sơ không thuộc mình
- employee không thể gửi duyệt hồ sơ của người khác
- non-admin không thể mở khóa hồ sơ
- manager không thể đọc `/api/users`

## 12. Dữ liệu nghiệp vụ mới vì sao phải giữ bằng tiếng Anh

Hệ thống hiện đang thống nhất dữ liệu nghiệp vụ mới theo dạng chuẩn tiếng Anh.

Mục đích:

- tránh cùng một loại dữ liệu nhưng mỗi người nhập một kiểu
- dễ seed dữ liệu giữa local và VPS
- dễ chuẩn hóa báo cáo
- dễ mở rộng đa ngôn ngữ cho giao diện

Điều này áp dụng cho:

- tiêu chí
- mô tả nghiệp vụ
- mã dự án
- tên dự án
- ghi chú minh chứng
- ghi chú phê duyệt

Tên riêng của con người thì không ép đổi sang tiếng Anh.

## 13. Điểm mạnh của hệ thống hiện tại

- giao diện tập trung, ít rối
- nhân viên chỉ cần học một màn hình chính
- quyền được chặn ở cả frontend và backend
- lịch sử phản hồi rõ ràng
- có cơ chế khóa hồ sơ
- có lịch sử dự án và lịch sử đánh giá
- có thể triển khai thực tế cho doanh nghiệp nhỏ và vừa

## 14. Hạn chế hiện tại

- chưa có bộ automated test đầy đủ
- backend vẫn còn giữ các API cũ để tương thích
- cột `Dự án` trên giao diện hiện đang thiên về nhập `mã dự án`, chưa hiển thị tách bạch `tên dự án`
- `mã dự án` hiện vẫn là trường nhập tự do, chưa chọn từ master project

## 15. Khuyến nghị nếu muốn nâng cấp sau này

1. tách riêng `Mã dự án` và `Tên dự án` trên giao diện
2. chỉ cho chọn từ danh sách `projects` có sẵn
3. quy định rõ ai được tạo mã dự án
4. thêm audit log hiển thị rõ ai sửa dòng nào
5. bổ sung automated smoke test cho các API chính

## 16. Kết luận

Nếu một người mới tiếp nhận hệ thống cần hiểu nhanh nhất, hãy nhớ 5 ý sau:

1. hệ thống vận hành chủ yếu trên `/workspace`
2. hồ sơ đánh giá đi theo chuỗi `draft -> submit -> manager -> hr -> approve -> lock`
3. employee chỉ sửa phần dữ liệu công việc của chính mình trong thời gian hợp lệ
4. `mã dự án` hiện là trường nhập tay, không phải mã hệ thống tự sinh
5. admin là người duy nhất có quyền mở khóa hồ sơ đã khóa

## 17. Tài liệu liên quan

- tài liệu tổng hợp: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI.md)
- tài liệu Word chính hiện có: [TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx](./TAI_LIEU_TONG_HOP_HE_THONG_OKR_KPI_BAN_DEP.docx)
- tài liệu phân quyền: [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)
- hướng dẫn sử dụng ngắn: [USER_GUIDE.md](./USER_GUIDE.md)
- hướng dẫn triển khai: [DEPLOYMENT.md](./DEPLOYMENT.md)
