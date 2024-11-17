# Use an official Python image
FROM python:3.12

# Set the working directory
WORKDIR /app


RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential \
    curl \
    apt-utils \
    gnupg2 &&\
    rm -rf /var/lib/apt/lists/* && \
    pip install --upgrade pip 

RUN apt-get update 

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - 

RUN curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list 


RUN exit
RUN apt-get update
RUN env ACCEPT_EULA=Y apt-get install -y msodbcsql18 


# Copy requirement files
COPY requirements.txt requirements.txt

COPY /odbc.ini / 
RUN odbcinst -i -s -f /odbc.ini -l
RUN cat /etc/odbc.ini

# Install dependencies
RUN pip install -r requirements.txt

# Copy the app code
COPY . .

# Expose the port that Flask runs on (5000 by default)
EXPOSE 2000

# Run the Flask app
CMD ["python", "app.py"]
