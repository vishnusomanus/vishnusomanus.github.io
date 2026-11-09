import os
import re
import html

demo_dir = os.path.dirname(os.path.abspath(__file__))

# 1. Featured
featured = [
    {
        'title': 'Atelier North',
        'category': 'Featured',
        'tag': 'Photographer',
        'desc': 'Oslo studio. Houses, portraits, coast.',
        'href': 'portfolio/index.html',
        'img': 'portfolio/images/fjord.jpg'
    },
    {
        'title': 'Lumen Goods',
        'category': 'Featured',
        'tag': 'Online Shop',
        'desc': 'Hudson. Lamps, linen, clay. A bag that checks out.',
        'href': 'shop/index.html',
        'img': 'shop/images/bowl.jpg'
    },
    {
        'title': 'Nimbus',
        'category': 'Featured',
        'tag': 'Software SaaS',
        'desc': 'A board for small studios. Pricing, customers, signup.',
        'href': 'landing/index.html',
        'img': 'landing/images/office.jpg'
    },
    {
        'title': 'Marrow',
        'category': 'Featured',
        'tag': 'Restaurant',
        'desc': 'Pinhão. One menu, two seatings, a table request.',
        'href': 'restaurant/index.html',
        'img': 'restaurant/images/room.jpg'
    },
    {
        'title': 'Field Issue',
        'category': 'Featured',
        'tag': 'Magazine',
        'desc': 'Issue 19, with the stories in full.',
        'href': 'journal/index.html',
        'img': 'journal/images/spices.jpg'
    },
    {
        'title': 'Harbor & Co',
        'category': 'Featured',
        'tag': 'Real Estate',
        'desc': 'A short list. Each house has its own page.',
        'href': 'realty/index.html',
        'img': 'realty/images/saltbox.jpg'
    },
    {
        'title': 'Studio',
        'category': 'Featured',
        'tag': 'Design Studio',
        'desc': 'Montréal. Filterable work index, case studies and a brief estimator.',
        'href': 'studio/index.html',
        'img': 'studio/assets/img/og-image.png'
    }
]

# 2. E-Commerce
ecom_dir = os.path.join(demo_dir, 'e-commerce')
ecom_folders = sorted([d for d in os.listdir(ecom_dir) if os.path.isdir(os.path.join(ecom_dir, d)) and d != 'zSupportImages'])

ecom_tags = {
    'Amado': ('Furniture Store', 'Modern furniture ecommerce website with clean grid and cart.'),
    'Aranoz': ('Furniture & Decor', 'Elegant furniture and interior design shop layout.'),
    'Ashion': ('Fashion Boutique', 'Trendy apparel and modern clothing ecommerce collection.'),
    'BookSaw': ('Bookstore', 'Book store template with featured books, offers and reviews.'),
    'Bookly': ('Bookstore & Publishing', 'Clean bookstore ecommerce website with book grid and categories.'),
    'Caraft': ('Handicrafts & Decor', 'Artisanal crafts, handmade goods and home decor showcase.'),
    'ColoShop': ('Fashion & Apparel', 'Colorful fashion store with countdown promos and filterable products.'),
    'CozaStore': ('Apparel & Accessories', 'Clean, modern fashion shop with quickview and full store flow.'),
    'Cycle': ('Bicycle Shop', 'Bicycle and cycling accessories store with bold presentation.'),
    'Eflyer': ('Electronics & Fashion', 'Versatile multi-category retail store with sliders and deals.'),
    'Eiser': ('Online Retail', 'Comprehensive ecommerce storefront with cart, checkout and tracking.'),
    'Eshopper': ('Fashion Outlet', 'Bootstrap shopping template with price sliders and product carousels.'),
    'Essence': ('Fashion Ecommerce', 'Editorial fashion template with side cart and product sliders.'),
    'Famms': ('Modern Fashion', 'Vibrant fashion store with discounts, testimonials and subscribe.'),
    'FoodMart': ('Grocery Store', 'Organic grocery and food mart ecommerce storefront.'),
    'FootWear': ('Shoes & Footwear', 'Specialized footwear and shoe store template with filters.'),
    'FreshShop': ('Organic Produce', 'Fresh fruits, vegetables and organic food ecommerce layout.'),
    'Fruitables': ('Vegetables & Fruits', 'Organic vegetable and organic market website with vegetable shop.'),
    'Fruitkha': ('Fresh Food & Fruits', 'Crisp food store template with news, cart and product details.'),
    'Furni': ('Furniture & Interior', 'Bootstrap 5 furniture and interior design store template.'),
    'Hexashop': ('Fashion Ecommerce', 'Modern apparel store with men, women and kid collections.'),
    'Kaira': ('Fashion & Lifestyle', 'Minimalist lifestyle and apparel fashion store template.'),
    'Karma': ('Sneakers & Streetwear', 'High-energy sneaker and streetwear ecommerce storefront.'),
    'Majestic': ('Digital & Business', 'Landing and ecommerce template for modern products.'),
    'MaleFashion': ('Men’s Apparel', 'Tailored men’s clothing and accessories shop with blog and cart.'),
    'Mellow': ('Hotel & Resort', 'Warm hospitality and hotel booking website template.'),
    'MiniShop': ('Minimalist Store', 'Minimalist ecommerce store with clean layout and collections.'),
    'MiniStore': ('Gadgets & Gear', 'Modern tech gadgets, audio and electronics store template.'),
    'Ogani': ('Organic & Grocery', 'Fresh food and organic produce market with categories and blog.'),
    'Organic': ('Natural Market', 'Healthy organic food and grocery store with product grid.'),
    'PillowMart': ('Bedding & Home', 'Pillows, bedding and comfortable home essentials store.'),
    'Productly': ('Design Agency & Shop', 'Product design agency landing page and showcase.'),
    'ShionHouse': ('Apparel Collection', 'Chic fashion and lifestyle retail shop template.'),
    'ShopMax': ('Shopping Marketplace', 'Clean retail store layout with featured items and collections.'),
    'Shoppers': ('Fashion & Retail', 'Multi-page fashion store with filter sidebar and checkout.'),
    'Stylish': ('Shoes & Footwear', 'Trendy shoe store and footwear ecommerce template.'),
    'ThePlaza': ('Modern Marketplace', 'Versatile multi-purpose marketplace and storefront.'),
    'Tropiko': ('Fruits & Juice', 'Tropical fruits, juices and healthy lifestyle shop.'),
    'Vegefoods': ('Vegetables & Greens', 'Fresh organic vegetable shop with deals of the day.'),
    'Violet': ('Women’s Fashion', 'Chic women’s apparel and accessories retail store.'),
    'Waggy': ('Pet Shop & Supplies', 'Pet food, toys and animal supplies ecommerce storefront.'),
    'Watch': ('Luxury Watches', 'High-end timepiece and watch boutique website template.'),
    'Winkel': ('Fashion Catalog', 'Refined fashion catalogue and apparel shopping storefront.'),
    'Wish': ('Fashion & Apparel', 'Modern multi-page fashion and clothing shop template.')
}

ecom_items = []
for f in ecom_folders:
    tag, desc = ecom_tags.get(f, ('E-Commerce', f'{f} ecommerce template.'))
    idx = f'e-commerce/{f}/public/index.html' if f in ['Majestic', 'Productly'] else f'e-commerce/{f}/index.html'
    img = f'e-commerce/zSupportImages/{f.lower()}.png'
    ecom_items.append({
        'title': f,
        'category': 'E-Commerce',
        'tag': tag,
        'desc': desc,
        'href': idx,
        'img': img
    })

# 3. Freeframe
readme_path = os.path.join(demo_dir, 'README.md')
with open(readme_path, encoding='utf-8') as rf:
    text = rf.read()

categories_raw = re.findall(r'### ([^\n]+)\n\n\| \| \|\n\| --- \| --- \|\n(.*?)(?=\n### |\n## Questions|\Z)', text, re.DOTALL)
freeframe_by_cat = {}
for cat_name, table in categories_raw:
    rows = table.strip().split('\n')
    freeframe_by_cat[cat_name] = []
    for row in rows:
        if not row.strip() or row.startswith('| ---'):
            continue
        m = re.search(r'\*\*\[(.*?)\]\((.*?)/\)\*\*(?:<br>|\n)(.*?)(?:<br>|\n)\[Live preview\]', row)
        if m:
            title = m.group(1).strip()
            folder = m.group(2).strip()
            desc = m.group(3).strip()
            desc = re.sub(r'<br>.*', '', desc).strip()
            freeframe_by_cat[cat_name].append({
                'title': title,
                'category': cat_name,
                'tag': cat_name,
                'desc': desc,
                'href': f'{folder}/index.html',
                'img': f'{folder}/assets/img/og-image.png'
            })

all_sections = [
    ('Featured', 'Featured Projects', 'Highlighted showcase projects and repo tools', featured),
    ('E-Commerce', 'E-Commerce Storefronts', 'Online retail, marketplace, grocery, and fashion shop templates', ecom_items),
]

desc_map = {
    'App': 'Software products, mobile apps, SaaS dashboards, and documentation',
    'Business': 'Agencies, consultancies, law, finance, and professional services',
    'Store': 'Specialty boutique shops, roasters, bookstores, and florists',
    'Health & Fitness': 'Gyms, spas, wellness clinics, medical, and personal coaching',
    'Education': 'Online learning platforms, academies, and instructional workshops',
    'Community': 'Nonprofits, conferences, cultural events, and community centers',
    'Portfolio': 'Creative portfolios for designers, photographers, and artists',
    'Travel': 'Hotels, country inns, campgrounds, and travel tour agencies',
    'Blog': 'Editorial magazines, developer blogs, and personal writing',
    'Media': 'Podcasts, music artists, cinemas, and streaming platforms',
    'Personal': 'Personal profiles, authors, and wedding announcements'
}

for cat_name in ['App', 'Business', 'Store', 'Health & Fitness', 'Education', 'Community', 'Portfolio', 'Travel', 'Blog', 'Media', 'Personal']:
    if cat_name in freeframe_by_cat:
        all_sections.append((cat_name, f'{cat_name} Templates', desc_map.get(cat_name, f'{cat_name} templates'), freeframe_by_cat[cat_name]))

total_items = sum(len(s[3]) for s in all_sections)

# Build HTML with fully robust, responsive mobile-friendly CSS
out = []
out.append(f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Finished Sites &amp; Templates — Offline Showcase</title>
<link rel="stylesheet" href="css/tailwind.css" />
<style>
  /* Robust Mobile-First Styles & Reset */
  *, *::before, *::after {{
    box-sizing: border-box;
  }}
  html, body {{
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
  }}
  html {{
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }}
  body {{
    margin: 0;
    min-height: 100vh;
    min-height: 100dvh;
    background-color: #f3efe6;
    color: #1c1915;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: flex;
    flex-direction: column;
  }}

  /* Typography */
  .font-display {{
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  }}
  .font-mono {{
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }}

  /* Header */
  .site-header {{
    position: sticky;
    top: 0;
    z-index: 40;
    width: 100%;
    max-width: 100vw;
    background-color: rgba(234, 229, 219, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e4ddd0;
    padding: 0.625rem 1rem;
    box-sizing: border-box;
  }}
  @media (min-width: 640px) {{
    .site-header {{
      padding: 0.875rem 1.5rem;
    }}
  }}
  @media (min-width: 1024px) {{
    .site-header {{
      padding: 0.875rem 2rem;
    }}
  }}
  .header-content {{
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }}

  /* Main Container */
  .main-wrapper {{
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 1.25rem 1rem 3rem;
  }}
  @media (min-width: 640px) {{
    .main-wrapper {{
      padding: 2rem 1.5rem 4rem;
      max-width: 1400px;
    }}
  }}
  @media (min-width: 1024px) {{
    .main-wrapper {{
      padding: 2.5rem 2rem 5rem;
    }}
  }}

  /* Hero Title */
  .hero-title {{
    font-family: ui-serif, Georgia, serif;
    font-weight: 700;
    font-size: clamp(2rem, 5.5vw, 3.75rem);
    line-height: 1.08;
    letter-spacing: -0.025em;
    color: #1c1915;
    margin: 0.375rem 0 0;
  }}

  /* Search & Filter Section */
  .filter-controls-area {{
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }}
  @media (min-width: 640px) {{
    .filter-controls-area {{
      margin-top: 2rem;
      gap: 1rem;
    }}
  }}

  /* Search Bar */
  .search-box-wrap {{
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  .search-icon-left {{
    position: absolute;
    left: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #8a7d6b;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  #search-input {{
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
    height: 3rem;
    padding: 0 4.25rem 0 2.75rem;
    font-size: 16px; /* Critical: prevents auto-zoom on iOS Safari */
    border-radius: 0.875rem;
    border: 1px solid #e4ddd0;
    background-color: #ffffff;
    color: #1c1915;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }}
  #search-input:focus {{
    outline: none;
    border-color: #1c1915;
    box-shadow: 0 0 0 3px rgba(28, 25, 21, 0.12);
  }}
  #clear-search {{
    position: absolute;
    right: 0.625rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #8a7d6b;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.5rem 0.625rem;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: color 0.15s ease, background-color 0.15s ease;
  }}
  #clear-search:hover {{
    color: #1c1915;
    background-color: #f0ebe0;
  }}

  /* Mobile Dropdown Category Picker */
  .mobile-category-picker {{
    display: block;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    position: relative;
  }}
  @media (min-width: 640px) {{
    .mobile-category-picker {{
      display: none; /* Desktop uses pill buttons */
    }}
  }}
  #mobile-category-select {{
    width: 100%;
    box-sizing: border-box;
    height: 2.75rem;
    padding: 0 2.5rem 0 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1c1915;
    background-color: #ffffff;
    border: 1px solid #e4ddd0;
    border-radius: 0.75rem;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  }}
  #mobile-category-select:focus {{
    outline: none;
    border-color: #1c1915;
    box-shadow: 0 0 0 3px rgba(28, 25, 21, 0.12);
  }}
  .select-chevron-icon {{
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.125rem;
    height: 1.125rem;
    color: #8a7d6b;
    pointer-events: none;
  }}

  /* Filter Track: Wrapped, clean, responsive */
  .filter-track-wrap {{
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  .filter-track {{
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    align-items: center;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  @media (min-width: 640px) {{
    .filter-track {{
      gap: 0.5rem;
    }}
  }}

  /* Filter Pill Buttons */
  .filter-pill {{
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    box-sizing: border-box;
    min-height: 2rem;
    padding: 0.35rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid #d8d0c2;
    background-color: transparent;
    color: #5c5348;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
  }}
  @media (min-width: 640px) {{
    .filter-pill {{
      min-height: 2.25rem;
      padding: 0.375rem 0.875rem;
    }}
  }}
  .filter-pill:active {{
    transform: scale(0.96);
  }}
  .filter-pill.active {{
    background-color: #1c1915 !important;
    color: #f3efe6 !important;
    border-color: #1c1915 !important;
  }}
  @media (hover: hover) and (pointer: fine) {{
    .filter-pill:not(.active):hover {{
      background-color: #e5ded2;
      color: #1c1915;
    }}
  }}

  /* Results Bar */
  .results-bar {{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #8a7d6b;
    font-weight: 500;
    border-top: 1px solid #e4ddd0;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}

  /* Section Styles */
  .category-section {{
    margin-top: 2.5rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  @media (min-width: 640px) {{
    .category-section {{
      margin-top: 3.5rem;
    }}
  }}
  .section-header {{
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    border-bottom: 1px solid #e4ddd0;
    padding-bottom: 0.625rem;
    margin-bottom: 1.25rem;
  }}
  .section-title {{
    font-family: ui-serif, Georgia, serif;
    font-size: clamp(1.35rem, 3.2vw, 1.875rem);
    font-weight: 700;
    letter-spacing: -0.015em;
    color: #1c1915;
    margin: 0;
  }}
  .section-subtitle {{
    font-size: 0.8125rem;
    color: #8a7d6b;
    margin: 0.25rem 0 0;
  }}
  .top-link {{
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8a7d6b;
    text-decoration: none;
    transition: color 0.15s ease;
  }}
  .top-link:hover {{
    color: #1c1915;
  }}

  /* Fluid Responsive Grid */
  .template-grid {{
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  @media (min-width: 540px) {{
    .template-grid {{
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem;
    }}
  }}
  @media (min-width: 960px) {{
    .template-grid {{
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
    }}
  }}
  @media (min-width: 1360px) {{
    .template-grid {{
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.5rem;
    }}
  }}

  /* Template Card */
  .template-card {{
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border: 1px solid #e4ddd0;
    border-radius: 1.25rem;
    overflow: hidden;
    text-decoration: none;
    color: #161616;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }}
  @media (hover: hover) and (pointer: fine) {{
    .template-card:hover {{
      transform: translateY(-4px);
      box-shadow: 0 14px 28px -10px rgba(28, 25, 21, 0.12), 0 4px 8px -2px rgba(28, 25, 21, 0.05);
      border-color: #c5beaf;
    }}
  }}
  .template-card:active {{
    transform: scale(0.99);
  }}

  /* Card Image Media */
  .card-media {{
    aspect-ratio: 16 / 10;
    width: 100%;
    position: relative;
    background-color: #e4ddd0;
    overflow: hidden;
  }}
  .card-media img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0.95;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }}
  @media (hover: hover) and (pointer: fine) {{
    .template-card:hover .card-media img {{
      transform: scale(1.03);
      opacity: 1;
    }}
  }}

  /* Card Content */
  .card-body {{
    padding: 1rem 1.125rem 1.25rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
  }}
  .card-tag-row {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }}
  .card-tag {{
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #8a7d6b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }}
  .card-arrow {{
    font-size: 0.75rem;
    font-weight: 600;
    color: #8a7d6b;
    transition: transform 0.2s ease, color 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }}
  .template-card:hover .card-arrow {{
    transform: translateX(3px);
    color: #1c1915;
  }}
  .card-title {{
    font-family: ui-serif, Georgia, serif;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.25;
    margin: 0.35rem 0 0;
    color: #1c1915;
  }}
  .card-desc {{
    font-size: 0.8125rem;
    line-height: 1.5;
    color: #5c5348;
    margin: 0.35rem 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }}

  /* Floating Back to Top Button */
  #back-to-top-btn {{
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 50;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 9999px;
    background-color: #1c1915;
    color: #f3efe6;
    border: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
  }}
  @media (min-width: 640px) {{
    #back-to-top-btn {{
      bottom: 2rem;
      right: 2rem;
      width: 3rem;
      height: 3rem;
    }}
  }}
  #back-to-top-btn.visible {{
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }}
  #back-to-top-btn.hidden-btn {{
    opacity: 0;
    visibility: hidden;
    transform: translateY(12px);
    pointer-events: none;
  }}

  /* Footer */
  .site-footer {{
    margin-top: 4rem;
    border-top: 1px solid #e4ddd0;
    background-color: rgba(234, 229, 219, 0.5);
    padding: 1.5rem 1rem;
    font-size: 0.75rem;
    color: #8a7d6b;
  }}
  @media (min-width: 640px) {{
    .site-footer {{
      padding: 2rem;
    }}
  }}
  .footer-content {{
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }}
</style>
</head>
<body id="top">

<!-- Sticky Header -->
<header class="site-header">
  <div class="header-content">
    <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0;">
      <a href="../index.html" style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8a7d6b; text-decoration: none; flex-shrink: 0;">
        <span>← Main</span>
      </a>
      <span style="color: #c5beaf; flex-shrink: 0;">/</span>
      <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; color: #8a7d6b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Offline Showcase</span>
    </div>

    <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; font-size: 0.75rem; font-weight: 500; color: #5c5348;">
      <span id="header-count" class="font-mono" style="background: #e4ddd0; padding: 0.2rem 0.6rem; border-radius: 9999px; color: #4a4237; font-size: 0.75rem;">{total_items} sites</span>
    </div>
  </div>
</header>

<main class="main-wrapper">
  <!-- Hero Section -->
  <div style="max-width: 48rem;">
    <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.22em; color: #8a7d6b; font-weight: 600; margin: 0;">Local Offline Library</p>
    <h1 class="hero-title">Finished sites, offline.</h1>
    <p style="margin: 0.75rem 0 0; color: #5c5348; font-size: clamp(0.9375rem, 2vw, 1.125rem); line-height: 1.6;">
      A comprehensive collection of <strong>{total_items}</strong> multi-page website and app templates. Every single project is completely self-contained with zero external CDNs, trackers, or remote fonts.
    </p>
  </div>

  <!-- Search & Filter Controls Area -->
  <div class="filter-controls-area">
    <!-- Search Bar -->
    <div class="search-box-wrap">
      <div class="search-icon-left">
        <svg style="width: 1.125rem; height: 1.125rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input
        type="search"
        id="search-input"
        placeholder="Search {total_items} templates (e.g. coffee, fashion, law, dashboard, portfolio)..."
        autocomplete="off"
        spellcheck="false"
        aria-label="Search templates by keyword"
      />
      <button
        type="button"
        id="clear-search"
        style="display: none;"
        aria-label="Clear search input"
      >
        ✕ Clear
      </button>
    </div>

    <!-- Mobile Dropdown Selector (Clean 1-tap category picker on phones) -->
    <div class="mobile-category-picker">
      <label for="mobile-category-select" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">Filter by Category</label>
      <select id="mobile-category-select" aria-label="Filter templates by category">
        <option value="all">All Categories ({total_items} templates)</option>''')

for cat_slug, cat_title, cat_desc, items in all_sections:
    out.append(f'        <option value="{cat_slug}">{cat_slug} ({len(items)})</option>')

out.append(f'''      </select>
      <div class="select-chevron-icon">
        <svg style="width: 1.125rem; height: 1.125rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Filter Pills (Wrapped and fully responsive on all screen sizes) -->
    <div class="filter-track-wrap">
      <div class="filter-track" id="filter-container" role="tablist" aria-label="Template categories">
        <button class="filter-pill active" data-filter="all" role="tab" aria-selected="true">
          <span>All</span>
          <span class="font-mono" style="font-size: 11px; opacity: 0.85;">({total_items})</span>
        </button>''')

for cat_slug, cat_title, cat_desc, items in all_sections:
    out.append(f'''        <button class="filter-pill" data-filter="{cat_slug}" role="tab" aria-selected="false">
          <span>{cat_slug}</span>
          <span class="font-mono" style="font-size: 11px; opacity: 0.85;">({len(items)})</span>
        </button>''')

out.append(f'''      </div>
    </div>

    <!-- Live Results Counter & Filter Status -->
    <div class="results-bar" id="results-bar">
      <span id="results-count">Showing {total_items} of {total_items} templates</span>
      <span id="results-filter-label" style="display: none;">Filtered: <strong style="color: #1c1915;" id="active-filter-text">All</strong></span>
    </div>
  </div>

  <!-- Empty Search Results State -->
  <div id="no-results" style="display: none; padding: 4rem 1rem; text-align: center;">
    <div style="display: inline-flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 9999px; background: #e4ddd0; color: #8a7d6b; margin-bottom: 0.75rem;">
      <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
    <p class="font-display" style="font-size: 1.5rem; font-weight: 700; color: #1c1915; margin: 0;">No templates found</p>
    <p style="margin: 0.35rem auto 0; font-size: 0.875rem; color: #8a7d6b; max-width: 24rem;">No templates matched your query. Try clearing the search or choosing another category.</p>
    <button type="button" id="reset-filters-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #1c1915; color: #f3efe6; border: none; border-radius: 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; cursor: pointer;">Reset Filters</button>
  </div>
''')

# Render sections and cards
for cat_slug, cat_title, cat_desc, items in all_sections:
    sec_id = 'sec-' + cat_slug.lower().replace(' ', '-').replace('&', 'and')
    out.append(f'''
  <!-- Category Section: {cat_slug} -->
  <section class="category-section" data-category="{cat_slug}" id="{sec_id}">
    <div class="section-header">
      <div>
        <h2 class="section-title">
          {html.escape(cat_title)}
          <span class="font-mono" style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.875rem; font-weight: 400; color: #8a7d6b; margin-left: 0.35rem;">({len(items)})</span>
        </h2>
        <p class="section-subtitle">{html.escape(cat_desc)}</p>
      </div>
      <a href="#top" class="top-link">Top ↑</a>
    </div>

    <div class="template-grid">''')

    for it in items:
        safe_title = html.escape(it['title'])
        safe_tag = html.escape(it['tag'])
        safe_desc = html.escape(it['desc'])
        safe_href = html.escape(it['href'])
        safe_img = html.escape(it['img'])
        data_cat = html.escape(it['category'])

        out.append(f'''      <a
        href="{safe_href}"
        class="template-card"
        data-category="{data_cat}"
        data-title="{safe_title.lower()}"
        data-desc="{safe_desc.lower()}"
        data-tag="{safe_tag.lower()}"
      >
        <div class="card-media">
          <img
            src="{safe_img}"
            alt="{safe_title}"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="card-body">
          <div class="card-tag-row">
            <span class="card-tag">{safe_tag}</span>
            <span class="card-arrow">Open →</span>
          </div>
          <h3 class="card-title">{safe_title}</h3>
          <p class="card-desc">{safe_desc}</p>
        </div>
      </a>''')

    out.append('''    </div>
  </section>''')

out.append(f'''
</main>

<!-- Floating Back to Top Button -->
<button
  type="button"
  id="back-to-top-btn"
  class="hidden-btn"
  aria-label="Back to top"
>
  <svg style="width: 1.25rem; height: 1.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
  </svg>
</button>

<!-- Footer -->
<footer class="site-footer">
  <div class="footer-content">
    <p style="margin: 0;">All {total_items} projects are self-contained and run completely offline.</p>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="#top" class="top-link">Back to top ↑</a>
      <span>•</span>
      <a href="../index.html" style="color: #8a7d6b; text-decoration: none;">Main Site</a>
    </div>
  </div>
</footer>

<script>
  (function() {{
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const mobileCatSelect = document.getElementById('mobile-category-select');
    const filterPills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.template-card');
    const sections = document.querySelectorAll('.category-section');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const resultsFilterLabel = document.getElementById('results-filter-label');
    const activeFilterText = document.getElementById('active-filter-text');
    const resetBtn = document.getElementById('reset-filters-btn');
    const headerCount = document.getElementById('header-count');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const totalItems = {total_items};

    let currentFilter = 'all';

    function setCategoryFilter(newFilter) {{
      currentFilter = newFilter;

      // Sync pills
      filterPills.forEach(p => {{
        if (p.getAttribute('data-filter') === currentFilter) {{
          p.classList.add('active');
          p.setAttribute('aria-selected', 'true');
        }} else {{
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        }}
      }});

      // Sync mobile dropdown
      if (mobileCatSelect && mobileCatSelect.value !== currentFilter) {{
        mobileCatSelect.value = currentFilter;
      }}

      filterTemplates();

      // Scroll smoothly to section when specific category selected and search empty
      if (currentFilter !== 'all' && !searchInput.value.trim()) {{
        const targetSec = document.querySelector('.category-section[data-category=\"' + currentFilter + '\"]');
        if (targetSec) {{
          const navOffset = 64;
          const elementPosition = targetSec.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({{ top: elementPosition - navOffset, behavior: 'smooth' }});
        }}
      }}
    }}

    function filterTemplates() {{
      const query = (searchInput.value || '').trim().toLowerCase();
      let visibleCount = 0;

      if (query.length > 0) {{
        clearBtn.style.display = 'block';
      }} else {{
        clearBtn.style.display = 'none';
      }}

      cards.forEach(card => {{
        const cat = card.getAttribute('data-category');
        const title = card.getAttribute('data-title') || '';
        const desc = card.getAttribute('data-desc') || '';
        const tag = card.getAttribute('data-tag') || '';

        const matchesCat = (currentFilter === 'all' || cat === currentFilter);
        const matchesQuery = !query || title.includes(query) || desc.includes(query) || tag.includes(query) || cat.toLowerCase().includes(query);

        if (matchesCat && matchesQuery) {{
          card.style.display = 'flex';
          visibleCount++;
        }} else {{
          card.style.display = 'none';
        }}
      }});

      sections.forEach(section => {{
        const hasVisibleCards = Array.from(section.querySelectorAll('.template-card')).some(c => c.style.display !== 'none');
        section.style.display = hasVisibleCards ? '' : 'none';
      }});

      resultsCount.textContent = 'Showing ' + visibleCount + ' of ' + totalItems + ' templates';
      headerCount.textContent = visibleCount + ' sites';

      if (currentFilter !== 'all' || query) {{
        resultsFilterLabel.style.display = 'inline';
        if (currentFilter !== 'all') {{
          activeFilterText.textContent = query ? currentFilter + ' ("' + query + '")' : currentFilter;
        }} else {{
          activeFilterText.textContent = '"' + query + '"';
        }}
      }} else {{
        resultsFilterLabel.style.display = 'none';
      }}

      if (visibleCount === 0) {{
        noResults.style.display = 'block';
      }} else {{
        noResults.style.display = 'none';
      }}
    }}

    searchInput.addEventListener('input', filterTemplates);

    clearBtn.addEventListener('click', () => {{
      searchInput.value = '';
      searchInput.focus();
      filterTemplates();
    }});

    // Keyboard shortcut: '/' focuses search input, 'Esc' clears
    window.addEventListener('keydown', (e) => {{
      if (e.key === '/' && document.activeElement !== searchInput) {{
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }} else if (e.key === 'Escape' && document.activeElement === searchInput) {{
        searchInput.value = '';
        searchInput.blur();
        filterTemplates();
      }}
    }});

    // Pill click listener
    filterPills.forEach(pill => {{
      pill.addEventListener('click', () => {{
        setCategoryFilter(pill.getAttribute('data-filter'));
      }});
    }});

    // Mobile dropdown change listener
    if (mobileCatSelect) {{
      mobileCatSelect.addEventListener('change', (e) => {{
        setCategoryFilter(e.target.value);
      }});
    }}

    resetBtn.addEventListener('click', () => {{
      searchInput.value = '';
      setCategoryFilter('all');
    }});

    // Scroll listener for back-to-top button
    let ticking = false;
    window.addEventListener('scroll', () => {{
      if (!ticking) {{
        window.requestAnimationFrame(() => {{
          if (window.scrollY > 400) {{
            backToTopBtn.classList.remove('hidden-btn');
            backToTopBtn.classList.add('visible');
          }} else {{
            backToTopBtn.classList.add('hidden-btn');
            backToTopBtn.classList.remove('visible');
          }}
          ticking = false;
        }});
        ticking = true;
      }}
    }}, {{ passive: true }});

    backToTopBtn.addEventListener('click', () => {{
      window.scrollTo({{ top: 0, behavior: 'smooth' }});
    }});
  }})();
</script>
</body>
</html>
''')

output_path = os.path.join(demo_dir, 'index.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print(f'Successfully built self-contained responsive {output_path} ({total_items} items, {os.path.getsize(output_path)} bytes)')
