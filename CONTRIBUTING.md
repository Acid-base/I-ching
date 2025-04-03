# Contributing to I Ching Divination Project

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Development Setup

#### Backend (Python FastAPI)

```bash
# Navigate to the API directory
cd divination

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest
```

#### Frontend (React)

```bash
# Navigate to the frontend directory
cd packages/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Coding Style Guidelines

### Python

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guidelines
- Use docstrings for all functions, classes, and modules
- Use type hints whenever possible
- We use `ruff` for linting and formatting

### TypeScript/React

- We use the Airbnb JavaScript Style Guide
- Use functional components with hooks
- Use TypeScript interfaces for props and state
- Keep components small and focused on a single responsibility
- We use ESLint for linting and Prettier for formatting

## Testing

- Write tests for all new features and bug fixes
- Aim for at least 80% code coverage
- Backend: Use pytest for Python code
- Frontend: Use Vitest for React components

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
