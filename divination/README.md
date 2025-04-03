# I Ching API

An authentic I Ching divination API implementing both the traditional yarrow stalk method and the three-coin method, with complete hexagram readings and interpretations.

## Features

- **Authentic Divination Methods**:
  - Traditional yarrow stalk algorithm with correct probability distribution (6:25%, 7:31.25%, 8:43.75%, 9:18.75%)
  - Three-coin method with its distinct probability distribution (6:12.5%, 7:37.5%, 8:37.5%, 9:12.5%)

- **Complete Hexagram System**:
  - Full 64 hexagram interpretations with traditional meanings
  - Primary and relating (transformed) hexagram readings
  - Changing line interpretations
  - Trigram analysis

- **Modern API Design**:
  - RESTful API built with FastAPI
  - Comprehensive endpoint documentation with Swagger UI
  - Structured JSON responses
  - Cross-Origin Resource Sharing (CORS) support

## API Usage

### Endpoints

- `GET /`: API information
- `GET /health`: Health check endpoint
- `POST /cast`: Generate a new I Ching reading

### Example Request

```json
{
  "mode": "yarrow",  // or "coins"
  "seed": null,      // optional for reproducible results
  "verbose": false   // whether to include detailed output
}
```

### Example Response

```json
{
  "hexagram_number": 1,
  "changing_lines": [2, 5],
  "lines": ["7", "6", "7", "7", "6", "7"],
  "reading": {
    "number": 1,
    "name": "The Creative",
    "chineseName": "乾 (qián)",
    "judgment": "THE CREATIVE works sublime success, furthering through perseverance.",
    "image": "The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.",
    "lines": [...]
  },
  "relating_hexagram": {
    "number": 44,
    "name": "Coming to Meet",
    "chineseName": "姤 (gòu)",
    "judgment": "COMING TO MEET. The maiden is powerful. One should not marry such a maiden.",
    "image": "Under heaven, wind: The image of COMING TO MEET. Thus does the prince act when disseminating his commands and proclaiming them to the four quarters of heaven."
  }
}
```

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

## Running the Application

### Run the API server

```bash
# Start the FastAPI server
python -m divination.main
```

The API will be available at http://localhost:8000

For API documentation, visit http://localhost:8000/docs

### Run with Docker

```bash
# Build the Docker image
docker build -t i-ching-api .

# Run the container
docker run -p 8000:8000 i-ching-api
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

## Technical Details

### Probability Distributions

The implementation correctly follows the probability distributions of both divination methods:

#### Yarrow Stalk Method
- Old Yin (6): 1/16 (6.25%)
- Young Yang (7): 5/16 (31.25%)
- Young Yin (8): 7/16 (43.75%)
- Old Yang (9): 3/16 (18.75%)

#### Three Coins Method
- Old Yin (6): 2/16 (12.5%)
- Young Yang (7): 6/16 (37.5%)
- Young Yin (8): 6/16 (37.5%)
- Old Yang (9): 2/16 (12.5%)

### Project Structure

```
I-ching/
├── divination/                # API server
│   ├── main.py                # FastAPI application
│   ├── core/                  # Core functionality
│   │   ├── yarrow.py          # Yarrow stalk algorithm
│   │   └── coins.py           # Three coins algorithm
│   ├── models/                # Data models
│   │   └── schemas.py         # Pydantic models
│   ├── data/                  # Data files
│   │   └── hexagrams.json     # Hexagram definitions
│   └── tests/                 # Test suite
│       ├── test_probability.py
│       └── test_yarrow.py
├── packages/                  # Frontend components
│   └── frontend/              # React frontend
└── requirements.txt           # Dependencies
```

## Frontend Components

The project includes a React frontend for visualizing I Ching readings with components for:

- Hexagram display with traditional styling
- Changing line animations
- Trigram visualization
- Reading interpretations
- Optional AI-powered modern interpretations

To run the frontend:

```bash
cd packages/frontend
npm install
npm run dev
```

## Deployment

The project includes configuration for easy deployment to various platforms:

- Dockerfile for containerized deployment
- Procfile for Heroku
- render.yaml for Render

## License

[MIT License](LICENSE)
