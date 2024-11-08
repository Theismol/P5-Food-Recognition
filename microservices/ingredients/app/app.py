from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from apscheduler.schedulers.background import BackgroundScheduler  
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from datetime import date
from datetime import timedelta

load_dotenv()

# Define your parameters
username = os.getenv('DB_username')
password = os.getenv('password')
server = os.getenv('server')
database = os.getenv('database')
driver = os.getenv('driver')

# Create the connection string
connection_string = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"

# Create an engine
engine = create_engine(connection_string)

app = Flask(__name__)
CORS(app)

# Configure database URI
app.config['SQLALCHEMY_DATABASE_URI'] = connection_string
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the APScheduler
scheduler = BackgroundScheduler(daemon=True)

# Initialize the database
db = SQLAlchemy(app)

# TABLES BASED ON THE STRUCTURE SEEN IN THE DATABASE
class Ingredient(db.Model):
    __tablename__ = 'Ingredients'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient = db.Column(db.String(45), nullable=False)
    Category = db.Column(db.String(45), db.ForeignKey('Expiry_dates.Category'))  # Foreign key to Expiry_dates
    Unit = db.Column(db.String(45), nullable=False)

class ExpiryDate(db.Model):
    __tablename__ = 'Expiry_dates'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Expiry = db.Column(db.Integer, nullable=True)  # Assuming expiry is a number of days
    Category = db.Column(db.String(45), unique=True, nullable=False)  # Unique constraint on Category
    
    # Relationship back to Ingredient
    Ingredients = db.relationship('Ingredient', backref='expiry_category', lazy=True)

class Stock(db.Model):
    __tablename__ = 'Stock'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), nullable=True)  # Foreign key to Ingredients
    Amount = db.Column(db.Integer, nullable=True)
    Expiry_date = db.Column(db.Date, nullable=True)
    Days_in_Stock = db.Column(db.Integer, nullable=True)
    
    # Relationship back to Ingredient
    Ingredient = db.relationship('Ingredient', backref='stock_entries', lazy=True)


# Helper function to calculate Days_in_Stock
def calculate_days_in_stock(expiry_date):
    return (expiry_date - date.today()).days if expiry_date else None


# Add stock function
@app.route('/stock', methods=['POST'])
def add_stock():
    data = request.get_json()
    try:
        # Check if Expiry Date is provided
        expiry_date = None
        if 'Expiry_date' in data:
            expiry_date = date.fromisoformat(data['Expiry_date'])
        else:
            # No expiry date provided, look it up based on the Category from Ingredients
            ingredient = Ingredient.query.get(data['Ingredient_id'])
            if not ingredient:
                return jsonify({"error": "Ingredient not found"}), 404

            # Fetch the expiry date based on the Category of the Ingredient
            expiry_entry = ExpiryDate.query.filter_by(Category=ingredient.Category).first()
            if expiry_entry:
                expiry_date = date.today() + timedelta(days=expiry_entry.Expiry)  # Calculate expiry based on days
            else:
                return jsonify({"error": "No expiry date found for the ingredient category"}), 404

        # Calculate Days in Stock
        days_in_stock = calculate_days_in_stock(expiry_date)

        # Create new stock entry
        new_stock = Stock(
            Ingredient_id=data['Ingredient_id'],
            Amount=data['Amount'],
            Expiry_date=expiry_date,
            Days_in_Stock=days_in_stock
        )
        
        db.session.add(new_stock)
        db.session.commit()

        return jsonify({"message": "Stock added successfully"}), 201
    except Exception as e:
        return jsonify({"error": "Failed to add stock", "details": str(e)}), 500


# Get stock function (combine Stock and Ingredient data)
@app.route('/stock', methods=['GET'])
def get_stock():
    try:
        # Perform a join between Stock and Ingredient based on the Ingredient_id foreign key
        stocks = db.session.query(
            Stock.id,
            Stock.Ingredient_id,
            Stock.Amount,
            Stock.Expiry_date,
            Stock.Days_in_Stock,
            Ingredient.Unit
        ).join(Ingredient, Stock.Ingredient_id == Ingredient.id).all()

        # Prepare the response data
        stock_data = []
        for stock in stocks:
            stock_data.append({
                'id': stock.id,
                'Ingredient_id': stock.Ingredient_id,
                'Amount': stock.Amount,
                'Expiry_date': stock.Expiry_date,
                'Days_in_Stock': stock.Days_in_Stock,
                'Unit': stock.Unit
            })

        return jsonify(stock_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch stock", "details": str(e)}), 500


# Edit stock function
@app.route('/stock/<int:id>', methods=['PUT'])
def edit_stock(id):
    data = request.get_json()
    stock = Stock.query.get(id)
    if not stock:
        return jsonify({"error": "Stock item not found"}), 404

    try:
        # Update Quantity (Amount) if provided
        if 'Amount' in data:
            stock.Amount = data['Amount']
        
        # Update Expiry Date if provided
        if 'Expiry_date' in data:
            stock.Expiry_date = date.fromisoformat(data['Expiry_date'])
        else:
            # If no Expiry date is provided, look it up based on the Category of the Ingredient
            ingredient = stock.Ingredient
            if ingredient:
                expiry_entry = ExpiryDate.query.filter_by(Category=ingredient.Category).first()
                if expiry_entry:
                    stock.Expiry_date = date.today() + timedelta(days=expiry_entry.Expiry)
        
        # Recalculate Days_in_Stock
        if stock.Expiry_date:
            stock.Days_in_Stock = calculate_days_in_stock(stock.Expiry_date)

        db.session.commit()
        return jsonify({"message": "Stock updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update stock", "details": str(e)}), 500


# Function to remove expired stock
def remove_expired_stock():
    today = date.today()
    expired_stocks = Stock.query.filter(Stock.Expiry_date < today).all()

    for stock in expired_stocks:
        try:
            db.session.delete(stock)
            db.session.commit()
            print(f"Removed expired stock item with ID {stock.id}.")
        except Exception as e:
            print(f"Error removing expired stock {stock.id}: {e}")
            db.session.rollback()

# Background task to update Days_in_Stock for all stock items
def update_days_in_stock_task():
    today = date.today()
    stocks = Stock.query.all()
    for stock in stocks:
        if stock.Expiry_date:
            stock.Days_in_Stock = calculate_days_in_stock(stock.Expiry_date)
    
    try:
        db.session.commit()
        print("Updated Days_in_Stock for all stock items.")
    except Exception as e:
        db.session.rollback()
        print(f"Error updating Days_in_Stock: {e}")


# Schedule the task to run daily
scheduler.add_job(update_days_in_stock_task, 'interval', days=1)
scheduler.start()

if __name__ == '__main__':
    app.run(debug=True)


