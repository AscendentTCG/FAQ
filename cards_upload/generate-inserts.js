import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read and parse TSV file
const raw = fs.readFileSync('cards.tsv', 'utf-8');
const records = parse(raw, {
  columns: true,
  skip_empty_lines: true,
  delimiter: '\t'
});

// Escape single quotes for SQL
const escapeSql = str => (str || '').replace(/'/g, "''");

// Generate SQL statements
let output = '';

records.forEach(row => {
  const name = escapeSql(row.card_name);
  const stack_cost = parseInt(row.stack_cost) || 0;
  const card_effects = escapeSql(row.card_effects || '');
  const type = escapeSql(row.type || '');
  const rarity = escapeSql(row.rarity || '');

  const keywords = row.keywords
    ? `ARRAY[${row.keywords.split(',').map(k => `'${escapeSql(k.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const tags = row.tags
    ? `ARRAY[${row.tags.split(',').map(t => `'${escapeSql(t.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const categories = row.categories
    ? `ARRAY[${row.categories.split(',').map(c => `'${escapeSql(c.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  output += `SELECT insert_card(
  '${name}',
  ${stack_cost},
  '${card_effects}',
  '${type}',
  '${rarity}',
  ${keywords},
  ${tags},
  ${categories}
);\n\n`;
});

// Save to output.sql (optional), or just print
fs.writeFileSync('output.sql', output);
console.log('✅ SQL generated and saved to output.sql');
