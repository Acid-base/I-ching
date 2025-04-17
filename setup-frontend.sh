#!/bin/bash
set -e

echo "Setting up I-Ching frontend development environment..."

# Install pnpm if not installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Navigate to the frontend directory
cd packages/frontend

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    pnpm init
fi

# Install Vite, TypeScript, ESLint, Prettier, and Zod
pnpm add -D vite typescript @types/node
pnpm add -D eslint eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
pnpm add zod

echo "Frontend dependencies installed!"