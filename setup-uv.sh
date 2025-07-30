#!/bin/bash

# Setup script for I-Ching project using uv package manager

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed${NC}"
        exit 1
    fi
}

# Check required commands
check_command "uv"
check_command "pnpm"

echo -e "${GREEN}Setting up I-Ching project with uv...${NC}"

# Set the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create uv virtual environment if it doesn't exist
if [ ! -d "${PROJECT_ROOT}/backend/.venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment with uv...${NC}"
    cd "${PROJECT_ROOT}/backend"
    uv venv
    echo -e "${GREEN}Virtual environment created.${NC}"
else
    echo -e "${GREEN}Virtual environment already exists.${NC}"
fi

# Install backend dependencies with uv
echo -e "${YELLOW}Installing backend dependencies using uv...${NC}"
cd "${PROJECT_ROOT}/backend"
source .venv/bin/activate
uv pip install -r requirements.txt
uv pip install "uvicorn[standard]" python-dotenv google-genai httpx

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd "${PROJECT_ROOT}/frontend"
pnpm install

# Create .env file if it doesn't exist
if [ ! -f "${PROJECT_ROOT}/backend/.env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > "${PROJECT_ROOT}/backend/.env" << EOL
GEMINI_API_KEY=your-api-key-here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOL
    echo -e "${GREEN}.env file created. Please update with your actual API key.${NC}"
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To run the project:${NC}"
echo -e "${YELLOW}1. Backend: cd ${PROJECT_ROOT}/backend && uvicorn main:app --reload${NC}"
echo -e "${YELLOW}2. Frontend: cd ${PROJECT_ROOT}/frontend && pnpm dev${NC}"
