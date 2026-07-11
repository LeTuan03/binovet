# Hướng Dẫn Triển Khai – Binovet (Từng Bước)

Tài liệu này hướng dẫn deploy website **Binovet** lên một **VPS/server Linux tự quản** (Ubuntu 22.04+),
chạy bằng **PM2** sau **Nginx reverse proxy**, dùng **PostgreSQL cài cùng server**.

> [!TIP]
> **Khuyên dùng:** Nên chạy thử ứng dụng ở môi trường Local trước khi deploy lên server.
> Xem [LOCAL_SETUP.md](./LOCAL_SETUP.md).

> Đây là cấu hình thực tế của dự án (không dùng Vercel/Netlify): upload file lưu thẳng vào ổ đĩa
> (`public/uploads`), database PostgreSQL local, không có thư mục `prisma/migrations` nên schema được
> đồng bộ bằng `prisma db push`.

**Tên miền:** `binovet.com` (và `www.binovet.com`)

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

# 2.5 Cài PM2 (global) và Nginx, Git, tiện ích build
sudo npm install -g pm2
sudo apt install -y nginx git build-essential
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

Dự án đã có sẵn `ecosystem.config.js` (chạy `pnpm start`, cổng `3000`, `cwd=/var/www/binovet`,
`exec_mode: fork`, `instances: 1`).

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

> **Về log PM2:** mặc định log nằm ở `~/.pm2/logs/binovet-out.log` và `binovet-error.log`.
> Cấu hình xoay vòng log để không đầy đĩa ở **Bước 15**.

---

## 10. Cấu hình Nginx reverse proxy

> **Trước tiên kiểm tra DNS:** đảm bảo bản ghi `A` của `binovet.com` **và** `www.binovet.com` đã trỏ về
> IP server (cần cho cả Nginx lẫn cấp SSL ở Bước 11). Kiểm tra: `dig +short binovet.com` phải trả về IP server.

Dự án có sẵn **2 file cấu hình Nginx đã version trong repo** (thư mục `deploy/nginx/`) — dùng thẳng, không gõ tay:

| File trong repo | Copy vào vị trí hệ thống | Vai trò |
| --------------- | ------------------------ | ------- |
| `deploy/nginx/nginx.conf` | `/etc/nginx/nginx.conf` | Cấu hình global (đã bật gzip) — **không** chứa tên miền |
| `deploy/nginx/binovet.com.conf` | `/etc/nginx/sites-available/binovet` | Site config đầy đủ: HTTPS + security headers + cache `/_next/static` + phục vụ `/uploads` |

### 10.1 Copy cấu hình global

```bash
sudo cp /var/www/binovet/deploy/nginx/nginx.conf /etc/nginx/nginx.conf
```

### 10.2 Tạo site config TẠM (chỉ HTTP) để Certbot cấp cert

> File `binovet.com.conf` đầy đủ có trỏ tới cert `/etc/letsencrypt/live/binovet.com/` — thư mục này
> **chưa tồn tại** trước khi cấp SSL, nên nếu áp file đầy đủ ngay thì `nginx -t` sẽ **báo lỗi**. Vì vậy lần
> đầu ta dựng một site tạm chỉ nghe cổng 80 để Certbot xác thực domain, rồi mới thay bằng file đầy đủ ở Bước 11.

```bash
sudo tee /etc/nginx/sites-available/binovet > /dev/null <<'EOF'
server {
    listen 80;
    server_name binovet.com www.binovet.com;
    client_max_body_size 100M;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 10.3 Kích hoạt site, gỡ site cũ/mặc định, test & reload

```bash
sudo ln -sf /etc/nginx/sites-available/binovet /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default        # gỡ site mặc định của Nginx
# Nếu server từng chạy domain cũ: sudo rm -f /etc/nginx/sites-enabled/biotechvet
sudo nginx -t                                      # kiểm tra cú pháp
sudo systemctl reload nginx
```

> Mở tường lửa cho Nginx: xem **Bước 13**.

---

## 11. Cài SSL/HTTPS bằng Certbot & áp cấu hình đầy đủ

### 11.1 Cấp chứng chỉ SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d binovet.com -d www.binovet.com
```

Certbot xác thực qua cổng 80 (site tạm ở Bước 10.2) rồi cấp cert vào `/etc/letsencrypt/live/binovet.com/`.

### 11.2 Thay bằng site config đầy đủ (HTTPS + headers + cache)

Giờ cert đã tồn tại → thay site tạm bằng file cấu hình đầy đủ trong repo rồi reload:

```bash
sudo cp /var/www/binovet/deploy/nginx/binovet.com.conf /etc/nginx/sites-available/binovet
sudo nginx -t                 # cert đã có nên lần này pass
sudo systemctl reload nginx
```

### 11.3 Kiểm tra & bật tự gia hạn

```bash
sudo certbot renew --dry-run          # thử gia hạn (không thật)
sudo systemctl enable certbot.timer   # bật timer tự gia hạn
sudo certbot certificates             # xem thông tin cert hiện có
```

> File `binovet.com.conf` tự redirect `80 → 443`, bật HSTS + security headers, cache `/_next/static` và
> phục vụ ảnh upload từ `/var/www/binovet/public/uploads`. **Nếu sau này đổi tên miền:** sửa 5 chỗ trong
> file này — `server_name`, `ssl_certificate`/`ssl_certificate_key`, `access_log`/`error_log`,
> `alias .../uploads/`, và tên block `upstream` — rồi chạy lại Bước 11.1 để cấp cert cho domain mới.

---

## 12. Thư mục upload & quyền ghi

File upload lưu vào `/var/www/binovet/public/uploads`. Đảm bảo thư mục tồn tại và user chạy PM2 ghi được:

```bash
mkdir -p /var/www/binovet/public/uploads
chmod -R 755 /var/www/binovet/public/uploads
# Nếu PM2 chạy bằng user khác, cấp quyền tương ứng, ví dụ:
# sudo chown -R $USER:$USER /var/www/binovet/public/uploads
```

> - PM2 đã cấu hình `ignore_watch` bao gồm `public/uploads` nên upload **không** làm restart app.
> - **Cực kỳ quan trọng:** thư mục `public/uploads` **phải được giữ lại khi cập nhật code** (xem Bước 18)
>   và phải nằm trong kế hoạch **backup** (Bước 17) — vì đây là nơi duy nhất chứa file người dùng tải lên.

---

## 13. Tường lửa & bảo mật server

### 13.1 Tường lửa UFW

```bash
sudo ufw allow OpenSSH            # GIỮ SSH trước khi bật, tránh tự khóa mình ra ngoài
sudo ufw allow 'Nginx Full'      # mở 80 + 443
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
sudo ufw status                  # kiểm tra
```

> ⚠️ **Không** mở port PostgreSQL `5432` ra ngoài. Để quản lý DB từ xa hãy dùng SSH tunnel (Bước 14).

### 13.2 Tăng cường SSH (khuyến nghị)

> Chỉ tắt đăng nhập mật khẩu **sau khi** đã cấu hình đăng nhập bằng SSH key thành công, kẻo mất quyền vào server.

```bash
sudo nano /etc/ssh/sshd_config
```

Đặt các giá trị:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Rồi áp dụng:

```bash
sudo systemctl restart ssh
```

### 13.3 Fail2Ban (chặn brute-force SSH)

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

### 13.4 (Khuyến nghị) Giới hạn truy cập trang admin

Trang admin bảo mật yếu (token nhúng client). Nên chặn thêm ở Nginx bằng IP allowlist hoặc Basic Auth.
Ví dụ chặn theo IP — thêm vào block `server { listen 443 ... }` của `binovet` (đường dẫn admin của dự án là `/admin`):

```nginx
location /admin {
    allow 1.2.3.4;      # IP văn phòng/nhà bạn
    deny all;
    proxy_pass http://binovet_app;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 14. Truy cập database từ xa (DBeaver / TablePlus / Prisma Studio)

**Khuyên dùng — SSH Tunnel (không mở port, bảo mật cao).** Công cụ quản lý kết nối tới PostgreSQL qua SSH:

| Thông số kết nối DB | Giá trị |
| ------------------- | ------- |
| Host | `127.0.0.1` (localhost — nhìn từ phía server) |
| Port | `5432` |
| Database | `binovet` |
| User / Password | `postgres` / `<mật-khẩu đã đặt ở Bước 3>` |

| SSH Tunnel | Giá trị |
| ---------- | ------- |
| SSH Host | IP của VPS |
| SSH User | user SSH của bạn (vd `root` hoặc user riêng) |
| SSH Auth | Password hoặc Private Key |

Tạo tunnel thủ công từ máy cá nhân (rồi trỏ công cụ vào `localhost:5433`):

```bash
ssh -L 5433:127.0.0.1:5432 <ssh-user>@<IP-VPS>
```

> **Không khuyến khích** mở thẳng port `5432` ra internet. Nếu bắt buộc, tối thiểu giới hạn nguồn IP:
> `sudo ufw allow from <IP-của-bạn> to any port 5432 proto tcp`.

---

## 15. Giám sát & xoay vòng log

### 15.1 Theo dõi tiến trình

```bash
pm2 status                     # trạng thái app
pm2 monit                      # dashboard realtime (CPU/RAM)
pm2 logs binovet --lines 100   # log ứng dụng
```

### 15.2 Xoay vòng log PM2 (tránh đầy đĩa)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

### 15.3 Log Nginx

```bash
sudo tail -f /var/log/nginx/binovet-access.log
sudo tail -f /var/log/nginx/binovet-error.log
```

Nginx trên Ubuntu đã có sẵn logrotate (`/etc/logrotate.d/nginx`) — không cần cấu hình thêm.

---

## 16. Health check tự động (tùy chọn)

Dự án **chưa có** endpoint `/api/health`, nên script dưới kiểm tra thẳng trang chủ; nếu không trả về `200`
thì reload app. (Muốn nhẹ hơn, có thể tự thêm route `src/app/api/health/route.ts` trả JSON `{status:'ok'}`.)

Tạo `/var/www/binovet/health-check.sh`:

```bash
#!/bin/bash
HEALTH_URL="https://binovet.com"
code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
if [ "$code" != "200" ] && [ "$code" != "307" ]; then
    echo "$(date '+%F %T') health check failed: HTTP $code — reloading" 
    pm2 reload binovet
fi
```

Cấp quyền chạy & thêm cron mỗi 5 phút:

```bash
chmod +x /var/www/binovet/health-check.sh
crontab -e
```

```cron
*/5 * * * * /var/www/binovet/health-check.sh >> /var/log/binovet-health.log 2>&1
```

---

## 17. Sao lưu & phục hồi

Có **2 thứ phải backup**: (1) database PostgreSQL, (2) thư mục `public/uploads` (file người dùng tải lên).

### 17.1 Script backup database

Tạo `/var/www/binovet/backup-db.sh`:

```bash
#!/bin/bash
set -e
BACKUP_DIR="/var/backups/binovet"
TS=$(date +%F-%H%M%S)
mkdir -p "$BACKUP_DIR"

pg_dump "postgresql://postgres:<mật-khẩu>@127.0.0.1:5432/binovet" \
  -Fc -f "$BACKUP_DIR/db-$TS.dump"

# Giữ 14 bản gần nhất
ls -t "$BACKUP_DIR"/db-*.dump | tail -n +15 | xargs -r rm -f
echo "DB backup: $BACKUP_DIR/db-$TS.dump"
```

### 17.2 Script backup uploads

Tạo `/var/www/binovet/backup-uploads.sh`:

```bash
#!/bin/bash
set -e
BACKUP_DIR="/var/backups/binovet"
TS=$(date +%F-%H%M%S)
mkdir -p "$BACKUP_DIR"

tar czf "$BACKUP_DIR/uploads-$TS.tar.gz" -C /var/www/binovet/public uploads

# Giữ 14 bản gần nhất
ls -t "$BACKUP_DIR"/uploads-*.tar.gz | tail -n +15 | xargs -r rm -f
echo "Uploads backup: $BACKUP_DIR/uploads-$TS.tar.gz"
```

### 17.3 Cấp quyền & lên lịch cron

```bash
chmod +x /var/www/binovet/backup-db.sh /var/www/binovet/backup-uploads.sh
crontab -e
```

```cron
0 2 * * * /var/www/binovet/backup-db.sh      >> /var/log/binovet-backup.log 2>&1
0 3 * * * /var/www/binovet/backup-uploads.sh >> /var/log/binovet-backup.log 2>&1
```

### 17.4 Phục hồi

```bash
# Phục hồi database
pg_restore -d "postgresql://postgres:<mật-khẩu>@127.0.0.1:5432/binovet" \
  --clean --if-exists /var/backups/binovet/db-YYYY-MM-DD-HHMMSS.dump

# Phục hồi uploads
tar xzf /var/backups/binovet/uploads-YYYY-MM-DD-HHMMSS.tar.gz -C /var/www/binovet/public
```

---

## 18. Quy trình cập nhật / redeploy

### 18.1 Thủ công

```bash
cd /var/www/binovet

git pull                       # hoặc: git fetch && git checkout production && git pull
pnpm install --frozen-lockfile # cài lib mới nếu có

pnpm db:push                   # CHỈ chạy khi schema có thay đổi
pnpm build                     # build lại bản production

pm2 reload binovet             # reload không downtime
pm2 logs binovet --lines 50    # kiểm tra log sau khi reload
```

### 18.2 Script deploy.sh (gói lại các bước trên)

Tạo `/var/www/binovet/deploy.sh`:

```bash
#!/bin/bash
set -e
cd /var/www/binovet

echo "📥 Pull code..."
git pull

echo "📦 Install deps..."
pnpm install --frozen-lockfile

# echo "🗄️  DB push..."   # BỎ COMMENT khi schema có thay đổi
# pnpm db:push

echo "🔨 Build..."
pnpm build

echo "🔄 Reload PM2..."
pm2 reload binovet

echo "✅ Deploy xong."
```

```bash
chmod +x /var/www/binovet/deploy.sh
# Mỗi lần deploy: cd /var/www/binovet && ./deploy.sh
```

> Vì `public/uploads` nằm trong repo path nhưng là dữ liệu runtime — **không** xóa thư mục khi deploy.
> Nếu deploy bằng cách clone mới hoàn toàn, hãy copy/symlink `public/uploads` từ bản cũ sang.
>
> **Nếu file trong `deploy/nginx/` thay đổi** (đổi domain, tinh chỉnh Nginx): copy lại theo Bước 10–11 rồi
> `sudo nginx -t && sudo systemctl reload nginx`.

---

## 19. Xử lý sự cố (Troubleshooting)

| Triệu chứng | Nguyên nhân & cách xử lý |
| ----------- | ------------------------ |
| `ERR_NAME_NOT_RESOLVED` trên trình duyệt | DNS chưa phân giải/local cache. Kiểm tra `nslookup binovet.com 8.8.8.8`; xóa cache máy: `ipconfig /flushdns` (Windows). |
| `nginx -t` báo thiếu file cert | Áp file `binovet.com.conf` đầy đủ **khi chưa có cert**. Làm đúng thứ tự Bước 10.2 → 11.1 → 11.2. |
| `pnpm db:push`/`db:seed` báo lỗi kết nối | Sai `DATABASE_URL` hoặc PostgreSQL chưa chạy. Kiểm tra `sudo systemctl status postgresql` và thử `psql` ở Bước 3. Nhớ biến phải nằm trong **`.env`** (Prisma CLI không đọc `.env.production`). |
| App 502 Bad Gateway trên Nginx | Tiến trình Next chưa chạy ở cổng 3000. Xem `pm2 status`, `pm2 logs binovet`; `curl -I http://127.0.0.1:3000`. |
| Port 3000 đang bị chiếm | `sudo lsof -i :3000` rồi `sudo kill -9 <PID>`; hoặc `pm2 delete binovet` rồi start lại. |
| Upload ảnh trả lỗi 500 / read-only | Thư mục `public/uploads` thiếu hoặc không có quyền ghi (Bước 12). Lưu ý code chỉ chặn khi có biến `NETLIFY`/`VERCEL`. |
| Upload trả lỗi 401 Unauthorized | `NEXT_PUBLIC_ADMIN_SECRET_TOKEN` ở client khác giá trị server mong đợi. Đảm bảo build lại sau khi đổi biến `NEXT_PUBLIC_*`. |
| Đổi biến `NEXT_PUBLIC_*` không có tác dụng | Biến `NEXT_PUBLIC_*` được nhúng lúc **build** → phải `pnpm build` lại rồi `pm2 reload`. |
| Ảnh `next/image` lỗi domain | `next.config.ts` chỉ cho phép `/uploads/**`, `/images/**` (local) và host Supabase nếu cấu hình. Ảnh ngoài cần thêm vào `remotePatterns`. |
| Build thất bại vì hết RAM | Tạo swap (xem Bước 8). |
| Lỗi SSL / cần cấp lại cert | `sudo certbot certificates`; gia hạn cưỡng bức `sudo certbot renew --force-renewal`; cấp lại `sudo certbot --nginx -d binovet.com -d www.binovet.com`. |
| Sai phiên bản pnpm | Dùng đúng `corepack prepare pnpm@10.26.2 --activate`. |

Lệnh log hữu ích:

```bash
pm2 logs binovet            # log ứng dụng
sudo tail -f /var/log/nginx/binovet-error.log
sudo journalctl -u postgresql -e
```

---

## 20. Checklist sau khi deploy

- [ ] Đã đổi **mọi** secret/mật khẩu mặc định (`postgres` 123456, admin `binovet`, các token trong repo).
- [ ] Truy cập `https://binovet.com` lên trang chủ, SSL hợp lệ (ổ khóa xanh).
- [ ] `www.binovet.com` và HTTP đều **redirect** về `https://binovet.com`.
- [ ] Đăng nhập được khu vực admin và **tạo/sửa** được nội dung.
- [ ] **Upload ảnh** thành công, ảnh hiển thị ở trang public.
- [ ] `pm2 startup` + `pm2 save` đã bật → app tự chạy lại sau reboot.
- [ ] **Tường lửa UFW** bật, chỉ mở 22/80/443 (Bước 13).
- [ ] **pm2-logrotate** đã cài (Bước 15) → log không làm đầy đĩa.
- [ ] **Backup tự động** cho database và `public/uploads` đã lên cron (Bước 17).
- [ ] `certbot renew --dry-run` chạy OK và `certbot.timer` đã bật.
- [ ] (Khuyến nghị) Giới hạn truy cập trang admin bằng IP allowlist hoặc Basic Auth ở Nginx.

---

## 21. Lệnh tham chiếu nhanh

```bash
# App / PM2
pnpm install --frozen-lockfile   # cài dependencies
pnpm db:push                     # đồng bộ schema → DB
pnpm db:seed                     # nạp dữ liệu mẫu (chỉ lần đầu)
pnpm build                       # build production (kèm prisma generate)
pnpm start                       # chạy trực tiếp (PM2 dùng lệnh này)
pm2 start ecosystem.config.js    # chạy qua PM2
pm2 reload binovet               # redeploy không downtime
pm2 restart binovet              # restart (có downtime ngắn)
pm2 logs binovet                 # xem log
pm2 monit                        # dashboard realtime
pnpm db:studio                   # mở Prisma Studio (quản lý dữ liệu trực quan)

# Nginx
sudo nginx -t                    # kiểm tra cú pháp
sudo systemctl reload nginx      # nạp lại cấu hình
sudo tail -f /var/log/nginx/binovet-error.log

# SSL
sudo certbot certificates        # xem cert
sudo certbot renew --dry-run     # thử gia hạn

# Hệ thống
df -h                            # dung lượng đĩa
free -h                          # RAM
sudo journalctl -xe              # log hệ thống
```

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
