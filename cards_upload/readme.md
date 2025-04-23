# 📦 Card Importer – Supabase Insert Generator

This tool generates a list of SQL `SELECT insert_card(...)` statements from your **Google Sheets-exported `.tsv` file** so you can quickly bulk import cards into your Supabase database.

---

## ✅ How It Works

It reads your exported data, formats each card using your existing `insert_card` function, and produces a `.sql` file ready to paste into the Supabase SQL editor.

---

## 🛠 Setup Instructions

### 1. **Update Google Sheets**
- Use this column format exactly:
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
SELECT insert_card(
  'Abandon Reason',
  2,
  'Reaction: ...',
  'Gambit',
  'Uncommon',
  ARRAY['Crushing Blow', 'Reaction', 'Remove'],
  ARRAY['Skill'],
  ARRAY['Enhance']
);
```
