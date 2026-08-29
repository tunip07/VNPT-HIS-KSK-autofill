# HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG CHROME EXTENSION AUTO-FILL VNPT HIS

Extension giúp bạn tự động hóa 100% việc nhập liệu **Tiếp nhận ngoại trú** và **Khám sức khỏe học sinh TT25** trực tiếp trên Google Chrome mà không cần chạy bất kỳ lệnh terminal hay cài đặt môi trường Python.

---

## 🚀 1. CÁCH CÀI ĐẶT EXTENSION VÀO GOOGLE CHROME (CHỈ LÀM 1 LẦN)

1. Mở **Google Chrome** bình thường (hoặc truy cập đường dẫn: `chrome://extensions/` trên thanh địa chỉ).
2. Ở góc trên cùng bên phải, **BẬT công tắc "Developer mode" (Chế độ dành cho nhà phát triển)**.
3. Bấm vào nút **"Load unpacked" (Tải tiện ích đã giải nén)** ở góc trên bên trái.
4. Chọn thư mục `extension` trên máy tính của bạn:
   👉 Đường dẫn: `C:\Users\Adam\Documents\AI\extension`
5. Tiện ích **"VNPT HIS Auto-Fill KSK"** sẽ xuất hiện ngay lập tức trên thanh công cụ của Chrome!

---

## ⚙️ 2. THIẾT LẬP THÔNG SỐ MẶC ĐỊNH (SETTINGS - LƯU 1 LẦN DUY NHẤT)

Khi bạn mở trang web VNPT HIS (`https://yte-caobang.vnpthis.vn/...`), bạn sẽ thấy **Bảng điều khiển nổi ⚡ Auto-Fill KSK** ở góc dưới bên phải màn hình:

1. Bấm sang tab **⚙️ Cài đặt**.
2. Kiểm tra hoặc thay đổi các thông số mặc định của đơn vị bạn:
   * **Phòng khám:** `3` | `PHÒNG KHÁM SỨC KHOẺ`
   * **Dịch vụ:** `1223` | `Khám kiểm tra sức khỏe [dưới 18 tuổi]`
   * **Đối tượng KSK:** `Học sinh trong các cơ sở giáo dục phổ thông`
   * **Nguồn chi trả:** `Khác`
   * **Lý do khám:** `khám sức khỏe định kì`
   * **Bác sĩ ưu tiên gợi ý:** `Nông Thị Luyến` (hoặc tên Bác sĩ phụ trách chính của bạn)
3. Bấm nút **`[💾 Lưu Cài Đặt]`**. Dữ liệu này sẽ được lưu cố định trong Chrome và tự động áp dụng cho mọi ca khám sau này.

---

## 📋 3. QUY TRÌNH SỬ DỤNG HÀNG NGÀY (DÁN JSON & 1-CLICK FILL)

Mỗi khi có dữ liệu hồ sơ mới từ OCR Gemini:

### Bước 1: Tiếp nhận bệnh nhân
1. Tại Tab **Tiếp nhận ngoại trú**, mở bảng điều khiển (góc phải dưới).
2. **Dán chuỗi JSON** vào ô `Dán mã JSON OCR bệnh nhân`.
   *(Bảng điều khiển sẽ lập tức hiển thị thẻ thông tin: Họ tên, CCCD, Ngày sinh, Dân tộc).*
3. Bấm nút **`[1️⃣ Tiếp nhận]`**.
   * Tool sẽ tự động: Bấm Thêm ➔ Nhập CCCD ➔ Enter 2 lần ➔ Đợi 3.5s BHYT tải về ➔ Sửa Dân tộc đúng theo JSON ➔ Chọn Phường/Xã CV30 ➔ Điền Địa chỉ, Bố mẹ, Phòng khám & Dịch vụ.
4. Bạn kiểm tra lại trên màn hình và **tự bấm nút `[LƯU]`** Tiếp nhận.

---

### Bước 2: Khám bệnh ngoại trú (Phiếu KSK TT25)
1. Chuyển sang Tab **Khám bệnh ngoại trú** trên VNPT HIS.
2. Chọn bệnh nhân vừa tiếp nhận và bấm nút **`[Khám]`**.
3. Mở bảng điều khiển tiện ích:
   * Danh sách Bác sĩ từ trạm y tế sẽ tự động hiển thị trong menu chọn. Bạn chọn Bác sĩ phụ trách ca khám (hoặc để mặc định).
4. Bấm nút **`[2️⃣ Khám TT25]`**.
   * Tool sẽ tự động: Mở modal KSK theo đối tượng ➔ Điền trọn vẹn 4 Tab TT25 (Tiêm chủng động Có/Không/Không nhớ, Tiền sử bẩm sinh, Thể lực, Lâm sàng, Mắt, TMH, RHM, Kết luận) ➔ Tự động gán Bác sĩ đã chọn vào toàn bộ các chuyên khoa trên phiếu.
5. Bạn kiểm tra mắt trên phiếu và **tự bấm nút `[LƯU]`** trên phiếu khám.

---

🎉 **Hoàn thành trọn vẹn hồ sơ chỉ trong vài giây!**
