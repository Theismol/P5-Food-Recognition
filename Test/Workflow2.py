import requests
from datetime import datetime

# Base URL for the ingredients microservice
INGREDIENTS_BASE_URL = "http://130.225.37.189:2000"

def test_update_and_verify_stock():
    # Step 2: Update stock
    stock_item_id = 83  # Replace with a valid stock ID from your database
    new_amount = 4500  # Updated amount
    updated_expiry_date = "2025-12-31"

    update_payload = {
        "Amount": new_amount,
        "Expiry_date": updated_expiry_date,
    }

    response = requests.put(f"{INGREDIENTS_BASE_URL}/api/stock/{stock_item_id}", json=update_payload)
    assert response.status_code == 200, f"Failed to update stock: {response.text}"
    print(f"Step 2: Stock with ID {stock_item_id} updated successfully.")

    # Step 3: Verify the update
    response = requests.get(f"{INGREDIENTS_BASE_URL}/api/stock")
    assert response.status_code == 200, f"Failed to fetch stock after update: {response.text}"
    updated_stock_data = response.json()

    updated_stock_item = next(
        (item for item in updated_stock_data if item["id"] == stock_item_id), None
    )
    assert updated_stock_item, f"Stock item with ID {stock_item_id} not found after update."
    assert (
        updated_stock_item["Amount"] == new_amount
    ), f"Stock amount mismatch: Expected {new_amount}, Got {updated_stock_item['Amount']}"

    # Parse and format the expiry date from the response
    actual_expiry_date = datetime.strptime(updated_stock_item["Expiry_date"], "%a, %d %b %Y %H:%M:%S %Z").strftime("%Y-%m-%d")
    assert (
        actual_expiry_date == updated_expiry_date
    ), f"Expiry date mismatch: Expected {updated_expiry_date}, Got {actual_expiry_date}"

    print(f"Step 3: Verified stock update for ID {stock_item_id}.")

if __name__ == "__main__":
    test_update_and_verify_stock()
