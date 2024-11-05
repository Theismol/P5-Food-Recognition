from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
username = os.getenv('username')
password = os.getenv('password')
server = os.getenv('server') 
database = os.getenv('database')
driver = os.getenv('driver')

# Configure SQLAlchemy with the connection string
app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the database models
class Recipe(db.Model):
    __tablename__ = 'Recipes'
    id = db.Column(db.Integer, primary_key=True)
    RecipeName = db.Column(db.String(255), nullable=False)
    NumberOfPeople = db.Column(db.Integer, nullable=False)
    Instructions = db.Column(db.Text, nullable=True)

class Allergy(db.Model):
    __tablename__ = 'Allergies'
    id = db.Column(db.Integer, primary_key=True)
    Allergy = db.Column(db.String(45), nullable=True)

class RecipeAllergy(db.Model):
    __tablename__ = 'Recipes_has_Allergies'
    Recipes_id = db.Column(db.Integer, db.ForeignKey('Recipes.id'), primary_key=True)
    Allergies_id = db.Column(db.Integer, db.ForeignKey('Allergies.id'), primary_key=True)

class RecipeIngredient(db.Model):
    __tablename__ = 'Recipes_has_Ingredients'
    Recipes_id = db.Column(db.Integer, db.ForeignKey('Recipes.id'), primary_key=True)
    Ingredients_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), primary_key=True)
    Amount = db.Column(db.Numeric(10, 2), nullable=True)
    unit = db.Column(db.String(20), nullable=True)

class Stock(db.Model):
    __tablename__ = 'Stock'
    id = db.Column(db.Integer, primary_key=True)
    Ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredients.id'), nullable=True)
    Amount = db.Column(db.Integer, nullable=True)
    Unit = db.Column(db.String(7), nullable=True)

# Function to generate recipes based on diet preferences
@app.route('/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.json
    diet_preferences = data.get('dietPreferences')
    print(f"Received diet preferences: {diet_preferences}")

    try:
        # Filter out recipes based on allergy restrictions in diet preferences
        allergies_filter = Allergy.query.filter(Allergy.Allergy.in_(diet_preferences)).all()
        allergy_ids = [allergy.id for allergy in allergies_filter]
        print(f"Filtered allergy IDs: {allergy_ids}")

        # Find recipes that do not have the restricted allergies
        if allergy_ids:
            recipes_with_allergies = RecipeAllergy.query.filter(RecipeAllergy.Allergies_id.in_(allergy_ids)).all()
            recipe_ids_with_allergies = [ra.Recipes_id for ra in recipes_with_allergies]
            print(f"Recipes with restricted allergies: {recipe_ids_with_allergies}")
            available_recipes = Recipe.query.filter(~Recipe.id.in_(recipe_ids_with_allergies)).all()
        else:
            available_recipes = Recipe.query.all()  # No dietary restrictions, get all recipes
        
        print(f"Available recipes after filtering: {[recipe.RecipeName for recipe in available_recipes]}")

        # Collect recipe details
        recipe_details = []
        for recipe in available_recipes:
            ingredients = RecipeIngredient.query.filter_by(Recipes_id=recipe.id).all()
            ingredients_info = []

            # Check if ingredients are available in stock
            useable_ingredients = True
            for ingredient in ingredients:
                stock_item = Stock.query.filter_by(Ingredient_id=ingredient.Ingredients_id).first()
                if stock_item and stock_item.Amount >= ingredient.Amount:
                    ingredients_info.append({
                        "Ingredient": ingredient.Ingredients_id,
                        "Amount": ingredient.Amount,
                        "unit": ingredient.unit,
                    })
                else:
                    useable_ingredients = False
                    break

            if useable_ingredients:
                # Append only usable recipes
                recipe_details.append({
                    "RecipeID": recipe.id,
                    "RecipeName": recipe.RecipeName,
                    "NumberOfPeople": recipe.NumberOfPeople,
                    "Instructions": recipe.Instructions,
                    "Ingredients": ingredients_info,
                })

        print(f"Recipe details to return: {recipe_details}")
        # Ensure you return the collected recipe details
        return jsonify({"recipes": recipe_details})

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@app.route('/choose-recipe', methods=['POST'])
def choose_recipe():
    data = request.json
    recipe_id = data.get('recipeID')
    print(f"Received recipe ID: {recipe_id}")

    try:
        # Find the recipe by ID
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Fetch related ingredients for the chosen recipe
        ingredients = RecipeIngredient.query.filter_by(Recipes_id=recipe.id).all()
        ingredients_info = []

        # Collect ingredient details
        for ingredient in ingredients:
            stock_item = Stock.query.filter_by(Ingredient_id=ingredient.Ingredients_id).first()
            ingredients_info.append({
                "Ingredient": ingredient.Ingredients_id,
                "Amount": ingredient.Amount,
                "unit": ingredient.unit,
                "AvailableInStock": stock_item.Amount if stock_item else 0,
            })

        response_data = {
            "RecipeID": recipe.id,
            "RecipeName": recipe.RecipeName,
            "NumberOfPeople": recipe.NumberOfPeople,
            "Instructions": recipe.Instructions,
            "Ingredients": ingredients_info,
        }

        return jsonify(response_data)

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)