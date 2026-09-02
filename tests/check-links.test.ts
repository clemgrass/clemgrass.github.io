import { describe, expect, it } from 'vitest';
import { classifyStatus, extractExternalLinks } from '../scripts/check-links.mjs';

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

describe('classifyStatus', () => {
  it('treats 2xx as ok', () => {
    expect(classifyStatus(200)).toBe('ok');
    expect(classifyStatus(204)).toBe('ok');
  });

  it('treats 404 and 5xx as broken', () => {
    expect(classifyStatus(404)).toBe('broken');
    expect(classifyStatus(500)).toBe('broken');
  });

  // LinkedIn answers 999 to anything that is not a browser, and some hosts
  // answer 403 or 429 to automated clients. None of that means the link is
  // dead, so the checker must not fail the run over it.
  it('treats anti-bot responses as unverifiable rather than broken', () => {
    expect(classifyStatus(999)).toBe('unverifiable');
    expect(classifyStatus(403)).toBe('unverifiable');
    expect(classifyStatus(429)).toBe('unverifiable');
  });
});
