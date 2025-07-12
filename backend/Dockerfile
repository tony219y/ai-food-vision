# ใช้ Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /code

# ติดตั้ง dependency
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดทั้งหมด
COPY ./app ./app

# Run FastAPI ด้วย Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
