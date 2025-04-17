#!/bin/bash
set -e

echo "Setting up I-Ching backend development environment..."

# Install uv
pip install uv

# Navigate to the backend directory
cd divination
# Create a virtual environment with uv
uv venv
# Activate the virtual environment
source .venv/bin/activate
# Install dependencies with uv
uv pip install -r requirements.txt

# Install development dependencies
uv pip install ruff mypy

# Create Python type stub directory if it doesn't exist
mkdir -p stubs

echo "Backend setup complete!"
echo "You can run linting with: cd divination && ruff check ."
echo "You can run type checking with: cd divination && mypy ."