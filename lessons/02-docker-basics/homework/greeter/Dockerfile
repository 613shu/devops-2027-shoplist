# Greeter service image
FROM python:3.12-slim

# Avoid .pyc files and make logs appear immediately
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    GREETING=Hello

WORKDIR /app

# Install dependencies first to benefit from layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app.py .

# Run as a non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

CMD ["python", "app.py"]
