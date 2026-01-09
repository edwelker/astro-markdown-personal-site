interface SportsNewsItem {
  title: string;
  url: string;
  date: Date;
  description?: string;
  source: string;
  league: 'MLB' | 'NBA';
}

export const MY_TEAMS = [
  { league: 'MLB', name: 'Red Sox', url: 'https://www.mlbtraderumors.com/boston-red-sox/feed/atom' },
  { league: 'NBA', name: 'Knicks', url: 'https://www.hoopsrumors.com/newyorkknicks.xml' },
  { league: 'NBA', name: 'Celtics', url: 'https://www.hoopsrumors.com/bostonceltics.xml' },
  { league: 'MLB', name: 'Orioles', url: 'https://www.mlbtraderumors.com/baltimore-orioles/feed/atom' },
  { league: 'NBA', name: 'Pistons', url: 'https://www.hoopsrumors.com/detroitpistons.xml' },
  { league: 'NBA', name: 'Wizards', url: 'https://www.hoopsrumors.com/washingtonwizards.xml' },
  { league: 'MLB', name: 'White Sox', url: 'https://www.mlbtraderumors.com/chicago-white-sox/feed/atom' },
] as const;

const LEAGUES = [
    { league: 'MLB', name: 'MLB Trade Rumors', url: 'https://www.mlbtraderumors.com/feed' },
    { league: 'MLB', name: 'FanGraphs', url: 'https://blogs.fangraphs.com/feed/' },
    { league: 'MLB', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/mlb/' },
    { league: 'NBA', name: 'Hoops Rumors', url: 'https://www.hoopsrumors.com/feed' },
    { league: 'NBA', name: 'RealGM', url: 'https://basketball.realgm.com/rss/wiretap/0/0.xml' },
    { league: 'NBA', name: 'CBS Sports', url: 'https://www.cbssports.com/rss/headlines/nba/' }
] as const;

async function fetchAndParse(url: string, source: string, league: 'MLB' | 'NBA'): Promise<SportsNewsItem[]> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    const text = await response.text();
    
    const items: SportsNewsItem[] = [];
    
    // Simple regex based parsing to avoid dependencies
    // Check if Atom or RSS
    const isAtom = text.includes('<feed') || text.includes('xmlns="http://www.w3.org/2005/Atom"');
    
    if (isAtom) {
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(text)) !== null) {
        const content = match[1];
        const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        // Match href with single or double quotes
        const linkMatch = content.match(/<link[^>]*href=["']([^"']*)["']/);
        // Atom dates: published or updated
        const dateMatch = content.match(/<published>([\s\S]*?)<\/published>/) || content.match(/<updated>([\s\S]*?)<\/updated>/);
        const summaryMatch = content.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
        
        if (titleMatch && linkMatch && dateMatch) {
            items.push({
                title: decodeHTMLEntities(titleMatch[1].trim()),
                url: decodeHTMLEntities(linkMatch[1].trim()),
                date: new Date(dateMatch[1]),
                description: summaryMatch ? decodeHTMLEntities(summaryMatch[1].trim()) : undefined,
                source,
                league
            });
        }
      }
    } else {
      // RSS
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(text)) !== null) {
        const content = match[1];
        const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
        const dateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const descMatch = content.match(/<description>([\s\S]*?)<\/description>/);
        
        if (titleMatch && linkMatch && dateMatch) {
            items.push({
                title: decodeHTMLEntities(titleMatch[1].trim()),
                url: decodeHTMLEntities(linkMatch[1].trim()),
                date: new Date(dateMatch[1]),
                description: descMatch ? decodeHTMLEntities(descMatch[1].trim()) : undefined,
                source,
                league
            });
        }
      }
    }
    return items;
  } catch (e) {
    console.error(`Error fetching ${url}`, e);
    return [];
  }
}

function decodeHTMLEntities(text: string) {
    return text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&apos;/g, "'")
               .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
}

export async function getMyTeamsNews() {
    const promises = MY_TEAMS.map(t => fetchAndParse(t.url, t.name, t.league));
    const results = await Promise.all(promises);
    return results.flat().sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getAllLeagueNews() {
    const promises = LEAGUES.map(l => fetchAndParse(l.url, l.name, l.league));
    const results = await Promise.all(promises);
    return results.flat().sort((a, b) => b.date.getTime() - a.date.getTime());
}
