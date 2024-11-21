FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .


RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*



RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

COPY best.pt .

EXPOSE 3000

CMD ["python", "app.py"]
