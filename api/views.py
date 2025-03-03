from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from rest_framework.response import Response
from rest_framework.decorators import api_view
import urllib.parse
import time
from django.core.cache import cache

# API view to get products based on a search query
@api_view(['GET'])
def get_products(request):
    # Get the search query from the request
    query = request.GET.get('q', '')
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    # Set up Chrome options for headless mode
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        # Initialize the Chrome driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Construct the Google Shopping search URL and visit it
        url = f"https://www.google.com/search?tbm=shop&hl=en&psb=1&q={urllib.parse.quote(query)}"
        driver.get(url)
        
        # Wait for the product containers to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "sh-dgr__content"))
        )
        
        # Wait a short time to ensure images are loaded
        time.sleep(2)
        
        # Initialize a list to store the product information
        products = []
        
        # Find all the product containers
        items = driver.find_elements(By.CLASS_NAME, "sh-dgr__content")
        
        # Extract the relevant information from each product container
        for item in items:
            try:
                name = item.find_element(By.CLASS_NAME, "tAxDx").text
            except:
                name = "No name"
            try:
                price = item.find_element(By.CLASS_NAME, "a8Pemb").text
            except:
                price = "No price"
            try:
                link = item.find_element(By.TAG_NAME, "a").get_attribute("href")
                if link and link.startswith("/url?q="):
                    link = urllib.parse.unquote(link[7:])
            except:
                link = ""
            try:
                img = item.find_element(
                    By.CSS_SELECTOR, 
                    "div.ArOc1c img[role='presentation']"
                ).get_attribute("src")
            except:
                img = ""
            
            # Add the product information to the list
            products.append({
                "name": name,
                "price": price,
                "image": img,
                "buy_url": link
            })
        
        # Close the Chrome driver
        driver.quit()
        
        # Return the list of products
        return Response(products)
        
    except Exception as e:
        # If an exception occurs, close the Chrome driver and return an error response
        if 'driver' in locals():
            driver.quit()
        return Response({"error": str(e)}, status=500)
