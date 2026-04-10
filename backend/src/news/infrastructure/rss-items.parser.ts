import type { RawNewsArticle } from '../application/news-feed.provider.port';

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function firstTag(block: string, tag: string): string {
  const cdata = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    'i',
  ).exec(block);
  if (cdata?.[1]) {
    return stripTags(cdata[1]).trim();
  }
  const plain = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
    'i',
  ).exec(block);
  return plain?.[1] ? stripTags(plain[1]).trim() : '';
}

function parseRssDate(s: string): Date {
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Best-effort RSS 2.0 `<item>` extraction (no full XML dependency).
 */
export function parseRssItems(xml: string, sourceLabel: string): RawNewsArticle[] {
  const out: RawNewsArticle[] = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const block = m[1];
    const title = firstTag(block, 'title');
    let link = firstTag(block, 'link');
    if (!link) {
      link = firstTag(block, 'guid');
    }
    const description = firstTag(block, 'description') || firstTag(block, 'summary');
    const pubDate =
      firstTag(block, 'pubDate') ||
      firstTag(block, 'published') ||
      firstTag(block, 'updated');
    if (!title || !link) {
      continue;
    }
    let validLink = false;
    try {
      const u = new URL(link);
      validLink = u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      validLink = false;
    }
    if (!validLink) {
      continue;
    }
    out.push({
      title,
      source: sourceLabel,
      summary: description || title,
      url: link,
      publishedAt: pubDate ? parseRssDate(pubDate) : new Date(),
    });
  }
  return out;
}
