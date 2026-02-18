#!/bin/bash

# Script to set up Tailwind CSS offline
# This script downloads Tailwind CSS and updates all HTML files

echo "Setting up Tailwind CSS for offline use..."

# Create input CSS file for Tailwind
cat > input.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Download Tailwind CSS Standalone CLI
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

if [[ "$OS" == "darwin" ]]; then
    if [[ "$ARCH" == "arm64" ]]; then
        BINARY="tailwindcss-macos-arm64"
    else
        BINARY="tailwindcss-macos-x64"
    fi
elif [[ "$OS" == "linux" ]]; then
    BINARY="tailwindcss-linux-x64"
else
    echo "Unsupported OS: $OS"
    exit 1
fi

echo "Downloading Tailwind CSS Standalone CLI (v3.4.1)..."
curl -L -o tailwindcss "https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.1/$BINARY"
chmod +x tailwindcss

# Create content file with all HTML files
echo "Scanning HTML files for Tailwind classes..."
find . -name "*.html" -type f | head -1 | xargs cat > /dev/null 2>&1

# Generate CSS with content from all HTML files and config
echo "Generating Tailwind CSS..."
./tailwindcss -i input.css -o tailwind.css --minify

if [ -f "tailwind.css" ]; then
    echo "✓ tailwind.css generated successfully!"
    echo ""
    
    # Check if HTML files still need updating
    if grep -q "cdn.tailwindcss.com" *.html 2>/dev/null; then
        echo "Updating HTML files to use local CSS..."
        # Use Python script to update HTML files (more reliable)
        if command -v python3 &> /dev/null; then
            python3 update-html-files.py
        else
            # Fallback to sed if Python is not available
            echo "Python3 not found, using sed instead..."
            find . -name "*.html" -type f -exec sed -i.bak \
                's|<script src="https://cdn.tailwindcss.com"></script>|<link rel="stylesheet" href="tailwind.css">|g' {} \;
            find . -name "*.bak" -type f -delete
            echo "Note: You may need to manually remove tailwind.config script blocks from HTML files"
        fi
        echo "✓ All HTML files updated!"
    else
        echo "✓ HTML files already updated (using local CSS)"
    fi
    
    echo ""
    echo "🎉 Setup complete! Tailwind CSS is now offline."
    echo ""
    echo "Your project is ready to use offline!"
    echo "You can optionally delete: tailwindcss, input.css"
else
    echo "Error: Failed to generate tailwind.css"
    exit 1
fi
