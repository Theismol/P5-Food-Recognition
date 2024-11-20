# Use the Python 3.12 slim image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ACCEPT_EULA=Y

# Set working directory inside the container
WORKDIR /app

# Install system dependencies for pyodbc and ODBC Driver 18
RUN apt-get update && apt-get install -y \
    build-essential \
    unixodbc \
    unixodbc-dev \
    libssl-dev \
    curl \
    gnupg \
    apt-transport-https \
    && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update && apt-get install -y \
    msodbcsql18 \
    mssql-tools18 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add mssql-tools to PATH
ENV PATH="/opt/mssql-tools18/bin:$PATH"

# Install Python packages
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into the container
COPY . /app/

# Expose the Flask application's port
EXPOSE 3000

# Set the default command to run the Flask application
CMD ["python", "app.py"]

