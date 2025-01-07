# I Ching API

This project provides an API for generating and interpreting I Ching readings, leveraging both traditional methods and modern AI.

## Project Structure

The project is structured as a monorepo using `pnpm` and consists of the following packages:

-   `packages/api`: Contains the API server built with Node.js, Express, and TypeScript.
-   `packages/core`: Contains the core logic for generating I Ching readings using Python.
-   `packages/web`: (Not included in the provided code, but would be the location for a web client if one were to be built)

## API Package (`packages/api`)

### Overview

The API package is a Node.js server built with Express and TypeScript. It provides endpoints for:

-   Generating I Ching readings using a Python script.
-   Retrieving hexagram data.
-   Interpreting readings using AI.
-   Providing a chat interface for I Ching consultation.
-   Serving OpenAPI documentation.

### Key Components

-   **`src/server.ts`**: The main entry point for the API server.
-   **`src/routes/`**: Contains the route definitions for different API endpoints.
    -   `index.ts`: Main router that aggregates all other routes.
    -   `hexagram.ts`: Routes for generating readings and retrieving hexagram data.
    -   `chat.ts`: Routes for chat-based I Ching consultation.
    -   `interpretation.ts`: Routes for AI-powered interpretations.
-   **`src/controllers/`**: Contains the controller logic for handling API requests.
    -   `readingController.ts`: Handles requests related to generating and retrieving readings.
    -   `chatController.ts`: Handles requests related to chat interactions.
    -   `interpretationController.ts`: Handles requests related to AI interpretations.
-   **`src/services/`**: Contains the business logic for the API.
    -   `hexagramService.ts`: Logic for generating readings and retrieving hexagram data.
    -   `chatService.ts`: Logic for handling chat interactions.
    -   `aiService.ts`: Logic for AI-powered interpretations.
-   **`src/lib/`**: Contains utility functions and AI integration logic.
    -   `gemini.ts`: Integration with Google Gemini for AI interpretations.
    -   `genai.ts`:  Integration with Google Gemini for AI interpretations.
    -   `prompts.ts`: Defines prompts for the AI model.
-   **`src/types/`**: Contains TypeScript type definitions.
    -   `index.ts`: Defines the main types for the API.
    -   `schemas.ts`: Defines Zod schemas for data validation.
    -   `hexagram.ts`: Defines types related to hexagram data.
-   **`src/middleware/`**: Contains middleware functions.
    -   `errorHandler.ts`: Handles errors and provides consistent error responses.
-   **`src/config/`**: Contains configuration files.
    -   `express.ts`: Configures the Express app.

### API Endpoints

-   `GET /api/health`: Health check endpoint.
-   `GET /api/hexagrams/:number`: Get a specific hexagram by its number.
-   `POST /api/hexagrams/generate`: Generate a new I Ching reading.
-   `POST /api/interpret/hexagram`: Get an AI interpretation of a hexagram.
-   `POST /api/interpret/line`: Get an AI interpretation of a specific line.
    `POST /api/interpret/comprehensive`: Get a comprehensive AI interpretation of a reading.
-   `POST /api/chat/start`: Start a new chat session.
-   `POST /api/chat/message`: Send a message to the chat.
    `POST /api/chat/enhanced`: Get an enhanced AI interpretation of a hexagram.
-   `GET /api-docs`: OpenAPI documentation.

### Technologies Used

-   Node.js
-   Express
-   TypeScript
-   Zod (for data validation)
-   Google Gemini API
-   Python (for core divination logic)
-   Swagger UI (for API documentation)

## Core Package (`packages/core`)

### Overview

The core package contains the Python script (`divination.py`) responsible for generating I Ching readings using either the yarrow stalk or coin method.

### Key Components

-   **`src/divination.py`**: Python script that implements the I Ching divination logic.
-   **`src/data/readings.json`**: JSON file containing the data for all 64 hexagrams.

### Technologies Used

-   Python

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   pnpm (v8 or higher)
-   Python 3.6 or higher
-   Google Gemini API Key
-   A `.env` file in the `packages/api` directory with the following variables:
    -   `GEMINI_API_KEY=<your_gemini_api_key>`

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```
2.  Install dependencies:

    ```bash
    pnpm install
    ```

### Running the API Server

1.  Navigate to the `packages/api` directory:

    ```bash
    cd packages/api
    ```
2.  Start the server:

    ```bash
    pnpm dev
    ```

    The server will start at `http://localhost:3000`.

### Accessing the API Documentation

Open your browser and go to `http://localhost:3000/api-docs` to view the OpenAPI documentation.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear messages.
4.  Push your branch to your fork.
5.  Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).