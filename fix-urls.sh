#!/bin/bash
set -e
HOST="${PUBLIC_HOST:-localhost}"
find /home/computeruse -type f \
  -not -path "/home/computeruse/.pyenv/*" \
  -exec sed -i "s#http://localhost#https://${HOST}#g; s#http://127.0.0.1#https://${HOST}#g" {} + 2>/dev/null || true
exec /home/computeruse/entrypoint.sh
