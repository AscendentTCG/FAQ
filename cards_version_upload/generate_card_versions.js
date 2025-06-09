import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Constants
const GITHUB_BASE = 'https://raw.githubusercontent.com/AscendentTCG/FAQ/images/assets/cards/images';
const SET_NAME = 'Saqiya Festival';
const PRINT_RUN = 'Unlimited';
const VERSION_TYPES = ['Default', 'Foil', 'Thium', 'Special']; // For display
const PROCESS_ONLY = ['Default']; // Only generate SQL for these

// Read TSV file
const raw = fs.readFileSync('card_versions.tsv', 'utf-8');
const records = parse(raw, {
  columns: true,
  skip_empty_lines: true,
  delimiter: '\t',
});

// Helpers
const escapeSql = str => (str || '').replace(/'/g, "''");

const decodeHtmlEntities = str =>
  (str || '')
    .replace(/&c;/g, ',')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const escapePath = str => encodeURIComponent(str);
const escapeFileName = str => str.replace(/[^a-zA-Z0-9 _-]/g, '');

let output = '';

records.forEach(row => {
  const rawCardName = decodeHtmlEntities(row.card_name);
  const cardName = escapeSql(rawCardName);
  const encodedCardName = escapePath(rawCardName);
  const safeFileName = escapeFileName(rawCardName) + '.PNG';

  const cardNum = parseInt(row['Card Num']) || 0;
  const flavorText = escapeSql(decodeHtmlEntities(row['Flavor Text'] || ''));
  const setName = escapeSql(SET_NAME);

  // Add comment for all categories
  output += `-- ${cardName} [`;
  output += VERSION_TYPES.map(v => {
    const val = row[v] && row[v].trim() ? '✔' : '✘';
    return `${v}: ${val}`;
  }).join(', ');
  output += `]\n`;

  PROCESS_ONLY.forEach(type => {
    const artistRaw = row[type];
    if (!artistRaw || artistRaw.trim() === '') return;

    const artist = escapeSql(artistRaw.trim());
    const versionFolder = type.toLowerCase();
    const imageUrl = `${GITHUB_BASE}/${encodedCardName}/${SET_NAME}/${PRINT_RUN}/${versionFolder}/${encodeURIComponent(safeFileName)}`;

    output += `SELECT insert_card_version(
  '${cardName}',
  ${cardNum},
  '${type}',
  '${artist}',
  '${flavorText}',
  '${imageUrl}',
  '${setName}'
);\n\n`;
  });
});

// Write to file
fs.writeFileSync('insert_versions.sql', output);
console.log(' SQL written to insert_versions.sql');
