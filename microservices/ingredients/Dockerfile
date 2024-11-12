# Use an official Python image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy requirement files
COPY requirements.txt requirements.txt

# Install dependencies
RUN pip install -r requirements.txt

# Copy the app code
COPY . .

# Expose the port that Flask runs on (5000 by default)
EXPOSE 3000

# Run the Flask app
CMD ["python", "app.py"]
