#!/bin/bash
# Simple script to serve the frontend on Render
PORT="${PORT:-10000}"
npm run preview -- --port $PORT --host 0.0.0.0
