# I Ching Divination Tool

A modern web application for I Ching divination using the traditional Yarrow Stalk method.

## Features

- **Traditional Yarrow Stalk Method**: Implements the authentic divination process with correct probabilities
- **Modern Web Interface**: Clean, responsive design built with React and Chakra UI
- **AI-Powered Interpretation**: Contextual interpretations using Google's Generative AI
- **Real-time Chat**: Interactive consultation with AI for deeper insights
- **Type-Safe**: Full TypeScript implementation with Zod validation

## Tech Stack

### Frontend
- React 18 with TypeScript
- Chakra UI for modern, accessible components
- TanStack Query for server state management
- Vite for fast development and building
- Vitest for testing

### Backend
- Express.js with TypeScript
- Google Generative AI integration
- Python integration for hexagram calculations
- Zod for runtime type validation

### Python Core
- Core divination logic in Python
- Hexagram generation and interpretation
- Poetry for dependency management

### Development Tools
- pnpm for fast, efficient package management
- ESLint and Prettier for code quality
- Husky for git hooks
- Concurrently for running multiple services

## Project Structure

```
I-ching/
├── packages/
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── core/             # Python core logic
│       ├── src/
│       │   ├── __init__.py
│       │   ├── divination.py     # Core divination & interpretation
│       │   └── data/            # I Ching text data
│       │       └── readings.json
│       ├── tests/
│       │   └── test_divination.py
│       ├── pyproject.toml
│       └── README.md
│
├── package.json          # Root package.json
└── README.md
```

## Getting Started

1. Install dependencies:
```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd packages/core
poetry install
```

2. Start development servers:
```bash
pnpm dev:all
```

This will start:
- Frontend at http://localhost:3000
- API at http://localhost:8000

## Development

### Prerequisites
- Node.js 18+
- pnpm
- Python 3.8+
- Poetry (Python package manager)

### Environment Variables
Create `.env` files in both packages:

```env
# packages/api/.env
GOOGLE_API_KEY=your_api_key
PYTHON_PATH=./packages/core/src
PYTHONPATH=${PYTHON_PATH}

# packages/frontend/.env
VITE_API_URL=http://localhost:8000
```

### Running Tests
```bash
# Run frontend tests
cd packages/frontend
pnpm test

# Run API tests
cd packages/api
pnpm test

# Run Python tests
cd packages/core
poetry run pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests and linting
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the traditional I Ching divination system
- Powered by Google's Generative AI for interpretations
- Thanks to the open-source community for the excellent tools and libraries
