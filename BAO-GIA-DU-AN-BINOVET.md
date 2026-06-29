# BÁO GIÁ DỰ ÁN WEBSITE BINOVET

**Tên dự án:** Website giới thiệu & quản trị nội dung Binovet (BIOTECH-VET)
**Tên miền:** binovet.com
**Loại sản phẩm:** Website B2B đa ngôn ngữ (Tiếng Việt – Tiếng Anh) + Hệ thống quản trị nội dung (CMS)
**Công nghệ:** Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL · Prisma 7 · Tailwind CSS 4

---

## A. BẢNG DỊCH VỤ TỔNG QUAN

| STT | Loại dịch vụ | Tên dịch vụ | Giá (VNĐ) | Ghi chú |
|:---:|--------------|-------------|----------:|---------|
| 1 | Tên miền | binovet.com | 1.900.000 | 5 năm |
| 2 | Hosting | binovet.com | 5.520.000 | 2 năm |
| 3 | Phát triển | binovet.com | 10.000.000 | Trọn gói |
| | **TỔNG CỘNG** | | **17.420.000** | |

> Chi tiết hạng mục phát triển (10.000.000 VNĐ) được phân bổ tại các bảng bên dưới.

---

## B. BẢNG HẠNG MỤC PHÁT TRIỂN

### I. FRONTEND – GIAO DIỆN NGƯỜI DÙNG

| STT | Hạng mục | Mô tả | Loại | Chi phí (VNĐ) |
|:---:|----------|-------|------|--------------:|
| 1 | Trang chủ | Banner slider động, video giới thiệu, số liệu thống kê chạy động, marquee danh mục, khối sản phẩm/tin tức nổi bật | Trang | 700.000 |
| 2 | Trang giới thiệu | Giới thiệu doanh nghiệp, tầm nhìn – sứ mệnh, nội dung quản lý qua CMS | Trang | 300.000 |
| 3 | Trang sản phẩm | Danh sách sản phẩm, tìm kiếm, lọc theo danh mục, sắp xếp, phân trang | Chức năng | 650.000 |
| 4 | Chi tiết sản phẩm | Thư viện ảnh, phóng to (lightbox), bảng thông số kỹ thuật, sản phẩm liên quan | Chức năng | 600.000 |
| 5 | Tin tức & bài viết | Danh sách tin tức, trang chi tiết bài viết, chia sẻ, bài liên quan | Chức năng | 450.000 |
| 6 | Cẩm nang chăn nuôi | Chuyên mục cẩm nang kỹ thuật, danh sách & chi tiết bài | Chức năng | 300.000 |
| 7 | Thư viện ảnh/video & Catalogue | Thư viện hình ảnh, video; catalogue PDF dạng lật trang (flipbook) | Chức năng | 550.000 |
| 8 | Trang liên hệ | Form gửi liên hệ, thông tin – bản đồ, nút liên hệ nổi (Zalo/Hotline) | Chức năng | 300.000 |
| 9 | Đa ngôn ngữ Việt – Anh | Hệ thống định tuyến theo ngôn ngữ, chuyển đổi nội dung song ngữ | Tích hợp | 400.000 |
| 10 | Responsive, hiệu ứng & SEO | Tương thích mọi thiết bị, hiệu ứng chuyển động, tối ưu SEO & dữ liệu có cấu trúc | Giao diện | 250.000 |
| | **Tổng I** | | | **4.500.000** |

### II. ADMIN – QUẢN TRỊ NỘI DUNG (CMS)

| STT | Hạng mục | Mô tả | Loại | Chi phí (VNĐ) |
|:---:|----------|-------|------|--------------:|
| 1 | Đăng nhập & bảo mật | Hệ thống đăng nhập quản trị, kiểm soát truy cập | Bảo mật | 400.000 |
| 2 | Dashboard thống kê | Trang tổng quan thống kê sản phẩm, bài viết, dữ liệu hệ thống | Chức năng | 350.000 |
| 3 | Quản lý sản phẩm | Thêm/sửa/xóa sản phẩm, ảnh, thông số kỹ thuật song ngữ | Module | 600.000 |
| 4 | Quản lý danh mục | Quản lý danh mục sản phẩm song ngữ | Module | 250.000 |
| 5 | Quản lý tin tức/bài viết | Quản lý bài viết với trình soạn thảo CKEditor, ảnh đại diện | Module | 550.000 |
| 6 | Quản lý cẩm nang | Quản lý nội dung cẩm nang chăn nuôi | Module | 300.000 |
| 7 | Quản lý banner | Quản lý banner trang chủ (thứ tự, trạng thái, liên kết) | Module | 300.000 |
| 8 | Quản lý menu | Quản lý menu điều hướng đa cấp, mega menu | Module | 350.000 |
| 9 | Quản lý thư viện | Quản lý thư viện ảnh/video, upload & sắp xếp | Module | 350.000 |
| 10 | Quản lý trang giới thiệu | Quản lý nội dung trang giới thiệu doanh nghiệp | Module | 250.000 |
| 11 | Cấu hình hệ thống | Thông tin liên hệ, mạng xã hội, cấu hình chung của website | Module | 300.000 |
| | **Tổng II** | | | **4.000.000** |

### III. CÀI ĐẶT & DỊCH VỤ VẬN HÀNH

| STT | Hạng mục | Mô tả | Loại | Chi phí (VNĐ) |
|:---:|----------|-------|------|--------------:|
| 1 | Cài đặt máy chủ | Cài đặt & cấu hình server, Node.js, PM2 (chạy nền, tự khởi động) | Dịch vụ | 350.000 |
| 2 | Cài đặt cơ sở dữ liệu | Cài đặt & cấu hình PostgreSQL, khởi tạo cấu trúc dữ liệu | Dịch vụ | 250.000 |
| 3 | Tên miền & SSL | Trỏ tên miền, cấu hình chứng chỉ bảo mật SSL (HTTPS) | Dịch vụ | 200.000 |
| 4 | Triển khai mã nguồn | Đưa mã nguồn lên server, build & chạy chính thức (deploy) | Dịch vụ | 300.000 |
| 5 | Khởi tạo dữ liệu | Nhập dữ liệu mẫu ban đầu, cấu hình nội dung khởi điểm | Dịch vụ | 200.000 |
| 6 | Hướng dẫn & bàn giao | Hướng dẫn sử dụng CMS, bàn giao tài khoản & tài liệu | Dịch vụ | 200.000 |
| | **Tổng III** | | | **1.500.000** |

### TỔNG CHI PHÍ PHÁT TRIỂN

| Hạng mục | Chi phí (VNĐ) |
|----------|--------------:|
| I. Frontend – Giao diện người dùng | 4.500.000 |
| II. Admin – Quản trị nội dung (CMS) | 4.000.000 |
| III. Cài đặt & dịch vụ vận hành | 1.500.000 |
| **TỔNG CỘNG PHÁT TRIỂN** | **10.000.000** |

---

## C. CÁC KHOẢN PHÍ THÊM

### Chi phí bảo trì và hỗ trợ sau bảo hành

Sau thời gian bảo hành, các yêu cầu hỗ trợ kỹ thuật, chỉnh sửa nội dung, deploy hệ thống, backup dữ liệu hoặc xử lý lỗi sẽ được tính phí theo từng lần hoặc theo gói bảo trì riêng.

**Mức phí tham khảo:**

| Loại dịch vụ | Mức phí tham khảo |
|--------------|-------------------|
| Triển khai/cập nhật website (deploy source code, cấu hình hệ thống, cập nhật dữ liệu...) | Từ 300.000 – 500.000 VNĐ/lần |
| Xử lý lỗi hoặc hỗ trợ kỹ thuật | Từ 200.000 VNĐ/giờ |
| Bảo trì và theo dõi hệ thống định kỳ | Từ 300.000 VNĐ/tháng |

> *Phí bảo trì định kỳ **không bao gồm** chi phí hosting/server/domain.*

---

## D. GHI CHÚ CHUNG

- Báo giá đã bao gồm trọn gói thiết kế giao diện, lập trình frontend, hệ thống quản trị nội dung (CMS) và dịch vụ cài đặt – triển khai ban đầu.
- Website hỗ trợ song ngữ **Tiếng Việt – Tiếng Anh**, tương thích mọi thiết bị (máy tính, máy tính bảng, điện thoại).
- Toàn bộ nội dung (sản phẩm, danh mục, tin tức, cẩm nang, banner, menu, thư viện, thông tin liên hệ) đều có thể tự quản lý qua hệ thống CMS.
- Giá trên chưa bao gồm thuế VAT (nếu có).

---

*Báo giá có hiệu lực trong vòng 30 ngày kể từ ngày phát hành.*
