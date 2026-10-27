from datetime import date
import requests

def main():
    while True:
        # Prompt the user to enter a barcode or type 'exit'
        barcode = input("Enter barcode (or type 'exit' to quit): ").strip()
        
        if barcode.lower() == 'exit':
            print("Exiting program. Goodbye!")
            break

        url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
        response = requests.get(url)
        data = response.json()

        # Safely handle missing product data
        product = data.get("product")
        if not product:
            print("Product not found or invalid barcode. Please try again.\n")
            continue

        # Extracting fields safely with .get() fallbacks
        product_name = product.get("product_name", "Product name not found")
        brand = product.get("brands", "Brand not listed")
        nutriscore = product.get("nutriscore_grade", "Nutri-Score not available")
        ingredients = product.get("ingredients_text_en", "Ingredients not listed")

        # Display product information
        print(f"\n--- Product Information ---")
        print(f"Product Name: {product_name}")
        print(f"Brand: {brand}")
        print(f"Nutri-Score: {nutriscore.upper() if nutriscore != 'Nutri-Score not available' else nutriscore}")
        print(f"Ingredients: {ingredients}\n")

if __name__ == "__main__":
    main()