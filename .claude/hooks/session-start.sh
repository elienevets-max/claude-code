#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install dependencies for the king-of-sparklers Next.js app
cd "$CLAUDE_PROJECT_DIR/king-of-sparklers"
npm install
