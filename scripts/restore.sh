#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/erp_backup_*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-erp_user}"
DB_NAME="${DB_NAME:-erp_db}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will replace all data in $DB_NAME!"
read -p "Continue? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo "[$(date)] Restoring from $BACKUP_FILE..."

gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD:-123456}" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --quiet

if [ $? -eq 0 ]; then
    echo "[$(date)] Restore complete!"
else
    echo "[$(date)] Restore failed!"
    exit 1
fi
