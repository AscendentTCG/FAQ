import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read the TSV file
const raw = fs.readFileSync('cards.tsv', 'utf-8');
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

let output = '';

records.forEach(row => {
  const name = escapeSql(decodeHtmlEntities(row.card_name));
  const stack_cost = parseInt(row.stack_cost) || 0;
  const card_effects = escapeSql(decodeHtmlEntities(row.card_effects || ''));
  const type = escapeSql(decodeHtmlEntities(row.type || ''));
  
  const rarity = escapeSql(decodeHtmlEntities(row.rarity || 'None'));

  const keywords = row.keywords
    ? `ARRAY[${row.keywords.split(',').map(k => `'${escapeSql(decodeHtmlEntities(k.trim()))}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const tags = row.tags
    ? `ARRAY[${row.tags.split(',').map(t => `'${escapeSql(decodeHtmlEntities(t.trim()))}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const categories = row.categories
    ? `ARRAY[${row.categories.split(',').map(c => `'${escapeSql(decodeHtmlEntities(c.trim()))}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const card_window = row.Window
    ? `ARRAY[${row.Window.split(',').map(num => parseInt(num.trim())).join(', ')}]`
    : 'ARRAY[]::INT[]';

  output += `-- Delete existing card
SELECT delete_card('${name}');

-- Insert updated card
SELECT insert_card(
  '${name}',
  ${stack_cost},
  '${card_effects}',
  '${type}',
  '${rarity}',
  ${keywords},
  ${tags},
  ${categories},
  ${card_window}
);\n\n`;
});

// Save output
fs.writeFileSync('output.sql', output);
console.log(' SQL written to output.sql');
