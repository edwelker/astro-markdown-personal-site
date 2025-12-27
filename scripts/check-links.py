import os
import re
import requests
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Configuration
CONTENT_DIR = Path("src/content/blog")
REPORT_FILE = Path("broken_links_report.json")
MAX_THREADS = 10  # Adjust based on your connection/patience
TIMEOUT = 5       # Seconds to wait for a response

# Regex for Markdown links: [text](url)
LINK_RE = re.compile(r'\[([^\]]+)\]\((https?://[^\)]+)\)')

def get_wayback_url(url):
    """Queries the Wayback Machine API for the closest available snapshot."""
    try:
        api_url = f"https://archive.org/wayback/available?url={url}"
        response = requests.get(api_url, timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            snapshots = data.get("archived_snapshots", {})
            if snapshots and "closest" in snapshots:
                return snapshots["closest"]["url"]
    except Exception:
        pass
    return None

def check_link(link_data):
    """Checks a single URL and looks for a Wayback replacement if broken."""
    text, url, filepath = link_data
    
    # Skip internal links or specific domains if needed
    if url.startswith("/") or "localhost" in url:
        return None

    result = {
        "text": text,
        "original_url": url,
        "file": str(filepath),
        "status": "unknown",
        "wayback_url": None
    }

    try:
        # Use a HEAD request first for efficiency
        response = requests.head(url, allow_redirects=True, timeout=TIMEOUT)
        # If HEAD fails or returns 405/404, try a GET
        if response.status_code >= 400:
            response = requests.get(url, allow_redirects=True, timeout=TIMEOUT)
        
        if 200 <= response.status_code < 400:
            return None # Link is fine
        
        result["status"] = response.status_code
    except requests.exceptions.RequestException as e:
        result["status"] = "Error/Timeout"

    # If we reach here, the link is likely broken. Check Wayback.
    print(f"Broken: {url} in {filepath.name}. Checking Wayback...")
    result["wayback_url"] = get_wayback_url(url)
    
    return result

def main():
    all_links = []
    
    print(f"Scanning {CONTENT_DIR} for links...")
    for md_file in CONTENT_DIR.glob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        matches = LINK_RE.findall(content)
        for text, url in matches:
            all_links.append((text, url, md_file))

    print(f"Found {len(all_links)} total links. Verifying status (this may take a while)...")
    
    broken_links = []
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        results = list(executor.map(check_link, all_links))
        broken_links = [r for r in results if r is not None]

    # Save report
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(broken_links, f, indent=2)

    print("\n--- Summary ---")
    print(f"Total links checked: {len(all_links)}")
    print(f"Broken links found: {len(broken_links)}")
    print(f"Report saved to: {REPORT_FILE}")
    
    if broken_links:
        print("\nSample of broken links:")
        for link in broken_links[:5]:
            wb = " [Wayback found]" if link["wayback_url"] else " [No Wayback]"
            print(f"- {link['original_url']}{wb}")

if __name__ == "__main__":
    main()
