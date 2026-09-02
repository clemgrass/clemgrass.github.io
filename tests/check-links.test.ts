import { describe, expect, it } from 'vitest';
import { extractExternalLinks } from '../scripts/check-links.mjs';

describe('extractExternalLinks', () => {
  it('finds http and https hrefs', () => {
    const html = `<a href="https://farolazo.com">a</a><a href="http://example.org">b</a>`;
    expect(extractExternalLinks(html)).toEqual([
      'https://farolazo.com',
      'http://example.org',
    ]);
  });

  it('ignores relative and mailto hrefs', () => {
    const html = `<a href="/about">a</a><a href="mailto:x@y.com">b</a>`;
    expect(extractExternalLinks(html)).toEqual([]);
  });

  it('deduplicates repeated hrefs', () => {
    const html = `<a href="https://a.com">1</a><a href="https://a.com">2</a>`;
    expect(extractExternalLinks(html)).toEqual(['https://a.com']);
  });
});
