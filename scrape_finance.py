import csv
import time
from playwright.sync_api import sync_playwright

def scrape_google_finance_hover(ticker, exchange="NASDAQ"):
    """
    Scrapes Google Finance by simulating mouse hovers over the SVG chart.
    WARNING: Google Finance uses heavily obfuscated and dynamic DOM elements. 
    It does not render historical data in an HTML table. This hover approach 
    is brittle and may break if Google updates their UI.
    """
    url = f"https://www.google.com/finance/quote/{ticker}:{exchange}"
    print(f"Navigating to {url}")
    
    with sync_playwright() as p:
        # Run in headed mode so you can see the hover simulation
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        
        try:
            # Click the "6M" button
            six_month_button = page.locator('div[role="button"]:has-text("6M")').first
            six_month_button.wait_for(state="visible", timeout=5000)
            six_month_button.click()
            print("Clicked 6M button. Waiting for chart to update...")
            time.sleep(2)
            
            # Find the chart container
            chart_container = page.locator('div[jsname="F3o1ce"], svg').last
            box = chart_container.bounding_box()
            
            if not box:
                print("Could not find the chart bounding box.")
                browser.close()
                return

            print("Extracting data by hovering across the chart...")
            extracted_data = []
            visited_dates = set()
            
            # Move the mouse across the chart from left to right
            steps = 150
            for i in range(steps + 1):
                x = box['x'] + (box['width'] * (i / steps))
                y = box['y'] + (box['height'] / 2)
                
                # Hover over the coordinate
                page.mouse.move(x, y)
                page.wait_for_timeout(50) # Wait for UI to update
                
                # While hovering, Google Finance updates the main price header and date
                # Because class names change, we look for the large text elements
                try:
                    # These jsnames are common for the price header on Google Finance,
                    # but may require updating if Google changes them.
                    price = page.locator('div[jsname="ip75Cb"] >> visible=true').first.inner_text().strip()
                    date = page.locator('div[jsname="yQtnrc"] >> visible=true').first.inner_text().strip()
                    
                    if date and price and date not in visited_dates:
                        visited_dates.add(date)
                        extracted_data.append({'Date': date, 'Price': price})
                except Exception:
                    pass
            
            # Save to CSV
            filename = f"{ticker}_google_finance_6M.csv"
            with open(filename, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=['Date', 'Price'])
                writer.writeheader()
                writer.writerows(extracted_data)
                
            print(f"Successfully saved {len(extracted_data)} data points to {filename}")

        except Exception as e:
            print(f"Google Finance scraping failed: {e}")
            print("Note: Google Finance UI limits direct scraping. Try the Yahoo Finance method instead.")
        finally:
            browser.close()


def scrape_yahoo_finance(ticker):
    """
    Scrapes Yahoo Finance historical data.
    This is the highly recommended approach because Yahoo Finance actually 
    renders an HTML table of historical prices, making it 100x more robust.
    """
    print(f"\n--- Fallback: Scraping Yahoo Finance for {ticker} ---")
    url = f"https://finance.yahoo.com/quote/{ticker}/history"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        
        # Depending on your region, you may need to accept cookies here
        try:
            accept_btn = page.locator('button:has-text("Accept all")')
            if accept_btn.count() > 0:
                accept_btn.click()
        except:
            pass

        # Parse the historical data table
        rows = page.locator('table[data-test="historical-prices"] tbody tr')
        rows.first.wait_for(state="visible", timeout=10000)
        
        extracted_data = []
        for i in range(rows.count()):
            cols = rows.nth(i).locator('td')
            if cols.count() >= 5: # Valid price row (Date, Open, High, Low, Close, Adj Close, Volume)
                date = cols.nth(0).inner_text()
                close_price = cols.nth(4).inner_text() # Close price is usually the 5th column
                extracted_data.append({'Date': date, 'Price': close_price})
                
        # Save to CSV
        filename = f"{ticker}_yahoo_finance_historical.csv"
        with open(filename, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['Date', 'Price'])
            writer.writeheader()
            writer.writerows(extracted_data)
            
        print(f"Successfully saved {len(extracted_data)} data points to {filename}")
        browser.close()

if __name__ == "__main__":
    # Choose your stock ticker
    symbol = "AAPL"
    
    # Attempt the Google Finance hover method
    scrape_google_finance_hover(symbol)
    
    # Robust fallback: Yahoo Finance method
    scrape_yahoo_finance(symbol)
