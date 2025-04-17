# I Ching API

A FastAPI backend for I Ching divination, supporting both the traditional yarrow stalk method and the three-coin method.

## Features

- Implements both yarrow stalk and three-coin divination methods
- Returns complete hexagram readings with judgments, images, and changing lines
- Includes trigram information for deeper understanding
- Supports reproducible readings via seed values

## Development Setup

This project uses modern Python development tools:

### Installation with UV (Recommended)

[UV](https://github.com/astral-sh/uv) is a fast Python package installer and resolver.

```bash
# Install UV if you don't have it
curl -sSf https://astral.sh/uv/install.sh | bash

# Install dependencies using UV
uv pip install -r requirements.txt
```

### Development Tools

- **Ruff**: Fast Python linter configured via `.ruff.toml`
- **MyPy**: Static type checking configured via `mypy.ini`
- **Pydantic**: Data validation via type annotations

### Running Checks

```bash
# Run Ruff linter
ruff check .

# Run MyPy type checker
mypy .

# Format code with Ruff
ruff format .
```

## Running the API

```bash
# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

- `GET /`: Root endpoint with API information
- `GET /health`: Health check endpoint
- `POST /cast`: Generate an I Ching reading
- `POST /reading/generate`: Alias for /cast for compatibility

## Example API Request

```json
{
  "mode": "yarrow",
  "seed": 12345,
  "verbose": false
}
```