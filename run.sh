#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo "${BOLD}  iMessage Wrapped${NC}"
echo "  Your iMessage history, beautifully visualized"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "${RED}  Node.js is not installed.${NC}"
  echo "  Install it from https://nodejs.org/ or with Homebrew:"
  echo "    brew install node"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "${RED}  Node.js 18+ is required. You have $(node -v).${NC}"
  echo "  Update via: brew upgrade node"
  exit 1
fi
echo "${GREEN}  Node.js $(node -v)${NC}"

# Check iMessage database access
DB_PATH="$HOME/Library/Messages/chat.db"
if [ ! -r "$DB_PATH" ]; then
  echo ""
  echo "${YELLOW}  Cannot read iMessage database.${NC}"
  echo ""
  echo "  Grant Full Disk Access to your terminal app:"
  echo "    1. Open System Settings > Privacy & Security > Full Disk Access"
  echo "    2. Toggle ON your terminal app (Terminal, iTerm2, etc.)"
  echo "    3. Restart your terminal and run this script again"
  echo ""
  exit 1
fi
echo "${GREEN}  iMessage database accessible${NC}"

# Install dependencies
echo ""
echo "  Installing dependencies..."
npm run install:all --silent 2>&1 | tail -1
echo "${GREEN}  Dependencies installed${NC}"

# Start app
echo ""
echo "${GREEN}  Starting iMessage Wrapped...${NC}"
echo "    Open: ${BOLD}http://localhost:5173${NC}"
echo ""

# Open browser after a short delay
(sleep 3 && open http://localhost:5173) &

npm run dev
