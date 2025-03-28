# I Ching App Deployment Guide

This repository contains an I Ching divination application with a Python FastAPI backend and a React frontend. This guide explains how to deploy the application on Render.

## Project Structure

- `divination/` - FastAPI backend for I Ching divination
- `packages/frontend/` - React frontend application
- `render.yaml` - Render configuration file for automatic deployment

## Deployment on Render

### Prerequisites

1. [Render account](https://render.com/)
2. [Google AI API key](https://ai.google.dev/) for Gemini AI features (optional but recommended)

### Option 1: One-click Deployment

The easiest way to deploy is using the Blueprint defined in the `render.yaml` file.

1. Fork this repository to your own GitHub account
2. Log in to your Render account
3. Go to the Dashboard and click "New +"
4. Select "Blueprint"
5. Connect your GitHub account and select the forked repository
6. Click "Apply Blueprint"

Render will automatically set up both backend and frontend services.

### Option 2: Manual Deployment

#### Backend Deployment

1. In your Render dashboard, create a new Web Service
2. Link your GitHub repository
3. Use the following settings:
   - **Name**: iching-backend
   - **Runtime**: Python 3.11
   - **Build Command**: `cd divination && pip install poetry && poetry install`
   - **Start Command**: `cd divination && poetry run uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `ENVIRONMENT`: production
   - `PORT`: 8000

#### Frontend Deployment

1. In your Render dashboard, create another Web Service
2. Link the same GitHub repository
3. Use the following settings:
   - **Name**: iching-frontend
   - **Runtime**: Node
   - **Build Command**: `cd packages/frontend && npm install && npm run build`
   - **Start Command**: `cd packages/frontend && npm run preview -- --port $PORT --host 0.0.0.0`
4. Add environment variables:
   - `PORT`: 10000
   - `VITE_API_URL`: Your backend URL (e.g., https://iching-backend.onrender.com)
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API key

## Local Development

### Backend

```bash
cd divination
poetry install
poetry run uvicorn main:app --reload
```

### Frontend

```bash
cd packages/frontend
npm install
npm run dev
```

## Important Notes

- The frontend's `.env.production` file contains a placeholder API URL. This will be overridden by Render's environment variables.
- For the AI interpretation features to work, you need to provide a valid Google Gemini API key.
- CORS is configured to allow connections between the frontend and backend services.
