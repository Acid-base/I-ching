# I Ching API

An API for I Ching divination using the traditional yarrow stalk method.

## Features

- Authentic yarrow stalk divination method
- Complete hexagram readings with interpretations
- RESTful API with FastAPI

## Installation

### Using uv (recommended)

```bash
# Install uv if you don't have it
curl -sSf https://install.ultramarine.dev | python3 -

# Clone the repository
git clone https://github.com/yourusername/I-ching.git
cd I-ching

# Create and activate virtual environment
uv venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### Using pip

```bash
# Clone the repository
git clone https://github.com/yourusername/I-ching.git
cd I-ching

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Run the API server

```bash
python -m divination.main
```

The API will be available at http://localhost:8000

### API Endpoints

- `GET /`: API information
- `POST /cast`: Generate a new I Ching reading

Example request:
```json
{
  "mode": "yarrow",
  "seed": null,
  "verbose": false
}
```

## Development

```bash
# Install dev dependencies
uv pip install -r requirements-dev.txt

# Run tests
pytest

# Run linting
ruff check .
```

## Project Structure

```
I-ching/
├── README.md               # Project documentation
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
├── Dockerfile              # Container definition
├── divination/
│   ├── __init__.py
│   ├── main.py             # FastAPI application
│   ├── core/               # Core functionality
│   │   ├── __init__.py
│   │   └── yarrow.py       # Yarrow stalk divination
│   ├── models/             # Data models
│   │   ├── __init__.py
│   │   └── schemas.py      # Pydantic models
│   ├── data/               # Data directory
│   │   └── hexagrams.json  # Hexagram definitions
│   └── tests/              # Test suite
│       ├── test_api.py
│       ├── test_probability.py
│       └── test_yarrow.py
```

## License

[MIT License](LICENSE)
