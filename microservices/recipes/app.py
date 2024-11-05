from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import and_
from dotenv import load_dotenv
import os


app = Flask(__name__)
CORS(app)
# Configure SQLAlchemy with environment variables
username = os.getenv('Username')
password = os.getenv('Password')
server = os.getenv('Server')
database = os.getenv('Database')
app.config['SQLALCHEMY_DATABASE_URI'] = f'mssql+pyodbc://{username}:{password}@{server}/{database}?driver=ODBC+Driver+17+for+SQL+Server'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the database models (same as before)
class Recipe(db.Model):
    __tablename__ = 'Recipe'
    id = db.Column(db.Integer, primary_key=True)
    RecipeName = db.Column(db.String(255), nullable=False)
    NumberOfPeople = db.Column(db.Integer, nullable=False)
    instruction = db.Column(db.Text, nullable=True)

class Allergy(db.Model):
    __tablename__ = 'Allergies'
    id = db.Column(db.Integer, primary_key=True)
    Allergy = db.Column(db.String(45), nullable=True)

class ExpiryDate(db.Model):
    __tablename__ = 'Expiry_dates'
    id = db.Column(db.Integer, primary_key=True)
    Expiry = db.Column(db.Integer, nullable=True)
    Category = db.Column(db.String(45), nullable=True)

class Ingredient(db.Model):
    __tablename__ = 'Ingredients'
    id = db.Column(db.Integer, primary_key=True)
    Ingredient = db.Column(db.String(45), nullable=True)
    Category = db.Column(db.String(45), nullable=True)

class RecipeAllergy(db.Model):
    __tablename__ = 'Recipes_has_Allergies'
    Recipes_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    Allergies_id = db.Column(db.Integer, db.ForeignKey('Allergies.id'), primary_key=True)

class RecipeIngredient(db.Model):
    __tablename__ = 'Recipes_has_Ingredients'
    Recipes_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    Ingredients_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), primary_key=True)
    Amount = db.Column(db.Numeric(10, 2), nullable=True)
    unit = db.Column(db.String(20), nullable=True)

class Stock(db.Model):
    __tablename__ = 'stock'
    id = db.Column(db.Integer, primary_key=True)
    Ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), nullable=True)
    Amount = db.Column(db.Integer, nullable=True)
    Unit = db.Column(db.String(7), nullable=True)

# Function to generate recipes based on diet preferences, stock, and expiry dates
@app.route('/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.json
    diet_preferences = data.get('dietPreferences')

    try:
        # Filter out recipes based on allergy restrictions in diet preferences
        allergies_filter = Allergy.query.filter(Allergy.Allergy.in_(diet_preferences)).all()
        allergy_ids = [allergy.id for allergy in allergies_filter]
        recipes_with_allergies = RecipeAllergy.query.filter(RecipeAllergy.Allergies_id.in_(allergy_ids)).all()
        recipe_ids_with_allergies = [ra.Recipes_id for ra in recipes_with_allergies]

        # Find recipes that don't match restricted allergies
        available_recipes = Recipe.query.filter(~Recipe.id.in_(recipe_ids_with_allergies)).all()
        
        # Prioritize ingredients in stock, close to expiration, and check availability in stock
        recipe_details = []
        for recipe in available_recipes:
            ingredients = RecipeIngredient.query.filter_by(Recipes_id=recipe.id).all()
            useable_ingredients = True
            ingredients_info = []
            for ingredient in ingredients:
                stock_item = Stock.query.filter_by(Ingredient_id=ingredient.Ingredients_id).first()
                expiry_item = ExpiryDate.query.filter_by(id=ingredient.Ingredients_id).first()

                if stock_item and stock_item.Amount >= ingredient.Amount:
                    # Add extra weight if ingredient is near expiry
                    expiration_weight = expiry_item.Expiry if expiry_item else float('inf')
                    ingredients_info.append({
                        "Ingredient": ingredient.Ingredients_id,
                        "Amount": ingredient.Amount,
                        "unit": ingredient.unit,
                        "ExpirationWeight": expiration_weight,
                        "StockAmount": stock_item.Amount
                    })
                else:
                    useable_ingredients = False
                    break

            if useable_ingredients:
                recipe_details.append({
                    "RecipeID": recipe.id,
                    "RecipeName": recipe.RecipeName,
                    "NumberOfPeople": recipe.NumberOfPeople,
                    "instruction": recipe.instruction,
                    "ingredients": sorted(ingredients_info, key=lambda x: x["ExpirationWeight"])  # Sort by expiration weight
                })

        return jsonify({"recipes": recipe_details})

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)