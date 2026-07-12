#!/bin/bash
set -e

# ==== Cấu hình ====
BACKUP_DIR="/var/backups/binovet"
DB_URL="postgresql://postgres:<mật-khẩu>@127.0.0.1:5432/binovet"
KEEP=3   # số bản giữ lại (chạy 1 lần/ngày => 3 ngày gần nhất)

TS=$(date +%F-%H%M%S)
mkdir -p "$BACKUP_DIR"

pg_dump "$DB_URL" -Fc -f "$BACKUP_DIR/db-$TS.dump"

# Giữ 3 bản gần nhất (3 ngày)
ls -t "$BACKUP_DIR"/db-*.dump | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "DB backup: $BACKUP_DIR/db-$TS.dump"
