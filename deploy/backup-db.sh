#!/bin/sh
# Scheduled PostgreSQL backup for the VPS. PostgreSQL runs as a container
# with a named volume on the same VM as `api` (not a managed database — see
# PRD.md bagian 16, "Decision change — deployment architecture"), so there
# is no backup provided automatically by a hosting platform: this script is
# it.
#
# Install (once, on the VPS):
#   cp deploy/backup-db.sh ~/solo-outreach-pipeline/backup-db.sh
#   chmod +x ~/solo-outreach-pipeline/backup-db.sh
#   crontab -e
#   # add: 0 2 * * * /home/<user>/solo-outreach-pipeline/backup-db.sh >> /home/<user>/backups/backup.log 2>&1
#
# Restore from a backup:
#   gunzip -c ~/backups/backup-<timestamp>.sql.gz | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'

set -eu

cd "$(dirname "$0")"

BACKUP_DIR="$HOME/backups"
KEEP_DAYS=7
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILENAME="$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# POSTGRES_USER / POSTGRES_DB are read from inside the `db` container's own
# environment (already set via docker-compose.yaml) — not re-parsed from
# .env here, so this can't drift out of sync with what the container
# actually uses.
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$FILENAME"

echo "$(date '+%Y-%m-%d %H:%M:%S') backup saved: $FILENAME ($(du -h "$FILENAME" | cut -f1))"

# Keep only the last $KEEP_DAYS days — a 20 GB disk (see PRD.md bagian 16)
# has plenty of room for this app's data at solo/demo scale, but backups
# would still accumulate forever without this.
find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime "+$KEEP_DAYS" -delete
