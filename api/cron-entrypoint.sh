#!/bin/sh
set -eu

schedule="${PREWARM_CRON:-*/30 * * * *}"
cron_file="/tmp/prewarm.cron"

env_vars="CACHE_DIR SCAN_CACHE_TTL ESI_SLEEP ESI_RETRIES ESI_TIMEOUT PREWARM_OUTPUT_DIR PREWARM_STATUS_FILE PREWARM_HISTORY_FILE PREWARM_LOCK_FILE PREWARM_START_SYSTEMS PREWARM_MAX_JUMPS PREWARM_SAMPLE_SIZE PREWARM_TYPES_PAGES PREWARM_ORDER_PAGES PREWARM_HOME_ORDER_PAGES PREWARM_LIMIT PREWARM_MIN_SECURITY PREWARM_MIN_MARGIN PREWARM_MAX_RUNTIME PREWARM_BUDGET PREWARM_MODE PREWARM_SAMPLE_SEED PREWARM_FORCE PREWARM_RETRY_EMPTY PREWARM_TUNE PREWARM_CARGO_M3 PREWARM_MIN_PROFIT_PER_JUMP PREWARM_MIN_RESULTS PREWARM_FALLBACK_MAX_JUMPS PREWARM_FALLBACK_MIN_SECURITY"

{
  echo "SHELL=/bin/sh"
  echo "PATH=/usr/local/bin:/usr/bin:/bin"
  for var in $env_vars; do
    value="$(printenv "$var" 2>/dev/null || true)"
    if [ -n "$value" ]; then
      escaped=$(printf '%s' "$value" | sed 's/"/\\"/g')
      printf '%s="%s"\n' "$var" "$escaped"
    fi
  done
  echo "$schedule /usr/local/bin/python /app/prewarm_once.py >> /proc/1/fd/1 2>/proc/1/fd/2"
} > "$cron_file"

crontab "$cron_file"
rm -f "$cron_file"

run_on_start="${PREWARM_RUN_ON_START:-0}"
case "$run_on_start" in
  1|true|yes)
    /usr/local/bin/python /app/prewarm_once.py >> /proc/1/fd/1 2>/proc/1/fd/2 || true
    ;;
esac

exec cron -f
