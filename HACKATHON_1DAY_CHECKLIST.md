# Checklist Day-1 De Day Di Thi (Tang Tu Kha -> Rat On)

Tai lieu nay dung de day diem nhanh trong 1 ngay truoc vong loai.
Muc tieu: toi uu G1..G7 + UI/UX + kich ban demo + Q&A.

## 1) Muc Tieu 24h

- Dong bo ban build moi nhat len VPS, khong con case "trong du lieu khi doi chu ky".
- Chot 1 kich ban demo 5 phut, ro vai tro va gia tri nghiep vu.
- Chay smoke test role-based truoc demo, khong cho loi vo san khau.
- Co 1 diem "wow nhe" bang storytelling + dashboard risk + workflow approve.

## 2) Viec Can Lam Theo Muc Uu Tien

### P0 - Bat Buoc (lam truoc)

1. Deploy ban moi + reseed:
   - `bash deploy/update_app.sh --seed`
2. Kiem tra health:
   - `curl http://127.0.0.1:8000/health`
3. Chay smoke test API:
   - `powershell -ExecutionPolicy Bypass -File tools/smoke_api.ps1`
4. Verify nhanh UI:
   - `/workspace`: doi nhan su, doi chu ky, khong bi trang/trong bat ngo.
   - `/okr`: tao objective, tao KR, check-in.

### P1 - Tang Diem UX/UI (2-3h)

1. Route fallback da duoc fix ve `/workspace`:
   - [frontend/src/routes/ProtectedRoute.jsx](c:/hackathon_OKR%20_KPI/frontend/src/routes/ProtectedRoute.jsx)
   - [frontend/src/pages/NotFoundPage.jsx](c:/hackathon_OKR%20_KPI/frontend/src/pages/NotFoundPage.jsx)
2. Khi chu ky chua co review, giao dien van hien thong tin nhan su:
   - [frontend/src/pages/WorkspacePage.jsx](c:/hackathon_OKR%20_KPI/frontend/src/pages/WorkspacePage.jsx)
3. Test tren 3 kich thuoc man hinh:
   - 1366x768, 1920x1080, mobile ngang.

### P2 - Tang "Wow Nhe" (1-2h, khong can them module lon)

1. Storytelling wow trong demo:
   - "Phat hien risk -> xu ly approve -> khoa ho so -> truy vet lich su"
2. Nhac manh workflow co thuc te:
   - role-based (Admin/Manager/HR/Employee)
   - buoc phe duyet co transition ro rang.
3. Show 2 view lien tuc:
   - KPI Workspace (workflow)
   - OKR Board (muc tieu + check-in)

## 3) Kich Ban Demo 5 Phut

### 0:00 - 0:40

- Dang nhap bang `ADM-001@company`.
- Noi 1 cau: he thong quan ly KPI + OKR cho doanh nghiep, role-based.

### 0:40 - 2:00

- Vao `/workspace`.
- Chon 1 nhan su, doi qua 2-3 chu ky de show du lieu lien tuc.
- Mo phan review status + snapshot + lich su.

### 2:00 - 3:10

- Thuc hien 1 action workflow:
  - submit / manager_approve / lock (tu role phu hop).
- Nhac rang buoc:
  - tong he so <= 7
  - employee chi sua du lieu cua minh trong cua so thoi gian.

### 3:10 - 4:20

- Chuyen sang `/okr`.
- Show objective -> key results -> check-in -> progress cap nhat.

### 4:20 - 5:00

- Chot gia tri:
  - giam sai sot quy trinh danh gia
  - minh bach phe duyet
  - co the mo rong AI sau vong loai.

## 4) Bo Cau Hoi Q&A Nhanh

1. "Tai sao khong bi trong du lieu khi doi chu ky?"
   - Vi du lieu seed da phu all periods cho non-admin + UI fallback khong de man hinh trang.
2. "Phan quyen co chat khong?"
   - Da chan theo role tren backend; manager/employee khong vuot scope.
3. "Neu loi truoc demo thi sao?"
   - Chay `tools/smoke_api.ps1` de check nhanh pass/fail.
4. "Scale duoc khong?"
   - Schema co index + views tong hop dashboard.
5. "AI o dau?"
   - Hien tap trung core workflow on dinh; AI la roadmap ke tiep (goi y check-in, tom tat review, canh bao risk).

## 5) Checklist Chot Truoc Gio Thi

- [ ] `git pull` dung commit moi nhat
- [ ] `bash deploy/update_app.sh --seed`
- [ ] Health check 200
- [ ] Smoke script pass all
- [ ] Demo account dang nhap duoc
- [ ] 2 route `/workspace` va `/okr` thao tac muot
- [ ] Team thong nhat 1 nguoi click, 1 nguoi thuyet trinh, 1 nguoi Q&A

## 6) Lenh Su Dung Nhanh

- Reseed local:
  - `cd backend && npm.cmd run seed`
- Build frontend:
  - `cd frontend && npm.cmd run build`
- Smoke API:
  - `powershell -ExecutionPolicy Bypass -File tools/smoke_api.ps1`
