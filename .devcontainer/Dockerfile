FROM python:3.11-slim-bullseye

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy project files
COPY pyproject.toml poetry.lock ./
COPY app ./app

# Install dependencies
RUN poetry install --no-interaction --with dev

# Expose the port
EXPOSE 8000

# Set the user
USER vscode