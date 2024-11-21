import os
from datetime import date, datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, text

load_dotenv()

# Define your parameters
username = os.getenv("username")
password = os.getenv("password")
server = os.getenv("server")
database = os.getenv("database")
driver = os.getenv("driver")

# Create the connection string
connection_string = f"mssql+pyodbc://{username}:{password}@{server}:1433/{database}?driver={driver.replace(' ', '+')}&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"
# Create an engine
engine = create_engine(connection_string)

app = Flask(__name__)
CORS(app)

# Configure database URI
app.config["SQLALCHEMY_DATABASE_URI"] = connection_string
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the APScheduler
scheduler = BackgroundScheduler(daemon=True)

# Initialize the database
db = SQLAlchemy(app)


# TABLES BASED ON THE STRUCTURE SEEN IN THE DATABASE
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
    Expiry = db.Column(db.Integer, nullable=True)
    Category = db.Column(db.String(45), unique=True, nullable=False)

    # Relationship back to Ingredient
    Ingredients = db.relationship("Ingredient", backref="expiry_category", lazy=True)


class Stock(db.Model):
    __tablename__ = "Stock"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Ingredient_id = db.Column(
        db.Integer, db.ForeignKey("Ingredients.id"), nullable=True
    )  # Foreign key to Ingredients
    Amount = db.Column(db.Integer, nullable=True)
    Expiry_date = db.Column(db.Date, nullable=True)
    Days_Until_Expiration = db.Column(db.Integer, nullable=True)

    # Relationship back to Ingredient
    Ingredient = db.relationship("Ingredient", backref="stock_entries", lazy=True)


# Helper function to calculate Days_Until_Expiration
def calculate_days_until_expiration(expiry_date):
    return (expiry_date - date.today()).days if expiry_date else None


@app.route("/add-stock", methods=["POST"])
def add_stock():
    data = request.get_json()
    expiry_date = None
    ingredient_id = None
    try:
        if "ingredientName" not in data or "amount" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        if "expiry" in data:
            expiry_date = datetime.strptime(data["expiry"], "%m/%d/%Y").date()
        else:
            ingredient = Ingredient.query.filter_by(
                Ingredient=data["ingredientName"]
            ).first()
            if not ingredient:
                return jsonify({"error": "Ingredient not found"}), 404
            days_in_stock = ExpiryDate.query.filter_by(
                Category=ingredient.Category
            ).first()
            if days_in_stock:
                expiry_date = date.today() + timedelta(days=days_in_stock.Expiry)
            else:
                return (
                    jsonify({"error": "Could not find expiry date for the item"}),
                    404,
                )
            ingredient_id = ingredient.id
        print(expiry_date)

        days_until_expiration = calculate_days_until_expiration(expiry_date)
        new_stock = Stock(
            Ingredient_id=ingredient_id,
            Amount=data["amount"],
            Expiry_date=expiry_date,
            Days_Until_Expiration=days_until_expiration,
        )
        db.session.add(new_stock)
        db.session.commit()

        return jsonify({"message": "Stock added successfully"}), 201

    except Exception as e:
        print(e)
        return ({"error": "Failed to add stock"}), 500


# Get stock function (combine Stock and Ingredient data)
@app.route("/stock", methods=["GET"])
def get_stock():
    try:
        # Perform a join between Stock and Ingredient based on the Ingredient_id foreign key
        stocks = (
            db.session.query(
                Stock.id,
                Stock.Ingredient_id,
                Stock.Amount,
                Stock.Expiry_date,
                Stock.Days_Until_Expiration,
                Ingredient.Unit,
                Ingredient.Ingredient,
            )
            .join(Ingredient, Stock.Ingredient_id == Ingredient.id)
            .all()
        )

        # Prepare the response data
        stock_data = []
        for stock in stocks:
            stock_data.append(
                {
                    "id": stock.id,
                    "Ingredient_id": stock.Ingredient_id,
                    "Amount": stock.Amount,
                    "Expiry_date": stock.Expiry_date,
                    "Days_Until_Expiration": stock.Days_Until_Expiration,
                    "Unit": stock.Unit,
                    "Ingredient": stock.Ingredient,
                }
            )

        return jsonify(stock_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch stock", "details": str(e)}), 500


# Edit stock function
@app.route("/stock/<int:id>", methods=["PUT"])
def edit_stock(id):
    data = request.get_json()
    stock = Stock.query.get(id)
    if not stock:
        return jsonify({"error": "Stock item not found"}), 404

    try:
        # Update Quantity (Amount) if provided
        if "Amount" in data:
            stock.Amount = data["Amount"]

        # Update Expiry Date if provided
        if "Expiry_date" in data:
            stock.Expiry_date = date.fromisoformat(data["Expiry_date"])
        else:
            # If no Expiry date is provided, look it up based on the Category of the Ingredient
            ingredient = stock.Ingredient
            if ingredient:
                expiry_entry = ExpiryDate.query.filter_by(
                    Category=ingredient.Category
                ).first()
                if expiry_entry:
                    stock.Expiry_date = date.today() + timedelta(
                        days=expiry_entry.Expiry
                    )

        # Recalculate Days_Until_Expiration
        if stock.Expiry_date:
            stock.Days_Until_Expiration = calculate_days_until_expiration(
                stock.Expiry_date
            )

        db.session.commit()

        if stock.Expiry_date < date.today():
            remove_expired_stock()

        return jsonify({"message": "Stock updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to update stock", "details": str(e)}), 500


# Function to remove expired stock (Used in PUT in stock)
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


# Background task to update Days_Until_Expiration for all stock items
def update_days_until_expiration_task():
    stocks = Stock.query.all()
    for stock in stocks:
        if stock.Expiry_date:
            stock.Days_Until_Expiration = calculate_days_until_expiration(
                stock.Expiry_date
            )

    try:
        db.session.commit()
        print("Updated Days_Until_Expiration for all stock items.")
    except Exception as e:
        db.session.rollback()
        print(f"Error updating Days_Until_Expiration: {e}")


# Schedule the task to run daily
scheduler.add_job(update_days_until_expiration_task, "interval", days=1)
scheduler.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
