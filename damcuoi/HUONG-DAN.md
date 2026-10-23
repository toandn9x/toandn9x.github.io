# Thiệp cưới online: hướng dẫn sử dụng

Trang thiệp tĩnh, chạy miễn phí trên Cloudflare Pages. Mỗi khách nhận một link riêng có tên mình:

```
https://damcuoitoi.pages.dev/?name=Chị Tuyền
```

Khách mở link sẽ thấy phong bì đỏ ghi **"Kính gửi Chị Tuyền"**, bấm mở thì thiệp trượt ra, nhạc nền phát, rồi vào trang cưới.

---

## 1. Trong thư mục có gì

| File / thư mục | Dùng để |
|---|---|
| `config.js` | **Toàn bộ thông tin đám cưới, và là file duy nhất bạn cần sửa.** |
| `index.html` | Khung trang. Không cần sửa. |
| `photos/` | Ảnh cưới của bạn. |
| `assets/css/themes/songhy.css` | Giao diện "Song Hỷ" (đỏ son, vàng kim). |
| `assets/css/main.css`, `assets/js/` | Bố cục và chức năng. Không cần sửa. |
| `_worker.js`, `_routes.json` | Chạy trên Cloudflare: đưa tên khách vào ảnh xem trước trên Zalo/Messenger, giúp iPhone phát nhạc. |
| `extras/google-apps-script.gs` | Đoạn mã lưu xác nhận tham dự vào Google Sheets (mục 4). |

## 2. Sửa thông tin

### 2.1. `config.js`
Mở bằng Notepad, VS Code hoặc trình soạn thảo bất kỳ. Sửa phần chữ trong dấu nháy `'...'`, **giữ nguyên dấu nháy và dấu phẩy cuối dòng**.

- `groom` / `bride`: tên gọi, họ tên đầy đủ, vai trong nhà (Trưởng nam, Thứ nữ...), bố mẹ, quê, ảnh chân dung, vài dòng giới thiệu.
- `date`: giờ tiệc chính, dạng `'2026-12-20T11:00'`. Ngày Âm lịch, thứ trong tuần, lịch tháng và đếm ngược **tự tính** từ đây.
- `events`: các lễ (Vu Quy, Thành Hôn, Tiệc...). Lễ có `main: true` sẽ hiện bản đồ.
- `story`: chuyện tình. Xoá hết các dòng bên trong `[ ]` thì phần này tự ẩn.
- `gallery`: danh sách ảnh album.
- `gifts`: tài khoản mừng cưới. `bank` là mã ngân hàng VietQR (VCB, MB, TCB, ACB, BIDV, ICB, VPB, TPB...). **Số tài khoản hiện tại là số giả, nhớ thay.**
- `music`: nhạc nền. Muốn dùng bài khác thì chép file `.mp3` vào `assets/music/` rồi sửa `src`, sửa luôn dòng `credit`.
- `effect`: `'petals'` (cánh hoa rơi), `'hearts'` (tim rơi) hoặc `'none'` (tắt).
- `invitation`, `texts`: câu mời, câu ở hộp mừng cưới, lời cảm ơn cuối trang. Viết `{xung}` để tự thay bằng cách xưng hô với khách (chị, anh, cả nhà...), viết `{khach}` để thay bằng tên khách.
- `share`: chữ và ảnh khi gửi link qua Zalo / Messenger (mục 2.3).
- `photoCredit`: dòng ghi nguồn ảnh ở chân trang. Dùng ảnh của bạn thì để `''`.

### 2.2. Ảnh
Chép ảnh vào `photos/`, rồi ghi đường dẫn trong `config.js`, ví dụ `cover: 'photos/bia.jpg'`. Xem thêm mẹo trong `photos/DAT-ANH-VAO-DAY.txt`.

Ảnh mẫu hiện tại lấy từ Unsplash (miễn phí). Đó là ảnh của người khác, nên bạn cần thay bằng ảnh của mình trước khi gửi khách.

### 2.3. Chữ và ảnh khi gửi link qua Zalo / Messenger
Bạn **không phải sửa gì thêm**. Khi trang chạy trên Cloudflare, `_worker.js` tự đọc `config.js` và ghép ô xem trước:

- **Tiêu đề:** Kính gửi Chị Tuyền · Thiệp mời cưới · Minh Quân & Thu Hà
- **Mô tả:** Chủ nhật, 20.12.2026 · Trung tâm Hội nghị Tiệc cưới Hoàng Gia. Trân trọng kính mời Chị Tuyền tới chung vui…
- **Ảnh:** lấy `share.image` (nếu để trống thì lấy ảnh bìa `cover`)

Muốn tự viết câu khác thì điền `share.title` / `share.description` trong `config.js`.
Ảnh xem trước nên là ảnh ngang, khoảng 1200×630. Ghi `photos/og.jpg` là đủ, worker tự đổi thành link đầy đủ.
Lưu ý: Zalo và Facebook lưu tạm ô xem trước của mỗi link một thời gian. Nếu bạn sửa sau khi đã gửi, link cũ có thể vẫn hiện bản cũ.

## 3. Xem thử trên máy
Bấm đúp `index.html` để mở bằng Chrome/Edge. Muốn thử tên khách, thêm vào cuối địa chỉ trên thanh trình duyệt:

```
...index.html?name=Chị Tuyền
```

Lưu ý: máy phải có Internet (để tải phông chữ, ảnh mẫu, bản đồ, mã QR).
Phần chèn tên vào ảnh xem trước Zalo chỉ chạy sau khi đã đưa lên Cloudflare.

## 4. Lưu xác nhận tham dự và lời chúc vào Google Sheets (miễn phí)
Chưa làm bước này thì form vẫn hiện, nhưng câu trả lời **không được lưu**, và khách sẽ thấy dòng "Bản xem thử".

1. Vào https://sheets.new để tạo bảng tính mới, đặt tên tuỳ ý.
2. Menu **Tiện ích mở rộng → Apps Script**. Xoá hết mã có sẵn, dán toàn bộ nội dung file `extras/google-apps-script.gs`, bấm 💾 Lưu.
3. Bấm **Triển khai → Tác vụ triển khai mới**. Ở bánh răng ⚙ chọn **Ứng dụng web**:
   - *Thực thi dưới dạng*: **Tôi**
   - *Người có quyền truy cập*: **Bất kỳ ai**
4. Bấm **Triển khai**, cấp quyền cho tài khoản Google của bạn (nếu có cảnh báo, bấm *Nâng cao → Đi tới ... (không an toàn)*, vì đây là script của chính bạn).
5. Chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`) rồi dán vào `config.js`:
   ```js
   rsvp: { endpoint: 'https://script.google.com/macros/s/.../exec', deadline: '10/12/2026' },
   ```

Từ đó, mỗi khách xác nhận sẽ thêm một dòng vào trang tính "Xác nhận". Lời chúc hiện luôn trên trang cưới.
Muốn ẩn lời chúc nào thì gõ `x` vào cột **"Ẩn lời chúc"** của dòng đó.
Nếu sau này sửa mã script, phải vào **Triển khai → Quản lý tác vụ triển khai → ✏ → Phiên bản mới** thì thay đổi mới có hiệu lực.

## 5. Đưa lên Cloudflare Pages

### Cách A: kéo thả (không cần cài gì)
1. Đăng nhập https://dash.cloudflare.com (tạo tài khoản miễn phí nếu chưa có).
2. **Workers & Pages → Create → Pages → Upload assets** (tải lên tệp tĩnh).
3. Đặt tên dự án `damcuoitoi` (nếu đã có người dùng tên này thì chọn tên khác, link sẽ là `ten-ban-chon.pages.dev`).
4. Kéo **cả thư mục** này vào ô tải lên, bấm **Deploy**.
5. Lần sau sửa xong: vào dự án → **Create new deployment** → kéo thả lại cả thư mục.

### Cách B: dòng lệnh (cần Node.js)
```bash
npx wrangler login
npx wrangler pages deploy . --project-name damcuoitoi
```
Chạy lệnh trong thư mục này. Lần đầu wrangler hỏi tạo dự án, chọn đồng ý.

## 6. Tạo link gửi khách

| Thêm vào link | Tác dụng | Ví dụ |
|---|---|---|
| `?name=...` | Tên khách trên phong bì và thiệp | `?name=Chị Tuyền` |
| `?g=...` | Lấy tên từ danh sách `guests` trong `config.js` (link ngắn, khách không sửa được) | `?g=tuyen` |
| `&xh=...` | Ép cách xưng hô trong lời mời (mặc định tự đoán từ chữ đầu: anh, chị, cô, chú, bác...) | `&xh=anh chị` |
| `&template=...` | Chọn giao diện theo số thứ tự hoặc tên | `&template=1` |
| `&open=1` | Bỏ qua phong bì, vào thẳng trang | `&open=1` |
| `#rsvp`, `#gift`, `#events` | Nhảy tới phần Xác nhận / Mừng cưới / Địa điểm | `#rsvp` |

Tham số đầu tiên bắt đầu bằng `?`, các tham số sau nối bằng `&`, ví dụ:
```
https://damcuoitoi.pages.dev/?name=Gia đình chú Hùng&template=1
```
Gõ tên có dấu và dấu cách trực tiếp vào link được, Zalo/Messenger tự xử lý.
Xưng hô được đoán theo chữ đầu tên: "Gia đình chú Hùng" thì lời mời viết "của cả nhà"; "Anh Nam" thì viết "của anh"; tên không có xưng hô thì dùng "bạn".

## 7. Thêm giao diện mới
1. Chép `assets/css/themes/songhy.css` thành file mới, ví dụ `hoangkim.css`, rồi đổi màu, phông và hoạ tiết.
2. Trong `config.js`: `templates: ['songhy', 'hoangkim']`.
3. Link `?template=2` (hoặc `?template=hoangkim`) sẽ dùng giao diện mới. Không ghi gì thì dùng giao diện đầu tiên.

## 8. Lưu ý
- **Ai cũng xem được `config.js`** (bằng cách xem mã nguồn trang), kể cả danh sách `guests`. Đừng ghi gì riêng tư ở đó.
- **Ghi công nhạc nền:** nhạc mẫu *Canon in D* của Kevin MacLeod dùng giấy phép CC BY 3.0, bắt buộc ghi công. Trang đã tự ghi ở chân trang, đừng xoá dòng `credit`.
- **Hạn mức Cloudflare:** gói miễn phí cho 100.000 lượt gọi `_worker.js` mỗi ngày (chỉ tính khi mở trang và tải nhạc), dư sức cho một đám cưới.
- **Phông chữ:** Be Vietnam Pro, Cormorant Garamond, Great Vibes, Playfair Display (Google Fonts, giấy phép SIL OFL).
- **Ngày Âm lịch:** tính theo thuật toán của Hồ Ngọc Đức, múi giờ Việt Nam.
