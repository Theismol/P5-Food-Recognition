from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# Define your parameters
username = os.getenv('username')
password = os.getenv('password')
server = os.getenv('server') 
database = os.getenv('database')
driver = os.getenv('driver')

# Create the connection string
connection_string = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"

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
    id = db.Column(db.Integer, primary_key=True)
    ingredient_name = db.Column(db.String(45), nullable=False)  # 'Ingredient' field
    category = db.Column(db.String(45))
    stock = db.relationship('Stock', backref='ingredient', lazy=True)
    expiry_date = db.relationship('ExpiryDate', backref='ingredient', lazy=True)

class Stock(db.Model):
    __tablename__ = 'Stock'
    id = db.Column(db.Integer, primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)

class ExpiryDate(db.Model):
    __tablename__ = 'Expiry_dates'
    id = db.Column(db.Integer, primary_key=True)
    expiry = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(45), nullable=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'))

class Recipe(db.Model):
    __tablename__ = 'Recipes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(45), nullable=False)

class RecipesHasIngredients(db.Model):
    __tablename__ = 'recipes_has_ingredients'
    recipes_id = db.Column(db.Integer, db.ForeignKey('Recipes.id'), primary_key=True)
    ingredients_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), primary_key=True)


# Helper function for validating ingredient data
def validate_ingredient_data(data):
    required_fields = ["ingredient_name", "category"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    return True


# CRUD Endpoints
#Ingredients Endpoints
@app.route('/ingredients', methods=['GET'])
def get_ingredients():
    ingredients = Ingredient.query.all()
    return jsonify([{
        'id': ing.id,
        'ingredient_name': ing.ingredient_name,
        'category': ing.category
    } for ing in ingredients])

@app.route('/ingredients', methods=['POST'])
def add_ingredient():
    data = request.get_json()
    try:
        validate_ingredient_data(data)
        new_ingredient = Ingredient(
            ingredient_name=data['ingredient_name'],
            category=data['category']
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

        ingredient.ingredient_name = data['ingredient_name']
        ingredient.category = data['category']
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
        'ingredient_id': stock.ingredient_id,
        'amount': stock.amount
    } for stock in stock_items])

@app.route('/stock', methods=['POST'])
def add_stock():
    data = request.get_json()
    new_stock = Stock(
        ingredient_id=data['ingredient_id'],
        amount=data['amount']
    )
    db.session.add(new_stock)
    db.session.commit()
    return jsonify({"message": "Stock added successfully"}), 201


# Expiry Date Endpoints
@app.route('/expiry_dates', methods=['GET'])
def get_expiry_dates():
    dates = ExpiryDate.query.all()
    return jsonify([{
        'id': date.id,
        'expiry': date.expiry,
        'category': date.category
    } for date in dates])

@app.route('/expiry_dates', methods=['POST'])
def add_expiry_date():
    data = request.get_json()
    new_date = ExpiryDate(
        expiry=data['expiry'],
        category=data['category'],
        ingredient_id=data['ingredient_id']
    )
    db.session.add(new_date)
    db.session.commit()
    return jsonify({"message": "Expiry date added successfully"}), 201


# Recipes Has Ingredients Endpoints (Join Table)
@app.route('/recipes_has_ingredients', methods=['POST'])
def add_recipe_ingredient():
    data = request.get_json()
    new_link = RecipesHasIngredients(
        recipes_id=data['recipes_id'],
        ingredients_id=data['ingredients_id']
    )
    db.session.add(new_link)
    db.session.commit()
    return jsonify({"message": "Recipe-ingredient link added successfully"}), 201

@app.route('/recipes_has_ingredients', methods=['DELETE'])
def remove_recipe_ingredient():
    data = request.get_json()
    link = RecipesHasIngredients.query.filter_by(
        recipes_id=data['recipes_id'],
        ingredients_id=data['ingredients_id']
    ).first()
    if not link:
        return jsonify({"error": "Recipe-ingredient link not found"}), 404
    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": "Recipe-ingredient link deleted successfully"}), 204


if __name__ == '__main__':
    app.run(debug=True)