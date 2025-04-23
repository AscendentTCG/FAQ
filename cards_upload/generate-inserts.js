import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Read the TSV file
const raw = fs.readFileSync('cards.tsv', 'utf-8');
const records = parse(raw, {
  columns: true,
  skip_empty_lines: true,
  delimiter: '\t',
});

// Helper to escape single quotes for SQL
const escapeSql = str => (str || '').replace(/'/g, "''");

// Rarity normalization map
const normalizeRarity = r => {
  const map = {
    'U': 'Uncommon',
    'C': 'Common',
    'L': 'Legendary',
    'R': 'Rare',
    'S': 'Stamina'
  };
  return map[r?.trim().toUpperCase()] || r;
};

// Build SQL output
let output = '';

records.forEach(row => {
  const name = escapeSql(row.card_name);
  const stack_cost = parseInt(row.stack_cost) || 0;
  const card_effects = escapeSql(row.card_effects || '');
  const type = escapeSql(row.type || '');
  const rarity = escapeSql(normalizeRarity(row.rarity || ''));

  const keywords = row.keywords
    ? `ARRAY[${row.keywords.split(',').map(k => `'${escapeSql(k.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const tags = row.tags
    ? `ARRAY[${row.tags.split(',').map(t => `'${escapeSql(t.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

  const categories = row.categories
    ? `ARRAY[${row.categories.split(',').map(c => `'${escapeSql(c.trim())}'`).join(', ')}]`
    : 'ARRAY[]::TEXT[]';

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
  ${categories}
);\n\n`;
});

// Save output
fs.writeFileSync('output.sql', output);
console.log('✅ SQL written to output.sql');
