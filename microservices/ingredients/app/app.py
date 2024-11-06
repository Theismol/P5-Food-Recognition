from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

# Define your parameters
username = os.getenv('DB_username')
password = os.getenv('password')
server = os.getenv('server')
database = os.getenv('database')
driver = os.getenv('driver')

print(f"Username: {username}, Password: {password}, Server: {server}, Database: {database}, Driver: {driver}")  # Debugging line

# Create the connection string
connection_string = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"

# Create an engine
engine = create_engine(connection_string)

app = Flask(__name__)
CORS(app)

# Configure database URI
app.config['SQLALCHEMY_DATABASE_URI'] = connection_string
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# TABLES BASED ON THE STRUCTURE SEEN IN THE DATABASE
class Ingredient(db.Model):
    __tablename__ = 'Ingredients'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient = db.Column(db.String(45), nullable=False)
    Category = db.Column(db.String(45), db.ForeignKey('Expiry_dates.Category')) 

class ExpiryDate(db.Model):
    __tablename__ = 'Expiry_dates'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Expiry = db.Column(db.Integer, nullable=True)
    Category = db.Column(db.String(45), unique=True, nullable=False)  # Unique constraint on Category
    
    #Relationship back to Ingredient
    Ingredients = db.relationship('Ingredient', backref='expiry_category', lazy=True)

class Stock(db.Model):
    __tablename__ = 'Stock'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), nullable=True)  # Foreign key to Ingredients
    Amount = db.Column(db.Integer, nullable=True)  
    Unit = db.Column(db.String(7), nullable=True)  

    #Relationship back to Ingredient
    Ingredient = db.relationship('Ingredient', backref='stock_entries', lazy=True)

# Helper function for validating ingredient data
def validate_ingredient_data(data):
    required_fields = ["Ingredient", "Category"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    return True


# CRUD Endpoints
@app.route('/ingredients', methods=['GET'])
def get_ingredients():
    ingredients = Ingredient.query.all()
    return jsonify([{
        'id': ing.id,
        'Ingredient': ing.Ingredient, 
        'Category': ing.Category  
    } for ing in ingredients])

@app.route('/ingredients', methods=['POST'])
def add_ingredient():
    data = request.get_json()
    try:
        validate_ingredient_data(data)  
        new_ingredient = Ingredient(
            Ingredient=data['Ingredient'],  
            Category=data['Category'] 
        )
        db.session.add(new_ingredient)
        db.session.commit()
        return jsonify({"message": "Ingredient added successfully"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to add ingredient"}), 500

@app.route('/ingredients/<int:id>', methods=['PUT'])
def edit_ingredient(id):
    data = request.get_json()
    try:
        validate_ingredient_data(data)
        ingredient = Ingredient.query.get(id)
        if not ingredient:
            return jsonify({"error": "Ingredient not found"}), 404

        ingredient.Ingredient = data['Ingredient']  
        ingredient.Category = data['Category']  
        db.session.commit()
        return jsonify({"message": "Ingredient updated successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to update ingredient"}), 500

@app.route('/ingredients/<int:id>', methods=['DELETE'])
def remove_ingredient(id):
    ingredient = Ingredient.query.get(id)
    if not ingredient:
        return jsonify({"error": "Ingredient not found"}), 404
    try:
        db.session.delete(ingredient)
        db.session.commit()
        return jsonify({"message": "Ingredient deleted successfully"}), 204
    except Exception as e:
        return jsonify({"error": "Failed to delete ingredient"}), 500


# Stock Endpoints
@app.route('/stock', methods=['GET'])
def get_stock():
    stock_items = Stock.query.all()
    return jsonify([{
        'id': stock.id,
        'Ingredient_id': stock.Ingredient_id, 
        'Amount': stock.Amount,  
        'Unit': stock.Unit  
    } for stock in stock_items])

@app.route('/stock', methods=['POST'])
def add_stock():
    data = request.get_json()
    try:
        new_stock = Stock(
            Ingredient_id=data['Ingredient_id'], 
            Amount=data['Amount'],
            Unit=data['Unit']  
        )
        db.session.add(new_stock)
        db.session.commit()
        return jsonify({"message": "Stock added successfully"}), 201
    except Exception as e:
        return jsonify({"error": "Failed to add stock"}), 500

@app.route('/stock/<int:id>', methods=['PUT'])
def edit_stock(id):
    data = request.get_json()
    try:
        stock = Stock.query.get(id)
        if not stock:
            return jsonify({"error": "Stock item not found"}), 404

        stock.Ingredient_id = data['Ingredient_id']  
        stock.Amount = data['Amount']  
        stock.Unit = data['Unit']  
        db.session.commit()
        return jsonify({"message": "Stock updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update stock"}), 500

@app.route('/stock/<int:id>', methods=['DELETE'])
def remove_stock(id):
    stock = Stock.query.get(id)
    if not stock:
        return jsonify({"error": "Stock item not found"}), 404
    try:
        db.session.delete(stock)
        db.session.commit()
        return jsonify({"message": "Stock deleted successfully"}), 204
    except Exception as e:
        return jsonify({"error": "Failed to delete stock"}), 500

# Expiry Date Endpoints
@app.route('/expiry_dates', methods=['GET'])
def get_expiry_dates():
    dates = ExpiryDate.query.all()
    return jsonify([{
        'id': date.id,
        'Expiry': date.Expiry,
        'Category': date.Category  
    } for date in dates])

@app.route('/expiry_dates', methods=['POST'])
def add_expiry_date():
    data = request.get_json()
    new_date = ExpiryDate(
        Expiry=data['Expiry'],  
        Category=data['Category'],
        # ingredient_id=data.get('ingredient_id')  # Uncomment if ingredient_id is part of the payload
    )
    db.session.add(new_date)
    db.session.commit()
    return jsonify({"message": "Expiry date added successfully"}), 201

@app.route('/expiry_dates/<int:id>', methods=['PUT'])
def edit_expiry_date(id):
    data = request.get_json()
    expiry_date = ExpiryDate.query.get(id)
    if not expiry_date:
        return jsonify({"error": "Expiry date not found"}), 404

    # Update the fields with the incoming data
    expiry_date.Expiry = data.get('Expiry', expiry_date.Expiry)  # Use current value if not provided
    expiry_date.Category = data.get('Category', expiry_date.Category)  # Use current value if not provided

    db.session.commit()
    return jsonify({"message": "Expiry date updated successfully"}), 200

@app.route('/expiry_dates/<int:id>', methods=['DELETE'])
def remove_expiry_date(id):
    expiry_date = ExpiryDate.query.get(id)
    if not expiry_date:
        return jsonify({"error": "Expiry date not found"}), 404
    try:
        db.session.delete(expiry_date)
        db.session.commit()
        return jsonify({"message": "Expiry date deleted successfully"}), 204
    except Exception as e:
        return jsonify({"error": "Failed to delete expiry date"}), 500

if __name__ == '__main__':
    app.run(debug=True)
