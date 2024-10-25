from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.json
    diet_preferences = data.get('dietPreferences')
    
    # Placeholder logic for generating recipes based on dietPreferences
    recipes = ["Recipe 1", "Recipe 2", "Recipe 3"]  # Dummy recipes
    return jsonify({"recipes": recipes})

@app.route('/choose-recipe', methods=['POST'])
def choose_recipe():
    data = request.json
    recipe_id = data.get('recipeID')
    
    # Placeholder logic for choosing a recipe and adjusting stock
    message = f"Recipe with ID {recipe_id} chosen successfully. Ingredients are removed from stock automatically!"
    return jsonify({"message": message})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
