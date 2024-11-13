import pyodbc
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
# Define your parameters
username = os.getenv('username')
password = os.getenv('password')
server = os.getenv('server') 
database = os.getenv('database')
driver = os.getenv('driver')

# Create the connection string
connection_string = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"

# Create an engine
engine = create_engine(connection_string)

# Check connection
try:
    with engine.connect() as connection:
        print("Connected to the database!")
except Exception as e:
    print("Connection failed:", e)

# Run a query
with engine.connect() as connection:
    result = connection.execute(text("SELECT * from Ingredients"))
    for row in result:
        print(row)

