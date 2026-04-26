// Fix common Windows-1252-misread-as-UTF8 mojibake across the city-wallet codebase.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'city-wallet');
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'tsconfig.tsbuildinfo']);
const VALID_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.css', '.mjs']);

// Order matters: longer/more specific first.
const REPLACEMENTS = [
  // Box-drawing
  ['â\u0094\u0080', '\u2500'],   // ─
  ['â\u0080\u0094', '\u2014'],   // —
  ['â\u0080\u0093', '\u2013'],   // –
  ['â\u0080\u00A6', '\u2026'],   // …
  ['â\u0080\u00A2', '\u2022'],   // •
  ['â\u0080\u0098', '\u2018'],   // '
  ['â\u0080\u0099', '\u2019'],   // '
  ['â\u0080\u009C', '\u201C'],   // "
  ['â\u0080\u009D', '\u201D'],   // "
  ['â\u0080\u00B0', '\u2030'],   // ‰
  ['â\u0080\u00B9', '\u2039'],   // ‹
  ['â\u0080\u00BA', '\u203A'],   // ›
  ['â\u0080\u0090', '\u2010'],   // ‐
  ['â\u0086\u0090', '\u2190'],   // ←
  ['â\u0086\u0091', '\u2191'],   // ↑
  ['â\u0086\u0092', '\u2192'],   // →
  ['â\u0086\u0093', '\u2193'],   // ↓
  ['â\u0080¢', '\u2022'],
  ['â\u0080¦', '\u2026'],
  ['â\u0080"', '\u2014'],
  ['â\u0080\u0093', '\u2013'],
  ['â\u0080\u0094', '\u2014'],
  ['â\u0080™', '\u2019'],
  ['â\u0080˜', '\u2018'],
  ['â\u0080œ', '\u201C'],
  ['â\u0080\u009d', '\u201D'],
  ['â\u0086\u2019', '\u2192'],
  ['â\u0080\u201D', '\u2014'],
  ['â–\u008C', '\u258C'],         // ▌
  ['â\u201A¬', '\u20AC'],         // €
  ['âˆ\u0092', '\u2212'],         // −
  ['â°', '\u00B0'],
  // Specific often-seen sequences with mixed encodings
  ['â€¦', '\u2026'],
  ['â€¢', '\u2022'],
  ['â€"', '\u2014'],
  ['â€"', '\u2013'],
  ['â€™', '\u2019'],
  ['â€˜', '\u2018'],
  ['â€œ', '\u201C'],
  ['â€\u009d', '\u201D'],
  ['â†\u2019', '\u2192'],
  ['â†\u2014', '\u2190'],
  ['\u00E2\u2020\u2019', '\u2192'], // â†'
  ['\u20AC', '\u20AC'], // keep euro
  ['â‚¬', '\u20AC'],
  ['\u00E2\u02C6\u2019', '\u2212'], // âˆ'
  ['â–Œ', '\u258C'],
  ['â”€', '\u2500'],
  ['â—‹', '\u25CB'],
  // Latin diacritics (German)
  ['Ã¤', 'ä'],
  ['Ã„', 'Ä'],
  ['Ã¶', 'ö'],
  ['Ã–', 'Ö'],
  ['Ã¼', 'ü'],
  ['Ãœ', 'Ü'],
  ['ÃŸ', 'ß'],
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ã ', 'à'],
  ['Ã¡', 'á'],
  ['Ã³', 'ó'],
  ['Ã­', 'í'],
  ['Ãº', 'ú'],
  ['Ã±', 'ñ'],
  ['Ã§', 'ç'],
  ['Â°', '°'],
  ['Â·', '·'],
  ['Â±', '±'],
  ['Âµ', 'µ'],
  ['Â¥', '¥'],
  ['Â£', '£'],
  ['Â§', '§'],
  // Strip stray non-printable bytes (common artefacts)
  ['ï»¿', ''], // BOM
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let totalFixed = 0;
const filesChanged = [];

for (const file of walk(ROOT)) {
  const ext = path.extname(file);
  if (!VALID_EXT.has(ext)) continue;
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
  let original = content;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  if (content !== original) {
    const diff = Math.abs(original.length - content.length);
    fs.writeFileSync(file, content, 'utf8');
    filesChanged.push({ file: path.relative(ROOT, file), diff });
    totalFixed++;
  }
}

console.log(`Fixed ${totalFixed} files`);
filesChanged.forEach(({ file, diff }) => console.log(`  ${file} (Δ ${diff} bytes)`));
