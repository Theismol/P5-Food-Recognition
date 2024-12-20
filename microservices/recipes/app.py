import datetime
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
username = os.getenv("username")
password = os.getenv("password")
server = os.getenv("server")
database = os.getenv("database")
driver = os.getenv("driver")

# Configure SQLAlchemy with the connection string
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# Define the database models
class Recipe(db.Model):
    __tablename__ = "Recipes"
    id = db.Column(db.Integer, primary_key=True)
    RecipeName = db.Column(db.String(255), nullable=False)
    NumberOfPeople = db.Column(db.Integer, nullable=False)
    Instructions = db.Column(db.Text, nullable=True)


class Allergy(db.Model):
    __tablename__ = "Allergies"
    id = db.Column(db.Integer, primary_key=True)
    Allergy = db.Column(db.String(45), nullable=True)


class RecipeAllergy(db.Model):
    __tablename__ = "Recipes_has_Allergies"
    Recipes_id = db.Column(db.Integer, db.ForeignKey("Recipes.id"), primary_key=True)
    Allergies_id = db.Column(
        db.Integer, db.ForeignKey("Allergies.id"), primary_key=True
    )


class RecipeIngredient(db.Model):
    __tablename__ = "Recipes_has_Ingredients"
    Recipes_id = db.Column(db.Integer, db.ForeignKey("Recipes.id"), primary_key=True)
    Ingredients_id = db.Column(
        db.Integer, db.ForeignKey("Ingredients.id"), primary_key=True
    )
    Amount = db.Column(db.Numeric(10, 2), nullable=True)
    unit = db.Column(db.String(20), nullable=True)


class Ingredient(db.Model):
    __tablename__ = "Ingredients"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient = db.Column(db.String(45), nullable=False)
    Category = db.Column(
        db.String(45), db.ForeignKey("Expiry_dates.Category")
    )  
    Unit = db.Column(db.String(45), nullable=False)


class ExpiryDate(db.Model):
    __tablename__ = "Expiry_dates"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Expiry = db.Column(db.Integer, nullable=True)  
    Category = db.Column(db.String(45), unique=True, nullable=False)
    Ingredients = db.relationship("Ingredient", backref="expiry_category", lazy=True)


class Stock(db.Model):
    __tablename__ = "Stock"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient_id = db.Column(
        db.Integer, db.ForeignKey("Ingredients.id"), nullable=True
    )
    Amount = db.Column(db.Integer, nullable=True)
    Expiry_date = db.Column(db.Date, nullable=True)
    Days_Until_Expiration = db.Column(db.Integer, nullable=True)
    Ingredient = db.relationship("Ingredient", backref="stock_entries", lazy=True)


@app.route("/generate-recipes", methods=["POST"])
def generate_recipes():
    data = request.json
    diet_preferences = data.get("dietPreferences")

    try:
        
        allergy_ids = []

        # For each diet preference, find corresponding allergies
        for preference in diet_preferences:
            allergies_filter = Allergy.query.filter(
                Allergy.Allergy.ilike(preference)
            ).all()
            allergy_ids.extend([allergy.id for allergy in allergies_filter])
        
        if allergy_ids:
            recipes_with_matching_allergies = RecipeAllergy.query.filter(
                RecipeAllergy.Allergies_id.in_(allergy_ids)
            ).all()

            recipe_ids_with_matching_allergies = list(
                set(ra.Recipes_id for ra in recipes_with_matching_allergies)
            )

            available_recipes = Recipe.query.filter(
                Recipe.id.in_(recipe_ids_with_matching_allergies)
            ).all()

        else:
           
            available_recipes = Recipe.query.all()

        # Collect and return recipe details
        recipe_details = []
        for recipe in available_recipes:
            
            dietary_preferences = (
                db.session.query(Allergy.Allergy)
                .join(RecipeAllergy, RecipeAllergy.Allergies_id == Allergy.id)
                .filter(RecipeAllergy.Recipes_id == recipe.id)
                .all()
            )

            # Extract the dietary preferences into a list
            dietary_preferences_list = [diet.Allergy for diet in dietary_preferences]

            ingredients = (
                db.session.query(RecipeIngredient, Ingredient)
                .join(Ingredient, RecipeIngredient.Ingredients_id == Ingredient.id)
                .filter(RecipeIngredient.Recipes_id == recipe.id)
                .all()
            )
            ingredients_info = []

            # Check if ingredients are available in stock
            useable_ingredients = True
            expiring_ingredients = []
            expiry_score = 0
            for ingredient, ingredient_details in ingredients:
                stock_item = Stock.query.filter_by(
                    Ingredient_id=ingredient.Ingredients_id
                ).first()
                if stock_item and stock_item.Amount >= ingredient.Amount:
                    ingredients_info.append(
                        {
                            "Ingredient": ingredient_details.Ingredient,
                            "Amount": ingredient.Amount,
                            "unit": ingredient.unit,
                        }
                    )

                    # Collect ingredients close to expiry
                    if stock_item.Expiry_date:
                        days_until_expiry = (
                            stock_item.Expiry_date - datetime.date.today()
                        ).days
                        expiring_ingredients.append(
                            {
                                "ingredient": ingredient_details.Ingredient,
                                "days_until_expiry": days_until_expiry,
                            }
                        )
                else:
                    useable_ingredients = False
                    break
                if useable_ingredients:
                    # Sort ingredients by expiry date: prioritize those expiring soon
                    expiring_ingredients.sort(key=lambda x: x["days_until_expiry"])

                    
                    if expiring_ingredients:
                        expiry_score = sum(
                            [
                                ingredient["days_until_expiry"]
                                for ingredient in expiring_ingredients
                            ]
                        ) / len(expiring_ingredients)
                    else:
                        expiry_score = 0

            if useable_ingredients:
                recipe_details.append(
                    {
                        "RecipeID": recipe.id,
                        "RecipeName": recipe.RecipeName,
                        "NumberOfPeople": recipe.NumberOfPeople,
                        "Instructions": recipe.Instructions,
                        "Ingredients": ingredients_info,
                        "diet": dietary_preferences_list,
                        "expiry_score": expiry_score,
                    }
                )

        # Sort recipes by the priority score based on expiring ingredients
        recipe_details.sort(key=lambda x: x["expiry_score"])
        return jsonify({"recipes": recipe_details})

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/choose-recipe", methods=["POST"])
def choose_recipe():
    data = request.json
    recipe_id = data.get("recipeID")
    number_of_people = data.get("numberOfPeople")

    try:
        # Find the recipe by ID
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Scale factor for ingredient amounts
        scale_factor = number_of_people / recipe.NumberOfPeople

        
        ingredients = (
            db.session.query(RecipeIngredient, Ingredient)
            .join(Ingredient, RecipeIngredient.Ingredients_id == Ingredient.id)
            .filter(RecipeIngredient.Recipes_id == recipe.id)
            .all()
        )
        ingredients_info = []

        
        for ingredient, ingredient_details in ingredients:
            adjusted_amount = (
                float(ingredient.Amount) * scale_factor
            )  

            stock_item = Stock.query.filter_by(
                Ingredient_id=ingredient.Ingredients_id
            ).first()

            if stock_item and stock_item.Amount >= adjusted_amount:
                
                stock_item.Amount -= adjusted_amount
                db.session.commit()  

                ingredients_info.append(
                    {
                        "Ingredient": ingredient_details.Ingredient,
                        "AdjustedAmount": round(adjusted_amount, 2),
                        "unit": ingredient.unit,
                        "AvailableInStock": stock_item.Amount,  
                    }
                )
            else:
                ingredients_info.append(
                    {
                        "Ingredient": ingredient_details.Ingredient,
                        "AdjustedAmount": round(adjusted_amount, 2),
                        "unit": ingredient.unit,
                        "AvailableInStock": stock_item.Amount if stock_item else 0,
                        "error": "Insufficient stock",  
                    }
                )

        # Return the recipe details with updated ingredient stock
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
