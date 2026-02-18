#!/usr/bin/env python3
"""
Script to update HTML files to use local Tailwind CSS instead of CDN
"""
import os
import re
import glob

def update_html_file(filepath):
    """Update a single HTML file to use local CSS"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace CDN script tag with local CSS link
    content = re.sub(
        r'<script src="https://cdn\.tailwindcss\.com"></script>',
        '<link rel="stylesheet" href="tailwind.css">',
        content
    )
    
    # Remove tailwind.config script block
    # Match the script block that contains tailwind.config
    content = re.sub(
        r'<script>\s*tailwind\.config\s*=\s*\{[^}]*\{[^}]*\}[^}]*\}\s*</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Also try a simpler pattern
    content = re.sub(
        r'<script>\s*tailwind\.config\s*=[\s\S]*?</script>',
        '',
        content
    )
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Update all HTML files in the current directory"""
    html_files = glob.glob('*.html')
    updated_count = 0
    
    for html_file in html_files:
        if update_html_file(html_file):
            print(f"✓ Updated {html_file}")
            updated_count += 1
        else:
            print(f"  Skipped {html_file} (no changes needed)")
    
    print(f"\n✓ Updated {updated_count} file(s)")

if __name__ == '__main__':
    main()
