# RiseOn Game Studio — Website

Website giới thiệu **RiseOn Game Studio** (trước đây là HB Academy). Trang tĩnh thuần HTML/CSS/JS, host miễn phí bằng **GitHub Pages**.

## Cấu trúc

```
index.html              Trang chính (một trang, nhiều section)
assets/css/style.css    Toàn bộ giao diện + màu thương hiệu (biến CSS ở đầu file)
assets/js/main.js       Menu mobile, hiệu ứng cuộn, lọc khóa học, mini game pixel
assets/img/             Logo, biểu tượng O, favicon, ảnh chia sẻ (og-image.png)
```

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
