from functools import lru_cache
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
import logging
import time
import signal
import atexit

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Driver pool configuration
DRIVER_POOL_SIZE = 3
driver_pool = []

def create_driver():
    """Create and configure a Chrome WebDriver with optimized settings."""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--disable-notifications')
    chrome_options.add_argument('--disable-javascript')  # Disable JS if not needed
    chrome_options.page_load_strategy = 'eager'  # Load only essential resources
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(15)  # Set timeout to prevent hanging
    return driver

def get_driver_from_pool():
    """Get a driver from the pool or create a new one if needed."""
    global driver_pool
    if not driver_pool:
        driver_pool = [create_driver() for _ in range(DRIVER_POOL_SIZE)]
    
    if driver_pool:
        return driver_pool.pop()
    else:
        return create_driver()

def return_driver_to_pool(driver):
    """Return a driver to the pool for reuse."""
    global driver_pool
    if len(driver_pool) < DRIVER_POOL_SIZE:
        try:
            driver.delete_all_cookies()  # Clean up for next use
            driver_pool.append(driver)
        except Exception as e:
            logger.error(f"Error returning driver to pool: {e}")
            try:
                driver.quit()
            except:
                pass
    else:
        try:
            driver.quit()
        except:
            pass

def extract_product_data(item):
    """Extract product data from a product container element with improved buy URL extraction."""
    # Pre-initialize data structure with default values
    product_data = {
        "name": "No name",
        "price": "No price",
        "image": "",
        "buy_url": "",
        "source": "No source"
    }
    
    # Extract name
    try:
        product_data["name"] = item.find_element(By.CLASS_NAME, "tAxDx").text
    except Exception:
        pass
        
    # Extract price
    try:
        product_data["price"] = item.find_element(By.CLASS_NAME, "a8Pemb").text
    except Exception:
        pass
        
    try:
        link = item.find_element(By.CSS_SELECTOR, "a.shntl").get_attribute("href")
        if link and link.startswith("/url?q="):
            product_data["buy_url"] = urllib.parse.unquote(link[7:].split('&')[0])
        elif link:
            # If the link doesn't start with "/url?q=" but exists, use it directly
            product_data["buy_url"] = link
    except Exception:
        pass
        
     
        
    # Extract image    
    try:
        product_data["image"] = item.find_element(By.CSS_SELECTOR, "div.ArOc1c img[role='presentation']").get_attribute("src")
    except Exception:
        pass
        
    # Extract source
    try:
        source_div = item.find_element(By.CSS_SELECTOR, "div.aULzUe.IuHnof")
        product_data["source"] = source_div.text
    except Exception:
        pass
        
    return product_data
    """Extract product data from a product container element with better error handling."""
    product = {
        "name": "No name",
        "price": "No price",
        "image": "",
        "buy_url": "",
        "source": "No source"
    }
    
    try:
        # Use a more fault-tolerant approach with default values
        try:
            product["name"] = item.find_element(By.CLASS_NAME, "tAxDx").text
        except:
            pass
        
        try:
            product["price"] = item.find_element(By.CLASS_NAME, "a8Pemb").text
        except:
            pass
        
        try:
            link_div = item.find_element(By.CLASS_NAME, "mnIHsc")
            link = link_div.find_element(By.TAG_NAME, "a").get_attribute("href")
            if link and link.startswith("/url?q="):
                product["buy_url"] = urllib.parse.unquote(link[7:].split('&')[0])
        except:
            pass
        
        try:
            product["image"] = item.find_element(By.CSS_SELECTOR, "div.ArOc1c img[role='presentation']").get_attribute("src")
        except:
            pass
        
        try:
            source_div = item.find_element(By.CSS_SELECTOR, "div.aULzUe.IuHnof")
            product["source"] = source_div.text
        except:
            pass
            
    except Exception as e:
        logger.error(f"Error extracting product data: {e}")
    
    return product

@lru_cache(maxsize=32)
def scrape_google_shopping(query):
    """Scrape Google Shopping with retries and better performance."""
    products = []
    driver = None
    retries = 2
    
    while retries > 0:
        try:
            driver = get_driver_from_pool()
            
            # Construct the Google Shopping search URL with additional parameters for faster loading
            url = f"https://www.google.com/search?tbm=shop&hl=en&psb=1&q={urllib.parse.quote(query)}&num=50"
            driver.get(url)
            
            # Wait for the product containers with optimized selectors
            WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.CLASS_NAME, "sh-dgr__content"))
            )
            
            # Find all the product containers
            items = driver.find_elements(By.CLASS_NAME, "sh-dgr__content")
            
            # Process in chunks for better resource management
            chunk_size = 10
            for i in range(0, len(items), chunk_size):
                chunk = items[i:i+chunk_size]
                with concurrent.futures.ThreadPoolExecutor(max_workers=chunk_size) as executor:
                    chunk_products = list(executor.map(extract_product_data, chunk))
                    products.extend(chunk_products)
            
            # If successful, break the retry loop
            break
            
        except Exception as e:
            logger.error(f"Error during scraping (attempt {3-retries}/2): {e}")
            retries -= 1
            if retries == 0:
                logger.error("All scraping attempts failed")
            time.sleep(1)  # Brief pause before retry
            
        finally:
            if driver:
                return_driver_to_pool(driver)
    
    return products

async def fetch_product_details_async(session, product):
    """Fetch additional product details with timeout and error handling."""
    if not product.get("image") and product.get("buy_url"):
        try:
            # Example of async enrichment - you can add actual API calls here
            async with session.get(product["buy_url"], timeout=5) as response:
                if response.status == 200:
                    # Process response if needed
                    pass
        except asyncio.TimeoutError:
            logger.warning(f"Timeout fetching details for {product.get('name', 'unknown product')}")
        except Exception as e:
            logger.error(f"Error fetching product details: {e}")
    return product

async def enrich_products_async(products):
    """Enrich products with better connection pooling and concurrency control."""
    connector = aiohttp.TCPConnector(limit=20, force_close=True, enable_cleanup_closed=True)
    timeout = aiohttp.ClientTimeout(total=10)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Process in smaller batches to control memory usage
        batch_size = 20
        enriched_products = []
        
        for i in range(0, len(products), batch_size):
            batch = products[i:i+batch_size]
            tasks = [fetch_product_details_async(session, product) for product in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions
            valid_results = [r for r in batch_results if not isinstance(r, Exception)]
            enriched_products.extend(valid_results)
            
            # Small pause between batches to prevent rate limiting
            await asyncio.sleep(0.1)
            
        return enriched_products

@api_view(['GET'])
def get_products(request):
    """Optimized API view with tiered caching and better error handling."""
    query = request.GET.get('q', '').strip()
    start_index = int(request.GET.get('start', 0))
    limit = min(int(request.GET.get('limit', 50)), 100)  # Cap maximum limit
    
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    # Generate cache keys for different levels of caching
    main_cache_key = f"products_{query}"
    paginated_cache_key = f"{main_cache_key}_{start_index}_{limit}"
    
    # Try to get the paginated results first (most efficient)
    paginated_results = cache.get(paginated_cache_key)
    if paginated_results:
        return Response(paginated_results)
    
    # Try to get the full results and paginate
    all_products = cache.get(main_cache_key)
    if all_products:
        paginated_results = all_products[start_index:start_index + limit]
        cache.set(paginated_cache_key, paginated_results, timeout=60*5)  # Cache the pagination
        return Response(paginated_results)
    
    try:
        # Scrape products from Google Shopping
        products = scrape_google_shopping(query)
        
        if not products:
            logger.warning(f"No products found for query: {query}")
            return Response({"results": [], "message": "No products found"})
        
        # Enrich products asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            enriched_products = loop.run_until_complete(enrich_products_async(products))
        finally:
            loop.close()
        
        # Cache the full results and the paginated results
        cache.set(main_cache_key, enriched_products, timeout=60*15)  # Cache for 15 minutes
        paginated_results = enriched_products[start_index:start_index + limit]
        cache.set(paginated_cache_key, paginated_results, timeout=60*5)  # Cache for 5 minutes
        
        return Response(paginated_results)
    
    except Exception as e:
        logger.error(f"Error processing request for query '{query}': {e}")
        return Response({"error": "An error occurred while processing your request"}, status=500)

def cleanup():
    """Properly clean up all resources when server shuts down."""
    global driver_pool
    for driver in driver_pool:
        try:
            driver.quit()
        except:
            pass
    driver_pool = []
    logger.info("WebDriver resources cleaned up")

# Register cleanup function
atexit.register(cleanup)

# Also handle signals for more robust cleanup
def signal_handler(sig, frame):
    cleanup()
    exit(0)

for sig in [signal.SIGINT, signal.SIGTERM]:
    signal.signal(sig, signal_handler)