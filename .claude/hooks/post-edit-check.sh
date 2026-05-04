#!/bin/bash
# Runs astro check after .astro/.ts/.tsx file edits to catch errors early.
FILE_PATH=$(cat | jq -r '.tool_input.file_path // empty')
[[ "$FILE_PATH" != *.astro && "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0
OUTPUT=$(npx astro check 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  ERRORS=$(echo "$OUTPUT" | grep -A2 'error' | head -20)
  echo "$ERRORS" >&2
  exit 2
fi
