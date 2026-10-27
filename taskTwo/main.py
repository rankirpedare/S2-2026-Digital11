from datetime import date
import requests

def main():
    while True:
        # Prompt the user to enter a barcode or type 'exit'
        barcode = input("Enter barcode (or type 'exit' to quit): ").strip()
        
        if barcode.lower() == 'exit':
            print("Exiting program. Goodbye!")
            break

        # Input validation: check if the barcode is numeric
        if not barcode.isdigit():
            print("Error: Barcode must contain numbers only. Please try again.\n")
            continue

        url = f"https://world.openfoodfacts.net/api/v2/product/{barcode}"
        
        try:
            response = requests.get(url)
            data = response.json()
        except requests.RequestException:
            print("Network error occurred. Please check your connection and try again.\n")
            continue

        # Input validation: check API status (1 means found, 0 means not found)
        if data.get("status") != 1:
            print("Product not found or unregistered barcode. Please try again.\n")
            continue

        # Safely handle missing product data
        product = data.get("product", {})

        # Extracting fields safely with .get() fallbacks
        product_name = product.get("product_name", "Product name not found")
        brand = product.get("brands", "Brand not listed")
        nutriscore = product.get("nutriscore_grade", "not available")
        ingredients = product.get("ingredients_text_en", "Ingredients not listed")

        # Health Traffic Light: Conditional logic based on Nutri-Score
        score = nutriscore.lower()
        if score == 'a':
            health_recommendation = "Nutri-Score A: Healthy choice!"
        elif score == 'b':
            health_recommendation = "Nutri-Score B: Good choice, fairly balanced."
        elif score == 'c':
            health_recommendation = "Nutri-Score C: Average choice, consume in moderation."
        elif score == 'd':
            health_recommendation = "Nutri-Score D: Poor choice, consume sparingly."
        elif score == 'e':
            health_recommendation = "Nutri-Score E: Unhealthy choice, limit intake."
        else:
            health_recommendation = "Nutri-Score evaluation not available."

        # Display product information and recommendation
        print(f"\n--- Product Information ---")
        print(f"Product Name: {product_name}")
        print(f"Brand: {brand}")
        print(f"Nutri-Score: {nutriscore.upper()}")
        print(f"Recommendation: {health_recommendation}")
        print(f"Ingredients: {ingredients}\n")

if __name__ == "__main__":
    main()