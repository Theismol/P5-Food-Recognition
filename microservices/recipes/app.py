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
    )  # Foreign key to Expiry_dates
    Unit = db.Column(db.String(45), nullable=False)


class ExpiryDate(db.Model):
    __tablename__ = "Expiry_dates"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Expiry = db.Column(db.Integer, nullable=True)  # Assuming expiry is a number of days
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
    print(f"Received diet preferences: {diet_preferences}")

    try:
        # These will hold the allergy IDs corresponding to the selected diet preferences
        allergy_ids = []

        # For each diet preference, find corresponding allergies
        for preference in diet_preferences:
            print(f"Filtering allergies for preference: {preference}")
            allergies_filter = Allergy.query.filter(
                Allergy.Allergy.ilike(preference)
            ).all()
            print(f"Found allergies for {preference}: {[allergy.Allergy for allergy in allergies_filter]}")

            allergy_ids.extend([allergy.id for allergy in allergies_filter])

        print(f"Filtered allergy IDs based on preferences: {allergy_ids}")

        # If any dietary preferences are provided
        if allergy_ids:
            # Query Recipes_has_Allergies to find recipes that match the selected allergies
            recipes_with_matching_allergies = RecipeAllergy.query.filter(
                RecipeAllergy.Allergies_id.in_(allergy_ids)
            ).all()

            # Get the unique list of recipe IDs that match the selected allergies
            recipe_ids_with_matching_allergies = list(set(
                ra.Recipes_id for ra in recipes_with_matching_allergies
            ))

            print(f"Recipes matching diet preferences: {recipe_ids_with_matching_allergies}")

            # Fetch the recipes that match the selected diet preferences 
            available_recipes = Recipe.query.filter(
                Recipe.id.in_(recipe_ids_with_matching_allergies)
            ).all()

        else:
            # If no diet preferences are provided, return all recipes
            available_recipes = Recipe.query.all()

        print(f"Available recipes after filtering: {[recipe.RecipeName for recipe in available_recipes]}")

        # Collect and return recipe details
        recipe_details = []
        for recipe in available_recipes:
            # Fetch the associated allergies/dietary preferences for the recipe
            dietary_preferences = db.session.query(Allergy.Allergy).join(
                RecipeAllergy, RecipeAllergy.Allergies_id == Allergy.id
            ).filter(RecipeAllergy.Recipes_id == recipe.id).all()

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
                else:
                    useable_ingredients = False
                    break

            if useable_ingredients:
                recipe_details.append(
                    {
                        "RecipeID": recipe.id,
                        "RecipeName": recipe.RecipeName,
                        "NumberOfPeople": recipe.NumberOfPeople,
                        "Instructions": recipe.Instructions,
                        "Ingredients": ingredients_info,
                        "diet": dietary_preferences_list,  # Dietary preferences
                    }
                )

        print(f"Recipe details to return: {recipe_details}")
        return jsonify({"recipes": recipe_details})

    except SQLAlchemyError as e:
        print(f"SQLAlchemy error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/choose-recipe", methods=["POST"])
def choose_recipe():
    data = request.json
    recipe_id = data.get("recipeID")
    print(f"Received recipe ID: {recipe_id}")

    try:
        # Find the recipe by ID
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": "Recipe not found"}), 404

        # Fetch related ingredients for the chosen recipe
        ingredients = (
            db.session.query(RecipeIngredient, Ingredient)
            .join(Ingredient, RecipeIngredient.Ingredients_id == Ingredient.id)
            .filter(RecipeIngredient.Recipes_id == recipe.id)
            .all()
        )
        ingredients_info = []

        # Collect ingredient details and update stock
        for ingredient, ingredient_details in ingredients:
            stock_item = Stock.query.filter_by(
                Ingredient_id=ingredient.Ingredients_id
            ).first()

            if stock_item and stock_item.Amount >= ingredient.Amount:
                # Check if enough stock is available
                stock_item.Amount -= ingredient.Amount  # Deduct the used amount
                db.session.commit()  # Commit the changes to the stock

                ingredients_info.append(
                    {
                        "Ingredient": ingredient_details.Ingredient,
                        "Amount": ingredient.Amount,
                        "unit": ingredient.unit,
                        "AvailableInStock": stock_item.Amount,  # After deduction
                    }
                )
            else:
                ingredients_info.append(
                    {
                        "Ingredient": ingredient_details.Ingredient,
                        "Amount": ingredient.Amount,
                        "unit": ingredient.unit,
                        "AvailableInStock": stock_item.Amount if stock_item else 0,
                        "error": "Insufficient stock",  # Flag if stock is not enough
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
