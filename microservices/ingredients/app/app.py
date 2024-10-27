from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow requests from other domains (e.g., your main app)

# Configure your database URI
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pymssql://username:password@server/db_name'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Ingredient model
class Ingredient(db.Model):
    __tablename__ = 'Ingredients'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(10), nullable=False)
    expiryDate = db.Column(db.DateTime, nullable=False)
    type = db.Column(db.String(50), nullable=False)

# Validate incoming data
def validate_ingredient_data(data):
    required_fields = ["amount", "unit", "expiryDate", "type"]
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    return True

# Get all ingredients
@app.route('/ingredients', methods=['GET'])
def get_ingredients():
    ingredients = Ingredient.query.all()
    return jsonify([{
        'id': ingredient.id,
        'amount': ingredient.amount,
        'unit': ingredient.unit,
        'expiryDate': ingredient.expiryDate.strftime('%Y-%m-%d'),
        'type': ingredient.type
    } for ingredient in ingredients])

# Add a new ingredient
@app.route('/ingredients', methods=['POST'])
def add_ingredient():
    data = request.get_json()
    try:
        validate_ingredient_data(data)
        expiry_date = datetime.strptime(data['expiryDate'], '%Y-%m-%d')
        new_ingredient = Ingredient(
            amount=data['amount'],
            unit=data['unit'],
            expiryDate=expiry_date,
            type=data['type']
        )
        db.session.add(new_ingredient)
        db.session.commit()
        return jsonify({"message": "Ingredient added successfully"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to add ingredient"}), 500

# Edit an existing ingredient
@app.route('/ingredients/<int:id>', methods=['PUT'])
def edit_ingredient(id):
    data = request.get_json()
    try:
        validate_ingredient_data(data)
        ingredient = Ingredient.query.get(id)
        if not ingredient:
            return jsonify({"error": "Ingredient not found"}), 404

        ingredient.amount = data['amount']
        ingredient.unit = data['unit']
        ingredient.expiryDate = datetime.strptime(data['expiryDate'], '%Y-%m-%d')
        ingredient.type = data['type']
        db.session.commit()

        return jsonify({"message": "Ingredient updated successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to update ingredient"}), 500

# Remove an ingredient
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

if __name__ == '__main__':
    app.run(debug=True)
