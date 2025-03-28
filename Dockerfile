FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY divination/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY divination/ .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
