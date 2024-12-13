import requests
# Base URL for the microservices
BASE_URL = "http://130.225.37.189:2000"

def test_recipe_workflow():
    # Step 1: Generate recipes based on dietary preferences
    diet_preferences = ["Vegetarian"]  # Example dietary preference
    response = requests.post(
        f"{BASE_URL}/api/recipe/generate-recipes",
        json={"dietPreferences": diet_preferences},
    )
    assert response.status_code == 200, f"Failed to generate recipes: {response.text}"
    recipes = response.json().get("recipes", [])
    assert recipes, "No recipes generated."

    print(f"Step 1: Recipes generated: {[recipe['RecipeName'] for recipe in recipes]}")

    # Step 2: Choose a recipe
    selected_recipe = recipes[0]  # Select the first recipe for testing
    recipe_id = selected_recipe["RecipeID"]
    number_of_people = 4  # Adjust based on the test scenario
    response = requests.post(
        f"{BASE_URL}/api/recipe/choose-recipe",
        json={"recipeID": recipe_id, "numberOfPeople": number_of_people},   
    )
    assert response.status_code == 200, f"Failed to choose recipe: {response.text}"
    chosen_recipe_details = response.json()

    # Debugging: Print the entire response
    print("Step 2: Chosen recipe details:", chosen_recipe_details)


    # Step 3: Verify stock updates
    response = requests.get(f"{BASE_URL}/api/stock")
    assert response.status_code == 200, f"Failed to fetch stock: {response.text}"
    updated_stock = response.json()

    print("Step 3: Updated stock:")
    for stock_item in updated_stock:
        print(
            f"- {stock_item['Ingredient']}: {stock_item['Amount']} {stock_item['Unit']}"
        )

    # Step 4: Assert stock reflects deductions
    for ingredient in selected_recipe["Ingredients"]:
        ingredient_name = ingredient["Ingredient"]
        adjusted_amount = ingredient["Amount"] * (number_of_people / selected_recipe["NumberOfPeople"])
        stock_item = next(
            (item for item in updated_stock if item["Ingredient"] == ingredient_name),
            None,
        )
        assert stock_item, f"Ingredient {ingredient_name} not found in stock."
        assert (
            stock_item["Amount"] >= adjusted_amount
        ), f"Insufficient stock for {ingredient_name}."

    print("Step 4: Stock verification successful.")

if __name__ == "__main__":
    test_recipe_workflow()
