#!/bin/bash
set -e

# ==== Cấu hình ====
BACKUP_DIR="/var/backups/binovet"
UPLOADS_PARENT="/var/www/binovet/public"
KEEP=3   # số bản giữ lại (chạy 1 lần/ngày => 3 ngày gần nhất)

TS=$(date +%F-%H%M%S)
mkdir -p "$BACKUP_DIR"

tar czf "$BACKUP_DIR/uploads-$TS.tar.gz" -C "$UPLOADS_PARENT" uploads

# Giữ 3 bản gần nhất (3 ngày)
ls -t "$BACKUP_DIR"/uploads-*.tar.gz | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "Uploads backup: $BACKUP_DIR/uploads-$TS.tar.gz"
