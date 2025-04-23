# 📦 Card Importer – Supabase Insert Generator

This tool parses a `.tsv` file (exported from Google Sheets) and generates SQL statements using your existing `insert_card()` function in Supabase.

It ensures clean re-insertion by calling `delete_card(card_name)` first, so you can re-import without duplicates.


---

## ✅ What It Does

For each row in your card list:
1. Generates a `SELECT delete_card('card_name');` to clear any old entry
2. Follows up with `SELECT insert_card(...)` to insert a fresh version

Outputs all statements to `output.sql`.
---

## 🛠 Setup Instructions

### 1. **Update Google Sheets**
- Use this column format exactly:
```
card_name stack_cost card_effects type rarity keywords tags categories
```
- `keywords`, `tags`, and `categories` should be **comma-separated** lists  
- Any extra columns (like `Window`) will be ignored

---

### 2. **Export as TSV**
- Go to `File → Download → Tab-separated values (.tsv)`
- Save the file as `cards.tsv` in this project folder

---

### 3. **Install Node.js (if not already installed)**
[Download from nodejs.org](https://nodejs.org/)

---

### 4. **Install Dependencies**
Run this in the terminal:
```bash
npm install csv-parse
```
### 5. Run the Script
Run the following command:
``` node generate-inserts.js```
It will generate a file called output.sql.

### 6. Paste into Supabase
Open the Supabase SQL Editor

Paste the contents of output.sql

Run it to insert all the cards into your database using your existing insert_card(...) function


### Example output 
```
-- Delete existing card
SELECT delete_card('Abandon Reason');

-- Insert updated card
SELECT insert_card(
  'Abandon Reason',
  2,
  'Reaction: Succeed on a Melee roll...',
  'Gambit',
  'Uncommon',
  ARRAY['Reaction', 'Melee Damage', 'Remove'],
  ARRAY['Skill'],
  ARRAY['Enhance']
);

```
