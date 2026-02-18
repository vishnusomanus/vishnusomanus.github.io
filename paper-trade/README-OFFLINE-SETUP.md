# Setting Up Tailwind CSS Offline

This guide will help you set up Tailwind CSS to work offline in this project.

## Quick Setup

Run the setup script:

```bash
cd paper-trade
chmod +x setup-tailwind-offline.sh
./setup-tailwind-offline.sh
```

This script will:
1. Download the Tailwind CSS Standalone CLI
2. Generate a `tailwind.css` file with all the styles used in your HTML files
3. Update all HTML files to use the local CSS file instead of the CDN

## Manual Setup (Alternative)

If the script doesn't work, you can set it up manually:

1. **Download Tailwind CSS Standalone CLI:**
   ```bash
   # For macOS ARM64 (Apple Silicon)
   curl -L -o tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
   
   # For macOS Intel
   curl -L -o tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64
   
   # For Linux
   curl -L -o tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
   
   chmod +x tailwindcss
   ```

2. **Create input.css:**
   ```bash
   cat > input.css << 'EOF'
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   EOF
   ```

3. **Generate CSS:**
   ```bash
   ./tailwindcss -i input.css -o tailwind.css --minify
   ```

4. **Update HTML files:**
   Replace `<script src="https://cdn.tailwindcss.com"></script>` with:
   ```html
   <link rel="stylesheet" href="tailwind.css">
   ```
   
   And remove the `<script>` block containing `tailwind.config`.

## Regenerating CSS

If you add new Tailwind classes to your HTML files, regenerate the CSS:

```bash
./tailwindcss -i input.css -o tailwind.css --minify
```

## Files Created

- `tailwind.css` - The generated CSS file (keep this)
- `tailwindcss` - The Tailwind CLI binary (can be deleted after setup)
- `input.css` - Input file for Tailwind (can be deleted after setup)
- `tailwind.config.js` - Tailwind configuration (keep this)

## Notes

- The `tailwind.css` file will only include the Tailwind classes actually used in your HTML files
- If you add new Tailwind classes, regenerate the CSS file
- The generated CSS is minified for smaller file size
