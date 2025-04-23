# 📦 Card Importer – Supabase Insert Generator

This tool converts a tab-separated export of your card data into clean SQL statements that:

1. Run `delete_card(card_name)` to remove any existing entry
2. Re-insert the card using your `insert_card(...)` function in Supabase

The result is a fully copy-pasteable `output.sql` file.

---

## ✅ What It Does

- Parses your `.tsv` from Google Sheets
- Escapes special characters safely for SQL
- Splits `keywords`, `tags`, and `categories` into `TEXT[]` arrays
- Outputs clean SQL for every card

---

## 🛠 How to Use It

### 1. 🧰 Prerequisites

Install [Node.js](https://nodejs.org/) (version 18+ recommended) if you haven’t already.

---

### 2. 📁 Set Up Your Project Folder

Open a terminal and run:

```bash
mkdir card-insert-generator
cd card-insert-generator

### 3.  📄 Add Your Exported TSV File
From Google Sheets:

Make any Updates or changes to the cards table, Then:
```
File → Download → Tab-separated values (.tsv)
```
Name it
```
cards.tsv
```
Place that file into the folder.

### 4. 📜 Create the Parser Script
Create a new file named generate-inserts.js in the folder.
Paste in generate-inserts.js code

### 5. 📦 Install Dependencies
In your terminal:
```
npm init -y
npm install csv-parse
```
Then open package.json and add this line at the top to support ES module syntax:
```
"type": "module",
```

### 6. ▶️ Run the Parser
```
node generate-inserts.js
```
This will generate:
```
output.sql
```

### 7. 🧠 Import into Supabase
Open Supabase Studio → SQL Editor, and paste in the contents of output.sql, then run it.

This will:

Safely delete any previous version of the card

Insert it cleanly using insert_card(...)

### Example Output
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
  ARRAY['Crushing Blow', 'Reaction', 'Remove'],
  ARRAY['Skill'],
  ARRAY['Enhance']
);
```

