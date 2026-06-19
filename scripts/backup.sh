#!/bin/bash
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-erp_user}"
DB_NAME="${DB_NAME:-erp_db}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/erp_backup_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup..."

PGPASSWORD="${DB_PASSWORD:-123456}" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-privileges \
    | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
    echo "[$(date)] Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo "[$(date)] Cleaning old backups (older than $KEEP_DAYS days)..."
find "$BACKUP_DIR" -name "erp_backup_*.sql.gz" -mtime +$KEEP_DAYS -delete

REMAINING=$(find "$BACKUP_DIR" -name "erp_backup_*.sql.gz" | wc -l)
echo "[$(date)] Backup complete. $REMAINING backup(s) in $BACKUP_DIR"
