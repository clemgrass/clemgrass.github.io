import { readFile } from 'node:fs/promises';

const HREF = /href="(https?:\/\/[^"]+)"/g;

export function extractExternalLinks(html) {
  return [...new Set([...html.matchAll(HREF)].map((match) => match[1]))];
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

  for (const url of links) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (response.ok) {
        console.log(`  ok   ${response.status}  ${url}`);
      } else {
        console.log(`  FAIL ${response.status}  ${url}`);
        failed += 1;
      }
    } catch (error) {
      console.log(`  FAIL  ---  ${url}  (${error.message})`);
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} link(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${links.length} link(s) ok.`);
}

// Only run the checker when invoked directly, so importing it in tests is safe.
if (import.meta.filename === process.argv[1]) {
  await main();
}
