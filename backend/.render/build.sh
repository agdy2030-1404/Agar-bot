#!/bin/bash
echo "Starting build process..."

# تثبيت dependencies
npm install

# تثبيت Chrome لـ Puppeteer
echo "Installing Chrome for Puppeteer..."
export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
npx puppeteer browsers install chrome

# التحقق من تثبيت Chrome
if [ -f "/opt/render/.cache/puppeteer/chrome/linux-139.0.7258.138/chrome-linux64/chrome" ]; then
    echo "Chrome installed successfully"
else
    echo "Chrome installation may have failed, trying alternative approach..."
    # محاولة بديلة
    apt-get update
    apt-get install -y chromium-browser
fi

echo "Build completed successfully"