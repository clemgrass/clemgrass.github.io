import { readFile } from 'node:fs/promises';

const HREF = /href="(https?:\/\/[^"]+)"/g;

export function extractExternalLinks(html) {
  return [...new Set([...html.matchAll(HREF)].map((match) => match[1]))];
}

/**
 * Some hosts refuse automated clients outright — LinkedIn answers 999 to
 * anything without a browser user agent — and that says nothing about whether
 * the link works. Those responses are reported but never fail the run.
 */
export function classifyStatus(status) {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 999 || status === 403 || status === 429) return 'unverifiable';
  return 'broken';
}

async function main() {
  let html;
  try {
    html = await readFile('dist/index.html', 'utf8');
  } catch {
    console.error('dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const links = extractExternalLinks(html);
  if (links.length === 0) {
    console.log('No external links to check.');
    return;
  }

  let failed = 0;
  let skipped = 0;

  for (const url of links) {
    try {
      let response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

      // Not every server implements HEAD; fall back to GET before judging.
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, { method: 'GET', redirect: 'follow' });
      }

      const verdict = classifyStatus(response.status);
      if (verdict === 'ok') {
        console.log(`  ok      ${response.status}  ${url}`);
      } else if (verdict === 'unverifiable') {
        console.log(`  skip    ${response.status}  ${url}  (host blocks automated checks)`);
        skipped += 1;
      } else {
        console.log(`  BROKEN  ${response.status}  ${url}`);
        failed += 1;
      }
    } catch (error) {
      console.log(`  BROKEN  ---  ${url}  (${error.message})`);
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} link(s) broken.`);
    process.exit(1);
  }

  const checked = links.length - skipped;
  console.log(
    skipped > 0
      ? `\n${checked} link(s) ok, ${skipped} unverifiable (check by hand).`
      : `\nAll ${links.length} link(s) ok.`
  );
}

// Only run the checker when invoked directly, so importing it in tests is safe.
if (import.meta.filename === process.argv[1]) {
  await main();
}
