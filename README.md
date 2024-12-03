# I Ching Divination Tool

A modern web application for I Ching divination using the traditional Yarrow Stalk method.

## Features

- **Traditional Yarrow Stalk Method**: Implements the authentic divination process with correct probabilities
- **Modern Web Interface**: Clean, responsive design with elegant animations
- **Accurate Hexagram Generation**: Proper implementation of changing lines and hexagram calculation
- **RESTful API**: FastAPI backend for easy integration with other applications

## Requirements

- Python 3.8 or higher
- Poetry (package manager)
- Docker (optional, for development container)

## Installation

1. Install Poetry (package manager):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Clone the repository:
```bash
git clone https://github.com/yourusername/iching.git
cd iching
```

3. Install dependencies:
```bash
poetry install
```

## Usage

1. Start the development server:
```bash
poetry run uvicorn iching.main:app --reload
```

2. Open your browser to `http://localhost:8000`

## Development

This project uses modern Python development tools:

- **Poetry**: Dependency management and packaging
- **FastAPI**: Modern web framework
- **Ruff**: Fast Python linter and formatter
- **Mypy**: Static type checking

### Development Container

This project includes a development container configuration for VS Code, which provides:
- Pre-configured Python environment
- All required dependencies
- Automatic code formatting and linting
- Integrated debugging

To use it:
1. Install Docker and VS Code
2. Install the "Remote - Containers" extension in VS Code
3. Open the project in VS Code and click "Reopen in Container"

### Code Quality

Format and lint code:
```bash
# Format code
poetry run ruff format .

# Lint code
poetry run ruff check .

# Type check
poetry run mypy .
```

## API Documentation

### Endpoints

#### GET /
Returns the main web interface.

**Response**: HTML page

#### POST /reading
Generates a new I Ching reading.

**Response**:
```json
{
    "hexagram_number": 1,
    "changing_lines": [3, 6],
    "lines": [1, 1, 0, 1, 1, 1],
    "reading": "The Creative. Success through persistence..."
}
```

For full API documentation, visit `/docs` when the server is running.

## Project Structure

```
iching/
├── core.py         # Core hexagram generation logic
├── interpreter.py  # I Ching text interpretation
├── main.py        # FastAPI application
├── scraper.py     # Web scraper for I Ching texts
└── static/        # Frontend assets
    ├── index.html
    ├── style.css
    └── script.js
```

## Implementation Details

### Yarrow Stalk Method

The application implements the traditional Yarrow Stalk method, which provides different probabilities than the simpler coin method:

- Old Yin (6): 1/16
- Young Yang (7): 5/16
- Young Yin (8): 7/16
- Old Yang (9): 3/16

### Hexagram Generation

Each hexagram is built from bottom to top using six lines. Changing lines (6 or 9) indicate transformation between hexagrams.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Format and lint your code
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the traditional I Ching divination system
- Inspired by various I Ching translations and interpretations
- Thanks to the open-source community for the excellent tools and libraries
