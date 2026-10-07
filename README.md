# RiseOn Game Studio — Website

Website giới thiệu **RiseOn Game Studio** (trước đây là HB Academy). Trang tĩnh thuần HTML/CSS/JS, host miễn phí bằng **GitHub Pages**.

## Cấu trúc

```
index.html              Trang chính (một trang, nhiều section)
assets/css/style.css    Toàn bộ giao diện + màu thương hiệu (biến CSS ở đầu file)
assets/js/main.js       Menu, parallax hero, bánh bao đi theo lộ trình, màn chọn nhân vật, mini game pixel
assets/img/             Logo, biểu tượng O, favicon, ảnh chia sẻ (og-image.png)
assets/img/chars/       Nhân vật đã tách nền từ các game (bánh bao, mèo, trái cây…)
assets/img/games/       Icon + screenshot từ Google Play
assets/img/team/        Thành viên đã tách nền cho màn "Chọn nhân vật"
```

Thêm/sửa thành viên: thêm ảnh PNG/WebP nền trong suốt vào `assets/img/team/`, thêm một nút `.slot` trong `index.html` và một dòng trong mảng `TEAM` ở `main.js`.

## Bộ nhận diện (lấy từ RiseOnLogo.ai)

| Màu | Mã |
|---|---|
| Yellow | `#f9de0b` |
| Amber | `#f6ad13` |
| Orange | `#f27d1c` |
| Red | `#ef4c24` |
| Ink | `#231f20` |

Gradient chính: `#f9de0b → #ef4c24` · Font: **Inter** · Tagline: *Rise above – Play beyond*

## Chạy thử trên máy

```bash
python -m http.server 5173
```

Mở http://localhost:5173

## Cập nhật nội dung

- Sửa chữ, khóa học, địa chỉ: chỉnh trực tiếp trong `index.html`.
- Đổi màu: sửa các biến `--yellow`, `--orange`… ở đầu `style.css`.
- Commit và push lên nhánh `main`, GitHub Pages tự cập nhật sau khoảng 1 phút.
