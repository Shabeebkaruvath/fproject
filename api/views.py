import requests
from bs4 import BeautifulSoup
from rest_framework.response import Response
from rest_framework.decorators import api_view
import urllib.parse  # to parse URLs
import re
 
 

@api_view(['GET'])
def get_products(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({"error": "No query provided"}, status=400)
    
    url = f"https://www.google.com/search?tbm=shop&hl=en&psb=1&q={query}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return Response({"error": "Failed to fetch data"}, status=500)
    
    soup = BeautifulSoup(response.text, "html.parser")
    products = []

    for item in soup.select(".sh-dgr__content"):
        # Get product name
        name = item.select_one(".tAxDx").text if item.select_one(".tAxDx") else "No name"
        
        # Get price
        price = item.select_one(".a8Pemb").text if item.select_one(".a8Pemb") else "No price"
        
        # Get product link
        link_tag = item.select_one("a")
        link = link_tag["href"] if link_tag else ""
        if link.startswith("/url?q="):
            link = urllib.parse.unquote(link[7:])
        
        # Get image URL - directly from the img tag inside ArOc1c div
        image = ""
        img_tag = item.select_one("div.ArOc1c img[role='presentation']")
        if img_tag and "src" in img_tag.attrs:
            image = img_tag["src"]

        products.append({
            "name": name,
            "price": price,
            "image": image,
            "buy_url": "https://www.google.com" + link if link.startswith("/") else link,
        })
    
    return Response(products)