import asyncio
import csv
import re
import os
from playwright.async_api import async_playwright

def parse_number(text):
    if not text:
        return 0
    # Match the first sequence of numbers, commas, or 'k'/'m' suffixes
    match = re.search(r'[\d,.]+[kKmM]?', text)
    if not match:
        return 0
        
    parsed_text = match.group(0).replace(',', '').lower()
    
    multiplier = 1
    if parsed_text.endswith('k'):
        multiplier = 1000
        parsed_text = parsed_text[:-1]
    elif parsed_text.endswith('m'):
        multiplier = 1000000
        parsed_text = parsed_text[:-1]
        
    try:
        return round(float(parsed_text) * multiplier)
    except ValueError:
        return 0

async def scrape_github_users():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False) # Set headless=True for background execution
        context = await browser.new_context()
        page = await context.new_page()

        search_query = 'location:"Uttar Pradesh"'
        search_url = f'https://github.com/search?q={search_query}&type=users'
        
        print(f"Navigating to {search_url}...")
        await page.goto(search_url, wait_until='load')
        await page.wait_for_timeout(3000)

        # Extract usernames from the first page of search results
        usernames = await page.evaluate('''
            () => {
                const userElements = document.querySelectorAll('.search-title a, a.pr-md-3');
                const names = new Set();
                userElements.forEach(el => {
                    const href = el.getAttribute('href');
                    if (href && href.startsWith('/') && href.split('/').length === 2) {
                        names.add(href.replace('/', ''));
                    }
                });
                return Array.from(names).slice(0, 10); // Limiting to 10 for demonstration
            }
        ''')
        
        if not usernames:
            print("No users found or GitHub blocked the request. Try logging in or wait.")
            await browser.close()
            return

        print(f"Found {len(usernames)} users on the first page: {', '.join(usernames)}")
        results = []

        for username in usernames:
            print(f"\nScraping data for user: {username}")
            user_data = {
                'username': username,
                'repositories': 0,
                'commits': 0,
                'stars': 0,
                'followers': 0,
                'primary_language': 'Unknown'
            }

            try:
                # 1. Profile Overview
                await page.goto(f'https://github.com/{username}', wait_until='load')
                await page.wait_for_timeout(2000)

                followers_text = await page.evaluate('''
                    () => {
                        const span = document.querySelector('a[href$="?tab=followers"] span');
                        return span ? span.innerText : '0';
                    }
                ''')
                user_data['followers'] = parse_number(followers_text)

                commits_text = await page.evaluate('''
                    () => {
                        const h2 = document.querySelector('h2.f4.text-normal.mb-2');
                        return h2 ? h2.innerText : '0';
                    }
                ''')
                user_data['commits'] = parse_number(commits_text)

                # 2. Repositories tab
                await page.goto(f'https://github.com/{username}?tab=repositories', wait_until='load')
                await page.wait_for_timeout(2000)

                repos_text = await page.evaluate('''
                    () => {
                        const a = document.querySelector('a[data-tab-item="repositories"] span.Counter');
                        return a ? a.innerText : '0';
                    }
                ''')
                user_data['repositories'] = parse_number(repos_text)

                repo_stats = await page.evaluate('''
                    () => {
                        const repos = document.querySelectorAll('#user-repositories-list li');
                        let totalStars = 0;
                        const languages = {};
                        
                        repos.forEach(repo => {
                            const starIcon = repo.querySelector('svg.octicon-star');
                            if (starIcon && starIcon.nextElementSibling) {
                                const stars = parseInt(starIcon.nextElementSibling.innerText.replace(/,/g, '').trim()) || 0;
                                totalStars += stars;
                            }
                            
                            const langElement = repo.querySelector('[itemprop="programmingLanguage"]');
                            if (langElement) {
                                const lang = langElement.innerText.trim();
                                languages[lang] = (languages[lang] || 0) + 1;
                            }
                        });
                        
                        return { totalStars, languages };
                    }
                ''')
                
                user_data['stars'] = repo_stats['totalStars']
                languages = repo_stats['languages']
                if languages:
                    # Find the language with the highest count
                    user_data['primary_language'] = max(languages.items(), key=lambda x: x[1])[0]

                print(f"Data collected for {username}:", user_data)
                results.append(user_data)

            except Exception as e:
                print(f"Error scraping user {username}: {e}")

        # Write results to CSV
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'github_up_data.csv')
        headers = ['username', 'repositories', 'commits', 'stars', 'followers', 'primary_language']
        
        with open(file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(results)
            
        print(f"\nSuccessfully saved data to {file_path}")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(scrape_github_users())
