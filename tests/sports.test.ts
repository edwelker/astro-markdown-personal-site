import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMyTeamsNews, getAllLeagueNews } from '../src/lib/sports/rss_news_logic';

describe('Sports News Logic', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockRssFeed = `
    <rss version="2.0">
      <channel>
        <item>
          <title>Test News Item</title>
          <link>https://example.com/news/1</link>
          <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
          <description>This is a test description.</description>
        </item>
      </channel>
    </rss>
  `;

  const mockAtomFeed = `
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <title>Atom News Item</title>
        <link href="https://example.com/news/2"/>
        <updated>2024-01-02T12:00:00Z</updated>
        <summary>This is an atom summary.</summary>
      </entry>
    </feed>
  `;

  it('fetches and parses RSS feeds for my teams', async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssFeed,
    });

    const news = await getMyTeamsNews();
    
    expect(news.length).toBeGreaterThan(0);
    expect(news[0]).toMatchObject({
      title: 'Test News Item',
      url: 'https://example.com/news/1',
      description: 'This is a test description.'
    });
    expect(news[0].date).toBeInstanceOf(Date);
  });

  it('fetches and parses Atom feeds for leagues', async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () => mockAtomFeed,
    });

    const news = await getAllLeagueNews();

    expect(news.length).toBeGreaterThan(0);
    expect(news[0]).toMatchObject({
      title: 'Atom News Item',
      url: 'https://example.com/news/2',
      description: 'This is an atom summary.'
    });
  });

  it('handles fetch failures gracefully', async () => {
    fetch.mockResolvedValue({
      ok: false,
    });

    const news = await getMyTeamsNews();
    expect(news).toEqual([]);
  });

  it('decodes HTML entities in titles and URLs', async () => {
    const encodedFeed = `
      <rss>
        <channel>
          <item>
            <title>News &amp; Updates: &quot;Quotes&quot;</title>
            <link>http://example.com?a=1&amp;b=2</link>
            <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    fetch.mockResolvedValue({
      ok: true,
      text: async () => encodedFeed,
    });

    const news = await getMyTeamsNews();
    expect(news[0].title).toBe('News & Updates: "Quotes"');
    expect(news[0].url).toBe('http://example.com?a=1&b=2');
  });
  
  it('handles CDATA sections in RSS', async () => {
      const cdataFeed = `
        <rss>
          <channel>
            <item>
              <title><![CDATA[News with CDATA]]></title>
              <link><![CDATA[http://example.com/cdata]]></link>
              <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>
      `;
      
      fetch.mockResolvedValue({
        ok: true,
        text: async () => cdataFeed,
      });
  
      const news = await getMyTeamsNews();
      expect(news[0].title).toBe('News with CDATA');
      expect(news[0].url).toBe('http://example.com/cdata');
  });

  it('handles single quotes in Atom links', async () => {
    const atomSingleQuote = `
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Single Quote Link</title>
          <link href='https://example.com/single'/>
          <updated>2024-01-02T12:00:00Z</updated>
        </entry>
      </feed>
    `;
    
    fetch.mockResolvedValue({
      ok: true,
      text: async () => atomSingleQuote,
    });

    const news = await getAllLeagueNews();
    expect(news[0].url).toBe('https://example.com/single');
  });

  it('ensures items use "url" property instead of "link"', async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: async () => mockRssFeed,
    });

    const news = await getMyTeamsNews();
    const item = news[0];
    
    expect(item).toHaveProperty('url');
    expect(item.url).toBe('https://example.com/news/1');
    // @ts-ignore
    expect(item.link).toBeUndefined();
  });
});
