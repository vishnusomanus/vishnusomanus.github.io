#!/bin/bash

# Download Tailwind CSS from CDN and save locally
echo "Downloading Tailwind CSS..."

# Create a temporary HTML file to extract CSS
cat > temp-tailwind.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
</body>
</html>
EOF

# Use a headless browser approach or download the CSS directly
# For simplicity, we'll download the standalone CLI and generate CSS

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
    echo "Unsupported OS"
    exit 1
fi

echo "Downloading Tailwind CSS Standalone CLI (v3.4.1)..."
curl -L -o tailwindcss "https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.1/$BINARY"
chmod +x tailwindcss

# Create input CSS file
cat > input.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Generate CSS
echo "Generating CSS..."
./tailwindcss -i input.css -o tailwind.css --minify

echo "Done! tailwind.css has been created."
echo "You can now delete tailwindcss, input.css, and temp-tailwind.html"
