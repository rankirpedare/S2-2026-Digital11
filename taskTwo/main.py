from datetime import date
import requests
barcode = 3017624010701

#3017624010701
#input("Barcode")
url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
response = requests.get(url)
#print(response.json())

data = response.json()

product_name = data.get("product", {}).get("product_name", "Product name not found")
ingredients = data.get("product", {}).get("ingredients", "Ingredients not found")

print(f"Product Name: {product_name}")
print(f"Ingredients: {ingredients}")

#A menu system
def print_menu():
    print("1. View Product Information")
    print("2. Exit")

def main():
    while True:
        print_menu()
        choice = input("Enter your choice: ")

        if choice == "1":
            barcode = input("Enter the barcode: ")
            url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
            response = requests.get(url)
            data = response.json()

            product_name = data.get("product", {}).get("product_name", "Product name not found")
            ingredients = data.get("product", {}).get("ingredients", "Ingredients not found")

            print(f"Product Name: {product_name}")
            print(f"Ingredients: {ingredients}")

        elif choice == "2":
            print("Exiting the program.")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()