from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from rest_framework.response import Response
from rest_framework.decorators import api_view
import urllib.parse
from django.core.cache import cache
import concurrent.futures
import asyncio
import aiohttp
import json

# Keep a single WebDriver instance for reuse
driver = None

def initialize_driver():
    """Initialize and return a configured Chrome WebDriver."""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--disable-notifications')
 
    return webdriver.Chrome(options=chrome_options)

def get_driver():
    """Get the global driver or initialize a new one."""
    global driver
    if driver is None:
        driver = initialize_driver()
    return driver

def extract_product_data(item):
    """Extract product data from a product container element."""
    try:
        name = item.find_element(By.CLASS_NAME, "tAxDx").text
    except:
        name = "No name"
    
    try:
        price = item.find_element(By.CLASS_NAME, "a8Pemb").text
    except:
        price = "No price"
    
    try:
        link_div = item.find_element(By.CLASS_NAME, "mnIHsc")
        link = link_div.find_element(By.TAG_NAME, "a").get_attribute("href")
        if link and link.startswith("/url?q="):
            link = urllib.parse.unquote(link[7:].split('&')[0])
    except:
        link = ""
    
    try:
        img = item.find_element(By.CSS_SELECTOR, "div.ArOc1c img[role='presentation']").get_attribute("src")
    except:
        img = ""
    
    try:
        source_div = item.find_element(By.CSS_SELECTOR, "div.aULzUe.IuHnof")
        source = source_div.text
    except:
        source = "No source"
    
    return {
        "name": name,
        "price": price,
        "image": img,
        "buy_url": link,
        "source": source
    }

def scrape_google_shopping(query):
    """Scrape Google Shopping for products using Selenium."""
    try:
        driver = get_driver()
        
        # Construct the Google Shopping search URL and visit it
        url = f"https://www.google.com/search?tbm=shop&hl=en&psb=1&q={urllib.parse.quote(query)}"
        driver.get(url)
        
        # Wait for the product containers to load with a shorter timeout
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "sh-dgr__content"))
        )
        
        # Find all the product containers
        items = driver.find_elements(By.CLASS_NAME, "sh-dgr__content")
        
        # Use ThreadPoolExecutor to extract product data in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            products = list(executor.map(extract_product_data, items))
        
        return products
    except Exception as e:
        print(f"Error scraping Google Shopping: {e}")
        return []

async def fetch_product_details_async(session, product):
    """Asynchronously fetch additional product details if needed."""
    if not product.get("image") and product.get("buy_url"):
        try:
            # This is a placeholder for any async API calls you might want to make
            # to enrich product data from other sources
            pass
        except Exception as e:
            print(f"Error fetching product details: {e}")
    return product

async def enrich_products_async(products):
    """Enrich products with additional details asynchronously."""
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_product_details_async(session, product) for product in products]
        return await asyncio.gather(*tasks)

@api_view(['GET'])
def get_products(request):
    """API view to get products based on a search query."""
    query = request.GET.get('q', '')
    start_index = int(request.GET.get('start', 0))
    limit = int(request.GET.get('limit', 50))  # Allow customizable limit
    
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    # Check cache first
    cache_key = f"products_{query}_{limit}"
    cached_products = cache.get(cache_key)
    if cached_products:
        # Return only the requested slice of cached products
        return Response(cached_products[start_index:start_index + limit])
    
    try:
        # Scrape products from Google Shopping
        products = scrape_google_shopping(query)
        
        # Enrich products with additional details asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        enriched_products = loop.run_until_complete(enrich_products_async(products))
        loop.close()
        
        # Cache the results for future requests (5 minutes)
        cache.set(cache_key, enriched_products, timeout=60*5)
        
        # Return the requested slice of products
        return Response(enriched_products[start_index:start_index + limit])
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# Function to clean up WebDriver when server shuts down
def cleanup():
    global driver
    if driver:
        driver.quit()
        driver = None

# Register cleanup function to be called on server shutdown
import atexit
atexit.register(cleanup)