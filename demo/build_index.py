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
    },
    {
        'title': 'Paper Trade',
        'category': 'Featured',
        'tag': 'Trading App',
        'desc': 'Interactive stock & paper trading UI already in this repo.',
        'href': '../paper-trade/index.html',
        'img': 'tailwind-bundle/assets/img/items/Crypto.png'
    },
    {
        'title': 'Wireframe',
        'category': 'Featured',
        'tag': 'Wireframe UI',
        'desc': 'Clean dashboard & app wireframes already in this repo.',
        'href': '../wireframe/index.html',
        'img': 'tailwind-bundle/assets/img/items/Admin.png'
    },
    {
        'title': 'N1 ERP',
        'category': 'Featured',
        'tag': 'ERP Interface',
        'desc': 'Comprehensive enterprise ERP interface already in this repo.',
        'href': '../erp/index.html',
        'img': 'tailwind-bundle/assets/img/items/DattaAble.png'
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

# Build HTML
out = []
out.append(f'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Finished Sites &amp; Templates — Offline Showcase</title>
<link rel="stylesheet" href="css/tailwind.css" />
<style>
  .aspect-card {{
    aspect-ratio: 16 / 10;
  }}
  .template-card {{
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  }}
  .template-card:hover {{
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.06);
  }}
  .filter-pill {{
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    user-select: none;
  }}
  .filter-pill.active {{
    background-color: #1c1915 !important;
    color: #f3efe6 !important;
    border-color: #1c1915 !important;
  }}
  .filter-pill:not(.active):hover {{
    background-color: #e5ded2;
    color: #1c1915;
  }}
  #search-input:focus {{
    outline: none;
    border-color: #1c1915;
    box-shadow: 0 0 0 3px rgba(28, 25, 21, 0.12);
  }}
  .line-clamp-2 {{
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }}
</style>
</head>
<body id="top" class="bg-[#f3efe6] font-sans text-[#1c1915] antialiased min-h-screen">

<header class="border-b border-[#e4ddd0] bg-[#eae5db]/80 backdrop-blur sticky top-0 z-30 px-5 py-3.5 sm:px-8">
  <div class="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <a href="../index.html" class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8a7d6b] hover:text-[#1c1915] transition">
        <span>← Main Site</span>
      </a>
      <span class="text-[#c5beaf]">/</span>
      <span class="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7d6b]">Offline Showcase</span>
    </div>
    <div class="flex items-center gap-3 sm:gap-5 text-xs font-medium text-[#5c5348]">
      <span id="header-count" class="bg-[#e4ddd0] px-2.5 py-1 rounded-full font-mono text-[#4a4237]">{total_items} templates</span>
      <a href="tailwind-bundle/index.html" class="underline underline-offset-4 hover:text-[#1c1915] transition hidden sm:inline">Tailwind Bundle Showcase →</a>
    </div>
  </div>
</header>

<main class="mx-auto max-w-6xl px-5 py-10 sm:px-8">
  <div>
    <p class="text-xs uppercase tracking-[0.22em] text-[#8a7d6b] font-semibold">Local Template Library</p>
    <h1 class="mt-2 font-display text-5xl sm:text-6xl font-bold leading-none tracking-tight">Finished sites, offline.</h1>
    <p class="mt-4 max-w-2xl text-[#5c5348] text-base sm:text-lg leading-relaxed">
      Complete collection of {total_items} self-contained website and application templates. Zero remote CDNs or external fonts — every project runs 100% locally.
    </p>
    <div class="mt-4 flex flex-wrap gap-4 text-sm">
      <a href="tailwind-bundle/index.html" class="underline underline-offset-4 text-[#1c1915] font-medium hover:text-[#8a7d6b] transition">Open Tailwind Bundle Showcase</a>
      <span class="text-[#c5beaf]">•</span>
      <a href="README.md" class="underline underline-offset-4 text-[#5c5348] hover:text-[#1c1915] transition">Read Documentation &amp; Stack Info</a>
    </div>
  </div>

  <!-- Search & Filter Controls -->
  <div class="mt-8 space-y-4">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a7d6b]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input type="text" id="search-input" placeholder="Search templates by name, category, or keyword (e.g. coffee, dashboard, store, clinic)..." class="w-full pl-10 pr-16 py-3.5 bg-white text-[#1c1915] border border-[#e4ddd0] rounded-2xl placeholder-[#9a8d7a] text-sm sm:text-base transition" />
      <button id="clear-search" class="hidden absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-[#8a7d6b] hover:text-[#1c1915]">✕ Clear</button>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-2 pt-1" id="filter-container">
      <button class="filter-pill active px-3.5 py-1.5 rounded-full border border-[#d8d0c2] text-xs font-semibold uppercase tracking-wider bg-transparent text-[#5c5348]" data-filter="all">All <span class="pill-count font-mono text-[11px] font-normal">({total_items})</span></button>''')

for cat_slug, cat_title, cat_desc, items in all_sections:
    out.append(f'      <button class="filter-pill px-3.5 py-1.5 rounded-full border border-[#d8d0c2] text-xs font-semibold uppercase tracking-wider bg-transparent text-[#5c5348]" data-filter="{cat_slug}">{cat_slug} <span class="pill-count font-mono text-[11px] font-normal">({len(items)})</span></button>')

out.append(f'''    </div>
  </div>

  <!-- Results Count Bar -->
  <div id="results-bar" class="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8a7d6b] font-medium border-t border-[#e4ddd0] pt-4">
    <span id="results-count">Showing {total_items} templates</span>
    <span id="results-filter-label" class="hidden">Filtered by: <span class="font-bold text-[#1c1915]" id="active-filter-text">All</span></span>
  </div>

  <!-- Empty Search State -->
  <div id="no-results" class="hidden py-16 text-center">
    <p class="font-display text-2xl font-bold text-[#1c1915]">No matching templates found</p>
    <p class="mt-2 text-sm text-[#8a7d6b]">Try another search term or click below to clear your filters.</p>
    <button id="reset-filters-btn" class="mt-4 px-4 py-2 bg-[#1c1915] text-[#f3efe6] rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#333] transition">Reset Filters</button>
  </div>
''')

# Sections
for cat_slug, cat_title, cat_desc, items in all_sections:
    sec_id = 'sec-' + cat_slug.lower().replace(' ', '-').replace('&', 'and')
    out.append(f'''
  <section class="category-section mt-12" data-category="{cat_slug}" id="{sec_id}">
    <div class="flex flex-wrap items-baseline justify-between mb-5 border-b border-[#e4ddd0] pb-2.5 gap-2">
      <div>
        <h2 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1915]">{html.escape(cat_title)} <span class="text-sm font-sans font-normal text-[#8a7d6b] ml-1.5 font-mono">({len(items)})</span></h2>
        <p class="text-xs text-[#8a7d6b] mt-1">{html.escape(cat_desc)}</p>
      </div>
      <a href="#top" class="text-xs font-semibold uppercase tracking-wider text-[#8a7d6b] hover:text-[#1c1915] transition">Top ↑</a>
    </div>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">''')

    for it in items:
        safe_title = html.escape(it['title'])
        safe_tag = html.escape(it['tag'])
        safe_desc = html.escape(it['desc'])
        safe_href = html.escape(it['href'])
        safe_img = html.escape(it['img'])
        data_cat = html.escape(it['category'])

        out.append(f'''      <a href="{safe_href}" class="template-card group block overflow-hidden rounded-3xl bg-white text-[#161616] ring-1 ring-[#e4ddd0]" data-category="{data_cat}" data-title="{safe_title.lower()}" data-desc="{safe_desc.lower()}" data-tag="{safe_tag.lower()}">
        <div class="aspect-card w-full overflow-hidden bg-[#e4ddd0]">
          <img src="{safe_img}" alt="{safe_title}" loading="lazy" class="h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100" />
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-[0.18em] font-semibold text-[#8a7d6b]">{safe_tag}</span>
            <span class="text-xs font-semibold text-[#8a7d6b] group-hover:text-[#1c1915] group-hover:translate-x-0.5 transition duration-200">Open →</span>
          </div>
          <h3 class="mt-1 font-display text-2xl font-bold text-[#1c1915]">{safe_title}</h3>
          <p class="mt-1.5 text-sm text-[#5c5348] line-clamp-2 leading-relaxed">{safe_desc}</p>
        </div>
      </a>''')

    out.append('''    </div>
  </section>''')

out.append(f'''
</main>

<footer class="mt-20 border-t border-[#e4ddd0] bg-[#eae5db]/40 py-8 px-5 sm:px-8 text-center text-xs text-[#8a7d6b]">
  <div class="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
    <p>All {total_items} projects self-contained and run completely offline. MIT Licensed templates.</p>
    <div class="flex items-center gap-4">
      <a href="#top" class="uppercase tracking-wider font-semibold hover:text-[#1c1915] transition">Back to top ↑</a>
      <span>•</span>
      <a href="../index.html" class="hover:text-[#1c1915] transition">Main Site</a>
    </div>
  </div>
</footer>

<script>
  (function() {{
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const filterPills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.template-card');
    const sections = document.querySelectorAll('.category-section');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const resultsFilterLabel = document.getElementById('results-filter-label');
    const activeFilterText = document.getElementById('active-filter-text');
    const resetBtn = document.getElementById('reset-filters-btn');
    const headerCount = document.getElementById('header-count');
    const totalItems = {total_items};

    let currentFilter = 'all';

    function filterTemplates() {{
      const query = (searchInput.value || '').trim().toLowerCase();
      let visibleCount = 0;

      if (query.length > 0) {{
        clearBtn.classList.remove('hidden');
      }} else {{
        clearBtn.classList.add('hidden');
      }}

      cards.forEach(card => {{
        const cat = card.getAttribute('data-category');
        const title = card.getAttribute('data-title') || '';
        const desc = card.getAttribute('data-desc') || '';
        const tag = card.getAttribute('data-tag') || '';

        const matchesCat = (currentFilter === 'all' || cat === currentFilter);
        const matchesQuery = !query || title.includes(query) || desc.includes(query) || tag.includes(query) || cat.toLowerCase().includes(query);

        if (matchesCat && matchesQuery) {{
          card.style.display = '';
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
      headerCount.textContent = visibleCount + ' templates';

      if (currentFilter !== 'all' || query) {{
        resultsFilterLabel.classList.remove('hidden');
        if (currentFilter !== 'all') {{
          activeFilterText.textContent = query ? currentFilter + ' matching "' + query + '"' : currentFilter;
        }} else {{
          activeFilterText.textContent = 'matching "' + query + '"';
        }}
      }} else {{
        resultsFilterLabel.classList.add('hidden');
      }}

      if (visibleCount === 0) {{
        noResults.classList.remove('hidden');
      }} else {{
        noResults.classList.add('hidden');
      }}
    }}

    searchInput.addEventListener('input', filterTemplates);

    clearBtn.addEventListener('click', () => {{
      searchInput.value = '';
      searchInput.focus();
      filterTemplates();
    }});

    filterPills.forEach(pill => {{
      pill.addEventListener('click', () => {{
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.getAttribute('data-filter');
        filterTemplates();

        if (currentFilter !== 'all' && !searchInput.value.trim()) {{
          const targetSec = document.querySelector('.category-section[data-category=\"' + currentFilter + '\"]');
          if (targetSec) {{
            targetSec.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
          }}
        }}
      }});
    }});

    resetBtn.addEventListener('click', () => {{
      searchInput.value = '';
      currentFilter = 'all';
      filterPills.forEach(p => {{
        if (p.getAttribute('data-filter') === 'all') {{
          p.classList.add('active');
        }} else {{
          p.classList.remove('active');
        }}
      }});
      filterTemplates();
    }});
  }})();
</script>
</body>
</html>
''')

output_path = os.path.join(demo_dir, 'index.html')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print(f'Successfully generated {output_path} ({total_items} items, {os.path.getsize(output_path)} bytes)')

