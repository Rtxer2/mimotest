#!/bin/bash

BACKUP_DIR="${BACKUP_DIR:-./backups}"

echo "=== ERP Backups ==="
echo ""

if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR"/erp_backup_*.sql.gz 2>/dev/null)" ]; then
    echo "No backups found in $BACKUP_DIR"
    exit 0
fi

echo "Location: $BACKUP_DIR"
echo "Total: $(ls "$BACKUP_DIR"/erp_backup_*.sql.gz | wc -l) backup(s)"
echo ""
ls -lh "$BACKUP_DIR"/erp_backup_*.sql.gz | awk '{print $5, $6, $7, $8, $9}'
