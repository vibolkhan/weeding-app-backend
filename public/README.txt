
Offline Conversion Guide
========================

This folder contains:
- index.local.html  — your HTML updated to use local assets under ./assets/
- download_assets.sh — a helper script to fetch all remote JS/CSS/images into ./assets/
- assets/            — target folder for the local files (will be populated by the script)

How to use
----------
1) Open a terminal and run:
   cd "/mnt/data/localized"
   ./download_assets.sh

   (On Windows PowerShell, run: bash download_assets.sh)

2) Open index.local.html in your browser.

Notes
-----
- All external <a href="..."> links were replaced with href="#" and their originals kept in data-original-url="...".
- Google Fonts were rewritten to a local CSS file (assets/css/google-fonts.css). The script downloads the CSS used by the original page. If you want fully offline fonts, you may also need to open that CSS and download the referenced font files to local paths, then update the URLs inside.
- The Tailwind CDN runtime (cdn.tailwindcss.com) was rewritten to a local JS file (assets/js/tailwindcdn.js). This mirrors the original behavior. For production, consider compiling a static tailwind.css instead.
- The OpenGraph preview image (Microlink) was replaced with assets/img/preview.png.
- If any download fails because of network restrictions, you can manually download the missing file and place it at the path shown.

Asset mapping (URL -> Local path)
---------------------------------
- https://fonts.googleapis.com/ -> assets/css/index.css
- https://fonts.googleapis.com/css2?family=Dangrek&amp;family=Kantumruy+Pro&amp;family=Battambang&amp;family=Fasthand&amp;family=Moulpali&amp;family=Wix+Madefor+Display:wght@400;500;600;700&amp;display=swap -> assets/css/google-fonts.css
- https://cdn.tailwindcss.com -> assets/js/index.js
- https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js -> assets/js/dayjs.min.js
- https://cdn.jsdelivr.net/npm/dayjs@1/locale/km.js -> assets/js/km.js
- https://cdn.jsdelivr.net/npm/date-fns@3.6.0/cdn.min.js -> assets/js/cdn.min.js
- https://cdn.jsdelivr.net/npm/date-fns@3.6.0/locale/km/cdn.min.js -> assets/js/cdn.min.js
- https://cdn.jsdelivr.net/npm/alpinejs@3.12.1/dist/cdn.min.js -> assets/js/cdn.min.js
- https://cdn.jsdelivr.net/npm/add-to-calendar-button@2 -> assets/js/add-to-calendar-button.js
- https://theapka.com/storage/templates/chhay/style.css?v2.5 -> assets/css/style.css
- https://theapka.com/storage/templates/chhay/images/2hearts.gif -> assets/img/2hearts.gif
- https://theapka.com/storage/templates/chhay/images/frame_1.png -> assets/img/frame_1.png
- https://theapka.com/storage/templates/chhay/images/header_3.png -> assets/img/header_3.png
- https://theapka.com/storage/templates/chhay/images/header_4.png -> assets/img/header_4.png
- https://theapka.com/storage/templates/chhay/images/thank.gif -> assets/img/thank.gif
- https://theapka.com/storage/templates/chhay/images/flower_2.gif -> assets/img/flower_2.gif
- https://theapka.com/storage/templates/chhay/images/flower_2.gif -> assets/img/flower_2.gif
- https://theapka.com/storage/templates/chhay/images/flower_2.gif -> assets/img/flower_2.gif
- https://theapka.com/storage/templates/chhay/images/flower_2.gif -> assets/img/flower_2.gif
- https://theapka.com/storage/templates/chhay/images/flower_2.gif -> assets/img/flower_2.gif