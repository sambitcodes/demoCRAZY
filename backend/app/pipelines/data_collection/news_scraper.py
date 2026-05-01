import feedparser
import httpx
import asyncio
from typing import List, Dict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import os
from datetime import datetime

# RSS Feeds for Indian Politics
FEEDS = [
    {"name": "The Hindu - National", "url": "https://www.thehindu.com/news/national/feeder/default.rss"},
    {"name": "NDTV - India", "url": "https://feeds.feedburner.com/ndtvnews-india-news"},
    {"name": "Times of India - Politics", "url": "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms"},
    {"name": "Indian Express - National", "url": "https://indianexpress.com/section/india/feed/"}
]

STATE_KEYWORDS = {
    "West_Bengal": ["west bengal", "bengal", "kolkata", "mamata", "tmc"],
    "Assam": ["assam", "guwahati", "himanta", "dispur"],
    "Tamil_Nadu": ["tamil nadu", "chennai", "dmk", "aiadmk", "stalin"],
    "Kerala": ["kerala", "kochi", "thiruvananthapuram", "pinarayi", "cpim"]
}

class NewsSentimentScraper:
    def __init__(self, output_file: str = "backend/data/raw/news_sentiment.csv"):
        self.output_file = output_file
        self.analyzer = SentimentIntensityAnalyzer()
        os.makedirs(os.path.dirname(self.output_file), exist_ok=True)

    async def fetch_feed(self, feed_info: Dict):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(feed_info["url"])
                feed = feedparser.parse(response.text)
                return feed.entries
            except Exception as e:
                print(f"Error fetching {feed_info['name']}: {e}")
                return []

    def get_sentiment(self, text: str) -> float:
        return self.analyzer.polarity_scores(text)["compound"]

    def detect_state(self, text: str) -> str:
        text_lower = text.lower()
        for state, keywords in STATE_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                return state
        return "National"

    async def run(self):
        all_articles = []
        tasks = [self.fetch_feed(f) for f in FEEDS]
        results = await asyncio.gather(*tasks)

        for i, entries in enumerate(results):
            source = FEEDS[i]["name"]
            for entry in entries:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                full_text = f"{title} {summary}"
                
                sentiment = self.get_sentiment(full_text)
                state = self.detect_state(full_text)
                
                all_articles.append({
                    "title": title,
                    "source": source,
                    "published": entry.get("published", ""),
                    "state": state,
                    "sentiment": sentiment,
                    "url": entry.get("link", ""),
                    "timestamp": datetime.now().isoformat()
                })
        
        df = pd.DataFrame(all_articles)
        if os.path.exists(self.output_file):
            existing_df = pd.read_csv(self.output_file)
            df = pd.concat([existing_df, df]).drop_duplicates(subset=["url"])
        
        df.to_csv(self.output_file, index=False)
        print(f"Saved {len(df)} articles to {self.output_file}")

if __name__ == "__main__":
    scraper = NewsSentimentScraper()
    asyncio.run(scraper.run())
