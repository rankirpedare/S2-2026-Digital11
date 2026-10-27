from datetime import date
import requests

# Prompt the user to enter a barcode dynamically
barcode = input("Enter barcode: ")

# Nutella Barcode: 3017624010701

url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
response = requests.get(url)

data = response.json()

product_name = data.get("product", {}).get("product_name", "Product name not found")
ingredients = data.get("product", {}).get("ingredients_text_en", "Product name not found")

# A menu system
def print_menu():
    print("1. View Product Information")
    print("2. Exit")

def main():
    while True:
        print_menu()
        choice = input("Enter your choice: ")
        if choice == "1":
            print(f"Product Name: {product_name}")
            print(f"Ingredients: {ingredients}")
        elif choice == "2":
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()