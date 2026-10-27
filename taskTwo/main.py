from datetime import date
import requests

# Prompt the user to enter a barcode dynamically
barcode = input("Enter barcode: ")

# Nutella Barcode: 3017624010701

url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}"
response = requests.get(url)

data = response.json()
product = data.get("product", {})

# Extracting 4 different data fields
product_name = product.get("product_name", "Product name not found")
brand = product.get("brands", "Brand not found")
nutriscore = product.get("nutriscore_grade", "Nutri-Score not found")
ingredients = product.get("ingredients_text_en", "Ingredients not found")

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
            print(f"Nutri-Score: {nutriscore}")
            print(f"Ingredients: {ingredients}\n")
        elif choice == "2":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()