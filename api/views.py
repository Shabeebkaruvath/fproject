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

 

@api_view(['GET'])
def get_products(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in headless mode
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Construct and visit URL
        url = f"https://www.google.com/search?tbm=shop&hl=en&psb=1&q={urllib.parse.quote(query)}"
        driver.get(url)
        
        # Wait for products to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "sh-dgr__content"))
        )
        
        # Small delay to ensure images are loaded
        time.sleep(2)
        
        products = []
        
        # Find all product containers
        items = driver.find_elements(By.CLASS_NAME, "sh-dgr__content")
        
        for item in items:
            try:
                # Get product name
                name = item.find_element(By.CLASS_NAME, "tAxDx").text
            except:
                name = "No name"
                
            try:
                # Get price
                price = item.find_element(By.CLASS_NAME, "a8Pemb").text
            except:
                price = "No price"
                
            try:
                # Get product link
                link = item.find_element(By.TAG_NAME, "a").get_attribute("href")
                if link and link.startswith("/url?q="):
                    link = urllib.parse.unquote(link[7:])
            except:
                link = ""
                
            try:
                # Get image URL
                img = item.find_element(
                    By.CSS_SELECTOR, 
                    "div.ArOc1c img[role='presentation']"
                ).get_attribute("src")
            except:
                img = ""
                
            products.append({
                "name": name,
                "price": price,
                "image": img,
                "buy_url": link
            })
        
        driver.quit()
        return Response(products)
        
    except Exception as e:
        if 'driver' in locals():
            driver.quit()
        return Response({"error": str(e)}, status=500)