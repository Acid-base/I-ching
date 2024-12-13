# I Ching Core

Core divination logic for the I Ching application.

## Overview

This package contains the core algorithms and utilities for I Ching divination, including:
- Yarrow stalk calculation
- Hexagram generation
- Line transformation logic

## Installation

```bash
poetry install
```

## Usage

```python
from iching_core.divination import generate_hexagram

# Generate a hexagram using the yarrow stalk method
hexagram = generate_hexagram()
print(f"Hexagram number: {hexagram.number}")
print(f"Changing lines: {hexagram.changing_lines}")
```

## Development

### Setup
```bash
# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

### Testing
```bash
poetry run pytest
```

### Linting and Type Checking
```bash
# Run linter
poetry run ruff check .

# Run type checker
poetry run mypy .
```

## API Reference

### `divination.py`

Contains the core divination logic:

- `generate_hexagram()`: Generates a hexagram using the yarrow stalk method
- `calculate_changing_lines()`: Determines which lines are changing
- `get_related_hexagram()`: Finds the related hexagram based on changing lines 