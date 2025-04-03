# I Ching Divination Project

![I Ching](https://img.shields.io/badge/I%20Ching-Divination-blue)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack I Ching divination application with authentic yarrow stalk and three-coin methods, providing traditional readings with modern interpretations.

[Live Demo](https://iching-frontend.onrender.com) | [API Documentation](https://iching-backend.onrender.com/docs)

![I Ching App Preview](https://via.placeholder.com/800x400?text=I+Ching+App+Preview)

## Screenshots

### Hexagram Casting Interface
![Hexagram Casting Interface](https://via.placeholder.com/800x400?text=Hexagram+Casting+Interface)
*Interactive interface for casting hexagrams using traditional methods*

### Hexagram Reading Display
![Hexagram Reading Display](https://via.placeholder.com/800x400?text=Hexagram+Reading+Display)
*Detailed hexagram interpretations with changing lines*

### Mobile Experience
![Mobile Experience](https://via.placeholder.com/400x800?text=Mobile+Experience)
*Responsive design for on-the-go divination*

## Overview

This project provides an authentic I Ching divination experience through:

1. **Backend API**: A FastAPI-based REST service that implements both traditional yarrow stalk and three-coin divination methods with mathematically correct probability distributions

2. **Frontend Application**: A React-based user interface for casting and visualizing I Ching readings with traditional and modern interpretations

## Key Features

- **Authentic Divination Methods**
  - Traditional 50-stalk yarrow algorithm (6:25%, 7:31.25%, 8:43.75%, 9:18.75%)
  - Simplified three-coin method (6:12.5%, 7:37.5%, 8:37.5%, 9:12.5%)

- **Complete Hexagram System**
  - All 64 hexagrams with traditional interpretations
  - Changing lines and relating hexagram analysis
  - Trigram symbolism and relationships

- **Modern User Experience**
  - Interactive casting process
  - Visual hexagram representations with traditional symbolism
  - Optional AI-powered modern interpretations

## Project Structure

The project is organized into two main parts:

```
I-ching/
├── divination/           # Python FastAPI backend
└── packages/frontend/    # React frontend application
```

### Backend API

The [divination](/divination) directory contains a Python FastAPI application providing:

- RESTful endpoints for I Ching divination
- Mathematically accurate yarrow stalk and three-coin implementations
- Complete hexagram data and interpretations

### Frontend Application

The [packages/frontend](/packages/frontend) directory contains a React application with:

- Interactive hexagram visualization components
- Casting interface with divination method selection
- Reading interpretation display with both traditional and modern perspectives

## Getting Started

### Backend API

```bash
# Navigate to the API directory
cd divination

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python -m main
```

### Frontend Application

```bash
# Navigate to the frontend directory
cd packages/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## API Documentation

Once the API server is running, visit http://localhost:8000/docs for Swagger documentation.

## Deployment

The project includes configuration for multiple deployment options:

- **Docker**: `docker-compose up` to run both API and frontend
- **Heroku**: Ready to deploy with included Procfile
- **Render**: Configuration in render.yaml

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
