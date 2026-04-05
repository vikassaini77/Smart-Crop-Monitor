FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    gcc \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install
COPY requirements.txt .
COPY backend/requirements_prod.txt ./backend/
RUN pip install -r requirements.txt
RUN pip install -r backend/requirements_prod.txt

# Copy the backend code and models
COPY backend/ ./backend/
COPY best.pt /app/best.pt

# Expose FastAPI port
EXPOSE 8000

# Command gets overridden by docker-compose for worker/api
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
