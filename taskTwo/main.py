from datetime import date
import requests

# Prompt the user to enter a barcode dynamically
barcode = input("Enter barcode: ")


url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
response = requests.get(url)

data = response.json()

# Safely handle missing product data (e.g., if barcode is invalid)
product = data.get("product") or {}

# Extracting fields safely with .get() fallbacks
product_name = product.get("product_name", "Product name not found")
brand = product.get("brands", "Brand not listed")
nutriscore = product.get("nutriscore_grade", "Nutri-Score not available")
ingredients = product.get("ingredients_text_en", "Ingredients not listed")

# A menu system
def print_menu():
    print("1. View Product Information")
    print("2. Exit")

def main():
    while True:
        print_menu()
        choice = input("Enter your choice: ")
        if choice == "1":
            print(f"\n--- Product Information ---")
            print(f"Product Name: {product_name}")
            print(f"Brand: {brand}")
            print(f"Nutri-Score: {nutriscore.upper() if nutriscore != 'Nutri-Score not available' else nutriscore}")
            print(f"Ingredients: {ingredients}\n")
        elif choice == "2":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()