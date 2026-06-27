# Hướng Dẫn Triển Khai – Binovet (Từng Bước)

Tài liệu này hướng dẫn deploy website **Binovet** lên một **VPS/server Linux tự quản** (Ubuntu 22.04+),
chạy bằng **PM2** sau **Nginx reverse proxy**, dùng **PostgreSQL cài cùng server**.

> Đây là cấu hình thực tế của dự án (không dùng Vercel/Netlify): upload file lưu thẳng vào ổ đĩa
> (`public/uploads`), database PostgreSQL local, không có thư mục `prisma/migrations` nên schema được
> đồng bộ bằng `prisma db push`.

---

## 0. Tổng quan kiến trúc

| Thành phần        | Công nghệ                                                   |
| ----------------- | ---------------------------------------------------------- |
| Framework         | Next.js `16.2.3` (App Router) + React `19.2.4`             |
| Ngôn ngữ          | TypeScript 5, TailwindCSS 4, Ant Design 6                  |
| ORM               | Prisma `7.8.0` + driver adapter `@prisma/adapter-pg` (`pg`) |
| Database          | PostgreSQL (cài **local** trên cùng server)                |
| Package manager   | **pnpm** `10.26.2` (đã ghim trong `package.json`)          |
| Process manager   | **PM2** (`ecosystem.config.js`)                            |
| Reverse proxy     | Nginx + SSL (Let's Encrypt / Certbot)                      |
| Lưu file upload   | Ổ đĩa local `public/uploads` (Supabase Storage là tùy chọn, đang tắt) |

Luồng request: `Người dùng → Nginx (443) → Next.js (PM2, cổng 3000) → PostgreSQL (127.0.0.1:5432)`

---

## 1. Yêu cầu hệ thống

- Server Linux (khuyến nghị **Ubuntu 22.04 LTS** trở lên), tối thiểu **2 GB RAM**, 2 vCPU.
- Quyền `sudo`.
- Một **tên miền** đã trỏ bản ghi `A` về IP của server (cần cho HTTPS).
- Các phần mềm sẽ cài ở Bước 2:
  - **Node.js 20 LTS** (Next 16 yêu cầu Node ≥ 20.9)
  - **pnpm 10.x**
  - **PostgreSQL 14+**
  - **PM2**, **Nginx**, **Git**

---

## 2. Chuẩn bị server (cài phần mềm)

Đăng nhập SSH vào server rồi chạy lần lượt:

```bash
# 2.1 Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2.2 Cài Node.js 20 LTS (qua NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v        # kỳ vọng v20.x

# 2.3 Bật pnpm qua Corepack (đúng phiên bản đã ghim trong package.json)
sudo corepack enable
corepack prepare pnpm@10.26.2 --activate
pnpm -v        # kỳ vọng 10.26.2

# 2.4 Cài PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

# 2.5 Cài PM2 (global) và Nginx, Git
sudo npm install -g pm2
sudo apt install -y nginx git
```

---

## 3. Tạo database PostgreSQL

Tạo database `binovet` và đặt mật khẩu cho user `postgres` (hoặc tạo user riêng).

```bash
sudo -u postgres psql
```

Trong `psql`:

```sql
-- Đặt mật khẩu mạnh cho user postgres (THAY '<mật-khẩu-mạnh>' bằng giá trị thật)
ALTER USER postgres WITH PASSWORD '<mật-khẩu-mạnh>';

-- Tạo database
CREATE DATABASE binovet;

\q
```

> **Ghi chú:** Mặc định trong mã nguồn dùng `postgresql://postgres:123456@127.0.0.1:5432/binovet`.
> Trên production **phải đổi mật khẩu `123456`** thành mật khẩu mạnh và cập nhật lại `DATABASE_URL` ở Bước 5.

Kiểm tra kết nối local:

```bash
psql "postgresql://postgres:<mật-khẩu-mạnh>@127.0.0.1:5432/binovet" -c "\conninfo"
```

---

## 4. Lấy mã nguồn

Triển khai vào thư mục `/var/www/binovet` (đúng với `cwd` trong `ecosystem.config.js`).

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www

# Clone từ repo (thay URL repo của bạn)
git clone <URL_REPO> binovet
cd /var/www/binovet

# Hoặc deploy đúng nhánh production:
# git clone -b production <URL_REPO> binovet
```

---

## 5. Cấu hình biến môi trường

> **Quan trọng về cách nạp biến môi trường:**
> - **Next.js (lúc chạy)** nạp cả `.env` và `.env.production`.
> - **Prisma CLI** (`db push`, `db seed`) đọc qua `dotenv/config` → **chỉ nạp `.env`**.
>
> Vì vậy hãy đặt **đầy đủ biến vào file `.env`** trên server để cả runtime lẫn Prisma CLI đều dùng được.

Tạo/sửa file `.env`:

```bash
cd /var/www/binovet
nano .env
```

Nội dung mẫu (thay các giá trị bí mật bằng chuỗi ngẫu nhiên mạnh — xem Bước 5.1):

```dotenv
# ── Token bảo mật khu vực admin ─────────────────────────────
ADMIN_SECRET_TOKEN=<chuỗi-bí-mật-ngẫu-nhiên>
NEXT_PUBLIC_ADMIN_SECRET_TOKEN=<chuỗi-bí-mật-ngẫu-nhiên>
NEXT_PUBLIC_ACCESS_TOKEN_SECRET=<chuỗi-bí-mật-ngẫu-nhiên>

# ── Tài khoản đăng nhập admin ───────────────────────────────
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=<mật-khẩu-admin-mạnh>

# ── PostgreSQL local ────────────────────────────────────────
DATABASE_URL="postgresql://postgres:<mật-khẩu-mạnh>@127.0.0.1:5432/binovet?schema=public"
```

> **Lưu ý bảo mật:** Biến có tiền tố `NEXT_PUBLIC_` sẽ bị **nhúng vào bundle phía client** (trình duyệt
> đọc được). Đặc biệt `NEXT_PUBLIC_ADMIN_SECRET_TOKEN` và `NEXT_PUBLIC_ADMIN_PASSWORD` là cơ chế bảo mật
> rất yếu — nên đặt website admin sau lớp bảo vệ bổ sung (giới hạn IP / HTTP Basic Auth ở Nginx) và **đổi
> toàn bộ giá trị mặc định** (`admin` / `binovet` / token trong repo).

### 5.1 Sinh chuỗi bí mật ngẫu nhiên

```bash
openssl rand -base64 48     # chạy mỗi lần cho mỗi biến cần secret
```

---

## 6. Cài dependencies

```bash
cd /var/www/binovet
pnpm install --frozen-lockfile
```

---

## 7. Đồng bộ schema & seed dữ liệu

Dự án **không có thư mục `prisma/migrations`** → đồng bộ cấu trúc bảng bằng `db push`
(file `prisma.config.ts` lấy URL từ `DIRECT_URL || DATABASE_URL`).

```bash
cd /var/www/binovet

# 7.1 Tạo/cập nhật bảng trong database theo schema
pnpm db:push

# 7.2 (Tùy chọn) Nạp dữ liệu mẫu: menu, danh mục, sản phẩm, bài viết, banner...
pnpm db:seed
```

> Chỉ chạy `pnpm db:seed` cho **lần khởi tạo đầu tiên**. Seed sẽ `deleteMany` rồi tạo lại
> menu/danh mục/banner → **không chạy lại trên DB đã có dữ liệu thật** kẻo mất nội dung.

Sau seed, đăng nhập admin bằng tài khoản đã đặt ở `.env` (mặc định gốc: `admin` / `binovet`).

---

## 8. Build production

```bash
cd /var/www/binovet
pnpm build
```

> Script `build` đã tự chạy `prisma generate` trước `next build` (xem `package.json`).
> Nếu build báo thiếu RAM, tạo swap tạm: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`.

---

## 9. Chạy ứng dụng bằng PM2

Dự án đã có sẵn `ecosystem.config.js` (chạy `pnpm start`, cổng `3000`, `cwd=/var/www/binovet`).

```bash
cd /var/www/binovet

# 9.1 Khởi động
pm2 start ecosystem.config.js

# 9.2 Kiểm tra trạng thái & log
pm2 status
pm2 logs binovet

# 9.3 Lưu danh sách process & bật tự khởi động khi reboot
pm2 save
pm2 startup        # chạy đúng dòng lệnh mà nó in ra (có sudo)
```

Lúc này app đã lắng nghe ở `http://127.0.0.1:3000`. Kiểm tra nhanh:

```bash
curl -I http://127.0.0.1:3000
```

---

## 10. Cấu hình Nginx reverse proxy

> **Trước tiên kiểm tra DNS:** đảm bảo bản ghi `A` của `binovet.com` **và** `www.binovet.com` đã trỏ về
> IP server (cần cho cả Nginx lẫn cấp SSL ở Bước 11). Kiểm tra: `dig +short binovet.com` phải trả về IP server.

Tạo file cấu hình site (tên miền `binovet.com`):

```bash
sudo nano /etc/nginx/sites-available/binovet
```

Nội dung:

```nginx
server {
    listen 80;
    server_name binovet.com www.binovet.com;

    # Cho phép upload file lớn (ảnh sản phẩm, PDF...)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt site và reload:

```bash
sudo ln -s /etc/nginx/sites-available/binovet /etc/nginx/sites-enabled/
sudo nginx -t           # kiểm tra cú pháp
sudo systemctl reload nginx
```

Mở tường lửa (nếu dùng `ufw`):

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 11. Cài SSL/HTTPS bằng Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d binovet.com -d www.binovet.com
```

Certbot sẽ tự sửa file Nginx để chuyển hướng `80 → 443`. Kiểm tra cơ chế tự gia hạn:

```bash
sudo certbot renew --dry-run
```

---

## 12. Thư mục upload & quyền ghi

File upload lưu vào `/var/www/binovet/public/uploads`. Đảm bảo thư mục tồn tại và user chạy PM2 ghi được:

```bash
mkdir -p /var/www/binovet/public/uploads
# Nếu PM2 chạy bằng user khác, cấp quyền tương ứng, ví dụ:
# sudo chown -R $USER:$USER /var/www/binovet/public/uploads
```

> - PM2 đã cấu hình `ignore_watch` bao gồm `public/uploads` nên upload **không** làm restart app.
> - **Cực kỳ quan trọng:** thư mục `public/uploads` **phải được giữ lại khi cập nhật code** (xem Bước 13)
>   và phải nằm trong kế hoạch **backup** — vì đây là nơi duy nhất chứa file người dùng tải lên.

---

## 13. Quy trình cập nhật / redeploy

Mỗi lần có code mới:

```bash
cd /var/www/binovet

git pull                       # hoặc: git fetch && git checkout production && git pull
pnpm install --frozen-lockfile # cài lib mới nếu có

pnpm db:push                   # CHỈ chạy khi schema có thay đổi
pnpm build                     # build lại bản production

pm2 reload binovet             # reload không downtime
pm2 logs binovet --lines 50    # kiểm tra log sau khi reload
```

> Vì `public/uploads` nằm trong repo path nhưng là dữ liệu runtime — **không** xóa thư mục khi deploy.
> Nếu deploy bằng cách clone mới hoàn toàn, hãy copy/symlink `public/uploads` từ bản cũ sang.

---

## 14. Sao lưu & phục hồi database

**Sao lưu (backup):**

```bash
pg_dump "postgresql://postgres:<mật-khẩu-mạnh>@127.0.0.1:5432/binovet" \
  -Fc -f /var/backups/binovet-$(date +%F).dump
```

Tự động hóa hằng ngày bằng `cron` (`crontab -e`):

```cron
0 2 * * * pg_dump "postgresql://postgres:<mật-khẩu>@127.0.0.1:5432/binovet" -Fc -f /var/backups/binovet-$(date +\%F).dump
```

**Phục hồi (restore):**

```bash
pg_restore -d "postgresql://postgres:<mật-khẩu>@127.0.0.1:5432/binovet" --clean --if-exists /var/backups/binovet-YYYY-MM-DD.dump
```

Đừng quên backup thư mục file:

```bash
tar czf /var/backups/binovet-uploads-$(date +%F).tar.gz -C /var/www/binovet/public uploads
```

---

## 15. Xử lý sự cố (Troubleshooting)

| Triệu chứng | Nguyên nhân & cách xử lý |
| ----------- | ------------------------ |
| `pnpm db:push`/`db:seed` báo lỗi kết nối | Sai `DATABASE_URL` hoặc PostgreSQL chưa chạy. Kiểm tra `sudo systemctl status postgresql` và thử `psql` ở Bước 3. Nhớ biến phải nằm trong **`.env`** (Prisma CLI không đọc `.env.production`). |
| App 502 Bad Gateway trên Nginx | Tiến trình Next chưa chạy ở cổng 3000. Xem `pm2 status`, `pm2 logs binovet`. |
| Upload ảnh trả lỗi 500 / read-only | Thư mục `public/uploads` thiếu hoặc không có quyền ghi (Bước 12). Lưu ý code chỉ chặn khi có biến `NETLIFY`/`VERCEL`. |
| Upload trả lỗi 401 Unauthorized | `NEXT_PUBLIC_ADMIN_SECRET_TOKEN` ở client khác giá trị server mong đợi. Đảm bảo build lại sau khi đổi biến `NEXT_PUBLIC_*`. |
| Đổi biến `NEXT_PUBLIC_*` không có tác dụng | Biến `NEXT_PUBLIC_*` được nhúng lúc **build** → phải `pnpm build` lại rồi `pm2 reload`. |
| Ảnh `next/image` lỗi domain | `next.config.ts` chỉ cho phép `/uploads/**`, `/images/**` (local) và host Supabase nếu cấu hình. Ảnh ngoài cần thêm vào `remotePatterns`. |
| Build thất bại vì hết RAM | Tạo swap (xem Bước 8). |
| Sai phiên bản pnpm | Dùng đúng `corepack prepare pnpm@10.26.2 --activate`. |

Lệnh log hữu ích:

```bash
pm2 logs binovet            # log ứng dụng
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u postgresql -e
```

---

## 16. Checklist sau khi deploy

- [ ] Đã đổi **mọi** secret/mật khẩu mặc định (`postgres` 123456, admin `binovet`, các token trong repo).
- [ ] Truy cập `https://binovet.com` lên trang chủ, SSL hợp lệ (ổ khóa xanh).
- [ ] Đăng nhập được khu vực admin và **tạo/sửa** được nội dung.
- [ ] **Upload ảnh** thành công, ảnh hiển thị ở trang public.
- [ ] `pm2 startup` + `pm2 save` đã bật → app tự chạy lại sau reboot.
- [ ] Đã đặt **backup tự động** cho database và `public/uploads`.
- [ ] (Khuyến nghị) Giới hạn truy cập trang admin bằng IP allowlist hoặc Basic Auth ở Nginx.

---

## Phụ lục A – Bảng biến môi trường

| Biến | Bắt buộc | Mô tả |
| ---- | -------- | ----- |
| `DATABASE_URL` | ✅ | Chuỗi kết nối PostgreSQL (dùng cho cả app runtime và Prisma CLI). |
| `ADMIN_SECRET_TOKEN` | ✅ | Token bí mật phía server cho thao tác admin. |
| `NEXT_PUBLIC_ADMIN_SECRET_TOKEN` | ✅ | Token gửi kèm khi upload/ghi dữ liệu (nhúng vào client — đổi giá trị mặc định). |
| `NEXT_PUBLIC_ACCESS_TOKEN_SECRET` | ✅ | Secret dùng cho phiên/đăng nhập admin (nhúng vào client). |
| `NEXT_PUBLIC_ADMIN_USERNAME` | ✅ | Tài khoản đăng nhập admin (mặc định `admin`). |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | ✅ | Mật khẩu admin (mặc định `binovet` — **phải đổi**). |
| `DIRECT_URL` | ⛔️ tùy chọn | URL session-mode cho Prisma CLI; nếu trống thì CLI dùng `DATABASE_URL`. |
| `SUPABASE_SERVICE_ROLE_KEY` | ⛔️ tùy chọn | Bật để upload lên Supabase Storage thay vì ổ đĩa local. |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | ⛔️ tùy chọn | URL project Supabase (đi kèm khi bật Storage). |
| `SUPABASE_STORAGE_BUCKET` | ⛔️ tùy chọn | Tên bucket (mặc định `uploads`). |

## Phụ lục B – Lệnh tham chiếu nhanh

```bash
pnpm install --frozen-lockfile   # cài dependencies
pnpm db:push                     # đồng bộ schema → DB
pnpm db:seed                     # nạp dữ liệu mẫu (chỉ lần đầu)
pnpm build                       # build production (kèm prisma generate)
pnpm start                       # chạy trực tiếp (PM2 dùng lệnh này)
pm2 start ecosystem.config.js    # chạy qua PM2
pm2 reload binovet               # redeploy không downtime
pm2 logs binovet                 # xem log
pnpm db:studio                   # mở Prisma Studio (quản lý dữ liệu trực quan)
```
