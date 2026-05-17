import asyncio
import atexit
import concurrent.futures
import json
import logging
import signal
import time
import urllib.parse

import aiohttp
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DRIVER_POOL_SIZE = 3
driver_pool = []


def create_driver():
    """Create and configure a headless Chrome WebDriver."""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--disable-notifications')
    chrome_options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(settings.SELENIUM_TIMEOUT + 5)
    return driver


def get_driver_from_pool():
    """Return a driver from the pool, or create one if the pool is empty."""
    global driver_pool
    if not driver_pool:
        driver_pool = [create_driver() for _ in range(DRIVER_POOL_SIZE)]
    return driver_pool.pop() if driver_pool else create_driver()


def return_driver_to_pool(driver):
    """Return a used driver to the pool for reuse."""
    global driver_pool
    if len(driver_pool) < DRIVER_POOL_SIZE:
        try:
            driver.delete_all_cookies()
            driver_pool.append(driver)
        except Exception as e:
            logger.error(f"Error returning driver to pool: {e}")
            try:
                driver.quit()
            except Exception:
                pass
    else:
        try:
            driver.quit()
        except Exception:
            pass


def extract_product_data(item):
    """Extract product data from a Google Shopping product element."""
    product_data = {
        "name": "No name",
        "price": "No price",
        "image": "",
        "buy_url": "",
        "source": "No source",
    }

    try:
        product_data["name"] = item.find_element(By.CLASS_NAME, "tAxDx").text
    except Exception:
        pass

    try:
        product_data["price"] = item.find_element(By.CLASS_NAME, "a8Pemb").text
    except Exception:
        pass

    try:
        link = item.find_element(By.CSS_SELECTOR, "a.shntl").get_attribute("href")
        if link and link.startswith("/url?q="):
            product_data["buy_url"] = urllib.parse.unquote(link[7:].split('&')[0])
        elif link:
            product_data["buy_url"] = link
    except Exception:
        pass

    try:
        product_data["image"] = item.find_element(
            By.CSS_SELECTOR, "div.ArOc1c img[role='presentation']"
        ).get_attribute("src")
    except Exception:
        pass

    try:
        product_data["source"] = item.find_element(
            By.CSS_SELECTOR, "div.aULzUe.IuHnof"
        ).text
    except Exception:
        pass

    return product_data


def scrape_google_shopping(query):
    """Scrape Google Shopping results for a given query."""
    products = []
    driver = None
    retries = 2

    while retries > 0:
        try:
            driver = get_driver_from_pool()
            url = (
                f"https://www.google.com/search?tbm=shop&hl=en&psb=1"
                f"&q={urllib.parse.quote(query)}&num=50"
            )
            driver.get(url)
            WebDriverWait(driver, settings.SELENIUM_TIMEOUT).until(
                EC.presence_of_element_located((By.CLASS_NAME, "sh-dgr__content"))
            )
            items = driver.find_elements(By.CLASS_NAME, "sh-dgr__content")

            chunk_size = 10
            for i in range(0, len(items), chunk_size):
                chunk = items[i:i + chunk_size]
                with concurrent.futures.ThreadPoolExecutor(max_workers=chunk_size) as executor:
                    products.extend(executor.map(extract_product_data, chunk))
            break

        except Exception as e:
            logger.error(f"Scraping error (attempt {3 - retries}/2): {e}")
            retries -= 1
            if retries == 0:
                logger.error("All scraping attempts failed")
            time.sleep(1)

        finally:
            if driver:
                return_driver_to_pool(driver)

    return products


async def fetch_product_details_async(session, product):
    """Optionally enrich a product with extra data (placeholder for future use)."""
    return product


async def enrich_products_async(products):
    """Run enrichment for all products concurrently in batches."""
    connector = aiohttp.TCPConnector(limit=20, force_close=True, enable_cleanup_closed=True)
    timeout = aiohttp.ClientTimeout(total=10)

    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        batch_size = 20
        enriched = []
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            results = await asyncio.gather(
                *[fetch_product_details_async(session, p) for p in batch],
                return_exceptions=True,
            )
            enriched.extend(r for r in results if not isinstance(r, Exception))
            await asyncio.sleep(0.1)
        return enriched


@api_view(['GET'])
def get_products(request):
    """Return paginated product results, with two-tier caching."""
    query = request.GET.get('q', '').strip()
    start_index = int(request.GET.get('start', 0))
    limit = min(int(request.GET.get('limit', 50)), 100)

    if not query:
        return Response({"error": "No query provided"}, status=400)

    main_cache_key = f"products_{query}"
    paginated_cache_key = f"{main_cache_key}_{start_index}_{limit}"

    paginated_results = cache.get(paginated_cache_key)
    if paginated_results:
        return Response(paginated_results)

    all_products = cache.get(main_cache_key)
    if all_products:
        paginated_results = all_products[start_index:start_index + limit]
        cache.set(paginated_cache_key, paginated_results, timeout=60 * 5)
        return Response(paginated_results)

    try:
        products = scrape_google_shopping(query)

        if not products:
            logger.warning(f"No products found for query: {query}")
            return Response({"results": [], "message": "No products found"})

        # Use asyncio.run() — cleaner than manually managing event loops
        enriched_products = asyncio.run(enrich_products_async(products))

        cache.set(main_cache_key, enriched_products, timeout=60 * 15)
        paginated_results = enriched_products[start_index:start_index + limit]
        cache.set(paginated_cache_key, paginated_results, timeout=60 * 5)

        return Response(paginated_results)

    except Exception as e:
        logger.error(f"Error processing request for query '{query}': {e}")
        return Response({"error": "An error occurred while processing your request"}, status=500)


def cleanup():
    """Quit all pooled WebDriver instances on server shutdown."""
    global driver_pool
    for driver in driver_pool:
        try:
            driver.quit()
        except Exception:
            pass
    driver_pool = []
    logger.info("WebDriver resources cleaned up")


atexit.register(cleanup)

for sig in [signal.SIGINT, signal.SIGTERM]:
    signal.signal(sig, lambda s, f: (cleanup(), exit(0)))