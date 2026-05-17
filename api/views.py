import json
import logging
import re
import time
import urllib.parse

import requests
from bs4 import BeautifulSoup
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Session — shared across requests for keep-alive
# ──────────────────────────────────────────────
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "DNT": "1",
})


# ──────────────────────────────────────────────
# Cache key helper
# ──────────────────────────────────────────────
def make_cache_key(query: str, start: int = None, limit: int = None) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_]", "_", query.lower().strip())
    safe = re.sub(r"_+", "_", safe).strip("_")
    base = f"products_{safe}"
    if start is not None and limit is not None:
        return f"{base}_{start}_{limit}"[:200]
    return base[:200]


# ──────────────────────────────────────────────
# DuckDuckGo Shopping scraper
# ──────────────────────────────────────────────
DDG_SHOPPING_URL = "https://duckduckgo.com/"
DDG_RESULTS_URL  = "https://links.duckduckgo.com/d.js"

# Container class selectors DDG has used (falls back through list)
DDG_CONTAINER_CLASSES = [
    "sh-np__click-target",   # shopping card link wrapper
    "ais-hits--item",
    "result--shopping",
]

DDG_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://duckduckgo.com/",
    "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
}


def _get_vqd(query: str) -> str | None:
    """
    Get the vqd token DDG requires for searches.
    This is embedded in the DDG homepage response for a given query.
    """
    try:
        resp = SESSION.get(
            DDG_SHOPPING_URL,
            params={"q": query, "ia": "shopping", "iax": "shopping"},
            headers=DDG_HEADERS,
            timeout=10,
        )
        resp.raise_for_status()
        # vqd is in the page as: vqd="4-..."  or  vqd='4-...'
        match = re.search(r'vqd[=:]["\']?([\d-]+)["\']?', resp.text)
        if match:
            return match.group(1)
        logger.warning("vqd not found in DDG response")
        return None
    except Exception as e:
        logger.error(f"_get_vqd error: {e}")
        return None


def _parse_ddg_shopping_page(html: str) -> list[dict]:
    """
    Parse DDG shopping HTML and extract product cards.
    DDG shopping embeds product data as JSON inside <script> tags
    and also renders cards in the DOM.
    """
    products = []

    # ── Strategy 1: extract from embedded JSON ──────────────────
    # DDG often puts product data in a JS variable like:
    # DDG.duckbar.load('shopping', {...})  or  nrj('...', {...})
    json_blocks = re.findall(
        r"DDG\.duckbar\.load\('shopping',\s*(\{.*?\})\s*\)",
        html,
        re.DOTALL,
    )
    for block in json_blocks:
        try:
            data = json.loads(block)
            items = data.get("results", data.get("data", []))
            for item in items:
                products.append({
                    "name":    item.get("title") or item.get("name", ""),
                    "price":   item.get("price", ""),
                    "image":   item.get("image") or item.get("thumbnail", ""),
                    "buy_url": item.get("url") or item.get("clickUrl", ""),
                    "source":  item.get("merchant") or item.get("domain", ""),
                    "rating":  str(item.get("rating", "")),
                })
        except json.JSONDecodeError:
            continue

    if products:
        logger.info(f"Extracted {len(products)} products from DDG JSON")
        return products

    # ── Strategy 2: parse DOM product cards ────────────────────
    soup = BeautifulSoup(html, "html.parser")

    # DDG shopping cards — try multiple selectors
    card_selectors = [
        {"data-testid": "shopping-result"},
        {"class": re.compile(r"shopping-result|sh-np|product-card")},
    ]

    cards = []
    for selector in card_selectors:
        cards = soup.find_all(attrs=selector)
        if cards:
            logger.info(f"Found {len(cards)} cards with selector: {selector}")
            break

    for card in cards:
        name  = _text(card, [
            {"class": re.compile(r"title|name|product-name")},
            "h2", "h3",
        ])
        price = _text(card, [
            {"class": re.compile(r"price|cost")},
        ])
        source = _text(card, [
            {"class": re.compile(r"merchant|source|domain|store")},
        ])
        img_tag = card.find("img")
        image = img_tag["src"] if img_tag and img_tag.get("src", "").startswith("http") else ""

        link_tag = card.find("a", href=True)
        buy_url = link_tag["href"] if link_tag else ""
        if buy_url.startswith("/"):
            buy_url = "https://duckduckgo.com" + buy_url

        if name:
            products.append({
                "name":    name,
                "price":   price,
                "image":   image,
                "buy_url": buy_url,
                "source":  source,
                "rating":  "",
            })

    logger.info(f"Extracted {len(products)} products from DDG DOM")
    return products


def _text(tag, selectors: list) -> str:
    """Helper: try a list of selectors and return the first non-empty text."""
    for sel in selectors:
        if isinstance(sel, dict):
            found = tag.find(attrs=sel)
        else:
            found = tag.find(sel)
        if found:
            t = found.get_text(strip=True)
            if t:
                return t
    return ""


def _parse_ddg_json_response(text: str) -> list[dict]:
    """
    DDG d.js endpoint returns JSONP-like: nrj('...', {...});
    Extract the JSON payload from it.
    """
    products = []
    # Strip the JSONP wrapper
    match = re.search(r"nrj\('[^']*',\s*(\{.*\})\s*\)", text, re.DOTALL)
    if not match:
        # Try raw JSON
        try:
            data = json.loads(text)
            match_data = data
        except Exception:
            return products
    else:
        try:
            data = json.loads(match.group(1))
        except json.JSONDecodeError:
            return products

    results = data.get("results", [])
    for r in results:
        # Shopping results have a 'shopping' key
        shopping = r.get("shopping")
        if shopping:
            products.append({
                "name":    shopping.get("title", r.get("t", "")),
                "price":   shopping.get("price", ""),
                "image":   shopping.get("image", ""),
                "buy_url": shopping.get("url", r.get("u", "")),
                "source":  shopping.get("merchant", r.get("d", "")),
                "rating":  str(shopping.get("rating", "")),
            })
        # Sometimes it's a plain web result about a product
        elif r.get("t") and r.get("u"):
            products.append({
                "name":    r.get("t", ""),
                "price":   "",
                "image":   "",
                "buy_url": r.get("u", ""),
                "source":  r.get("d", ""),
                "rating":  "",
            })

    return products


def scrape_ddg_shopping(query: str) -> list[dict]:
    """
    Main scraper — tries two DDG endpoints in sequence:
      1. DDG homepage shopping tab (HTML parse)
      2. DDG d.js JSONP endpoint (JSON parse)
    Falls back gracefully if either fails.
    """
    products = []

    # ── Attempt 1: hit the DDG shopping tab directly ────────────
    try:
        resp = SESSION.get(
            DDG_SHOPPING_URL,
            params={
                "q":    query,
                "ia":   "shopping",
                "iax":  "shopping",
                "kp":   "-1",   # safe search off
                "kl":   "in-en", # India / English
            },
            headers=DDG_HEADERS,
            timeout=12,
        )
        resp.raise_for_status()
        logger.info(f"DDG homepage response: {resp.status_code}, {len(resp.text)} chars")
        products = _parse_ddg_shopping_page(resp.text)
    except Exception as e:
        logger.warning(f"DDG homepage attempt failed: {e}")

    if products:
        return products

    # ── Attempt 2: DDG d.js JSONP endpoint ─────────────────────
    try:
        vqd = _get_vqd(query)
        if vqd:
            time.sleep(0.3)
            resp2 = SESSION.get(
                DDG_RESULTS_URL,
                params={
                    "q":    query,
                    "vqd":  vqd,
                    "ia":   "shopping",
                    "iax":  "shopping",
                    "kl":   "in-en",
                },
                headers={**DDG_HEADERS, "Accept": "application/javascript, */*"},
                timeout=12,
            )
            resp2.raise_for_status()
            logger.info(f"DDG d.js response: {resp2.status_code}, {len(resp2.text)} chars")
            products = _parse_ddg_json_response(resp2.text)
    except Exception as e:
        logger.warning(f"DDG d.js attempt failed: {e}")

    if products:
        return products

    logger.error(f"All DDG attempts failed for query: '{query}'")
    return []


def filter_valid(products: list[dict]) -> list[dict]:
    """Keep only products that have at least a name."""
    return [p for p in products if p.get("name") and len(p["name"]) > 2]


# ──────────────────────────────────────────────
# API View
# ──────────────────────────────────────────────
@api_view(["GET"])
def get_products(request):
    query      = request.GET.get("q", "").strip()
    start      = int(request.GET.get("start", 0))
    limit      = min(int(request.GET.get("limit", 60)), 100)

    if not query:
        return Response({"error": "No query provided"}, status=400)

    main_key  = make_cache_key(query)
    paged_key = make_cache_key(query, start, limit)

    # Two-tier cache
    cached_page = cache.get(paged_key)
    if cached_page is not None:
        logger.info(f"Cache hit (page): {paged_key}")
        return Response(cached_page)

    all_products = cache.get(main_key)
    if all_products is not None:
        logger.info(f"Cache hit (main): {main_key}")
        page = all_products[start:start + limit]
        cache.set(paged_key, page, timeout=300)
        return Response(page)

    # Scrape
    try:
        products = scrape_ddg_shopping(query)
        products = filter_valid(products)

        if not products:
            logger.warning(f"No products found for: '{query}'")
            return Response([])

        cache.set(main_key, products, timeout=900)   # 15 min
        page = products[start:start + limit]
        cache.set(paged_key, page, timeout=300)      # 5 min
        return Response(page)

    except Exception as e:
        logger.error(f"Unhandled error for query '{query}': {e}")
        return Response({"error": "Failed to fetch products"}, status=500)
