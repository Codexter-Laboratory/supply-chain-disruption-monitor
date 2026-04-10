import { InvalidDomainStateError } from '../../common/errors/domain.error';

export type NewsItemProps = {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly timestamp: Date;
  readonly summary: string;
  readonly url: string;
};

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function assertNonEmpty(label: string, value: string): string {
  const t = value.trim();
  if (!t) {
    throw new InvalidDomainStateError(`${label} must be non-empty`);
  }
  return t;
}

/** Normalized news row for UI lists (read model). */
export class NewsItem {
  private constructor(private readonly props: NewsItemProps) {}

  static restore(raw: NewsItemProps): NewsItem {
    const id = assertNonEmpty('NewsItem id', raw.id);
    const title = assertNonEmpty('NewsItem title', raw.title);
    const source = assertNonEmpty('NewsItem source', raw.source);
    const summary = assertNonEmpty('NewsItem summary', raw.summary);
    const url = assertNonEmpty('NewsItem url', raw.url);
    if (!isHttpUrl(url)) {
      throw new InvalidDomainStateError(`NewsItem url must be http(s): ${url}`);
    }
    if (!(raw.timestamp instanceof Date) || Number.isNaN(raw.timestamp.getTime())) {
      throw new InvalidDomainStateError('NewsItem timestamp must be a valid Date');
    }
    return new NewsItem({
      id,
      title,
      source,
      summary,
      url,
      timestamp: raw.timestamp,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get source(): string {
    return this.props.source;
  }
  get timestamp(): Date {
    return this.props.timestamp;
  }
  get summary(): string {
    return this.props.summary;
  }
  get url(): string {
    return this.props.url;
  }
}
