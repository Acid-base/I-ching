#!/bin/bash

# Setup script for I-Ching project using uv package manager

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up I-Ching project with uv...${NC}"

# Create uv virtual environment if it doesn't exist
if [ ! -d "/workspaces/I-ching/backend/.venv" ]; then
  echo -e "${YELLOW}Creating Python virtual environment with uv...${NC}"
  cd /workspaces/I-ching/backend
  uv venv
  echo -e "${GREEN}Virtual environment created.${NC}"
else
  echo -e "${GREEN}Virtual environment already exists.${NC}"
fi

# Install backend dependencies with uv
echo -e "${YELLOW}Installing backend dependencies using uv...${NC}"
cd /workspaces/I-ching/backend
uv pip install -r requirements.txt
uv pip install uvicorn

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd /workspaces/I-ching/frontend
pnpm i

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To run the project:${NC}"
echo -e "${YELLOW}1. Run the development servers:${NC} cd /workspaces/I-ching/frontend && npm run dev:all"