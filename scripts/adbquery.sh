#!/bin/bash

# 사용법: ./measure_sql_time.sh path/to/database.db path/to/query.sql

DB_PATH="$1"
QUERY_PATH="$2"
OUTPUT_TRACE="$3"
if [[ ! -f "$DB_PATH" ]]; then
  echo "no db"
  exit 1
fi

if [[ ! -f "$QUERY_PATH" ]]; then
  echo "no query"
  exit 1
fi
if [[ -z "$OUTPUT_TRACE" ]]; then
  echo "no output trace file specified"
  exit 1
fi
echo 1 > /sys/kernel/tracing/events/block/block_rq_issue/enable
echo 1 > /sys/kernel/tracing/events/block/block_rq_complete/enable
#echo 'sqlite_ovflow*' > /sys/kernel/tracing/set_ftrace_filter
# 실행 시간 측정

echo 3 > /proc/sys/vm/drop_caches
echo > /sys/kernel/tracing/trace
echo 1 > /sys/kernel/tracing/tracing_on
time /data/local/sqlite_vanilla "$DB_PATH" < "$QUERY_PATH" > /dev/null
echo 0 > /sys/kernel/tracing/tracing_on

#cat /sys/kernel/tracing/trace |  grep 'sqlite_' > /data/local/tmp/sqlite_trace.txt
cat /sys/kernel/tracing/trace | grep -E '^[[:space:]]*sqlite_|^[[:space:]]*<idle>-' > "$OUTPUT_TRACE"

