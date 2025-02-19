import requests
from bs4 import BeautifulSoup
from rest_framework.response import Response
from rest_framework.decorators import api_view
import urllib.parse  # to parse URLs

@api_view(['GET'])
def get_products(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({"error": "No query provided"}, status=400)

    # Construct the URL for Google Shopping search
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
        name = item.select_one(".tAxDx").text if item.select_one(".tAxDx") else "No name"
        price = item.select_one(".a8Pemb").text if item.select_one(".a8Pemb") else "No price"
        
        # Extract the link to the official product page
        link_tag = item.select_one("a")
        link = link_tag["href"] if link_tag else ""
        
        # The link might be wrapped in Google search URL like `https://www.google.com/url?q=...`
        if link.startswith("/url?q="):
            link = urllib.parse.unquote(link[7:])  # Remove the '/url?q=' part and decode the URL
        
        # Extract the image URL only from class="ArOc1c"
        image_tag = item.select_one("img.ArOc1c")  # Select image with the specific class
        image = ""
        if image_tag:
            image = image_tag["src"]
            if image.startswith("data:image"):  # If it's a base64 encoded image
                image = image
            elif image:
                image = urllib.parse.urljoin(url, image)  # Make sure it's an absolute URL

        # Constructing the product dictionary
        products.append({
            "name": name,
            "price": price,
            "image": image,
            "buy_url": "https://www.google.com" + link,  # Buy button URL to the official product page
        })

    return Response(products)
