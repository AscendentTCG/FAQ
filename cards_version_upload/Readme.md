# 🔄 Card Version Importer – GitHub Image-Based SQL Generator

This tool parses a `.tsv` export of card version metadata and generates SQL statements that call your `insert_card_version(...)` Supabase function.

Each entry maps a specific version of a card (e.g., Default, Foil, Thium, Special) with its corresponding image hosted in a GitHub folder structure.

---

## ✅ What It Does

- Reads `.tsv` with columns like:  
  `card_name, Card Num, Default, Foil, Thium, Special, Flavor Text`
- Each version column contains the **artist name** if that version is present
- Outputs a ready-to-run `insert_versions.sql` file with GitHub image paths like:  
  `https://raw.githubusercontent.com/AscendentTCG/FAQ/images/assets/cards/images/<Card Name>/<Set>/<Print Run>/<version>/<Card Name>.PNG`

You can control which version types are included by editing this constant:

```js
const PROCESS_ONLY = ['Default'];
```

Only these version categories will be processed and output in the SQL.

---

## 🛠 Step-by-Step Guide

If you've never used this parser before, follow these steps:

---

### 1. 📦 Install Node.js

Install Node.js (v18+ recommended) from [https://nodejs.org](https://nodejs.org)

---

### 2. 📁 Set Up the Project Folder

```bash
mkdir card-version-parser
cd card-version-parser
```

---

### 3. 🧾 Prepare Your TSV File

In Google Sheets:
- Use headers: `card_name`, `Card Num`, `Default`, `Foil`, `Thium`, `Special`, `Flavor Text`
- Fill in the **artist name** under each version column if that version exists.

Then:

```
File → Download → Tab-separated values (.tsv)
```

Save the file as:

```
card_versions.tsv
```

Place it in your project folder.

---

### 4. 🧠 Create the Parser Script

Create a file named `generate_card_versions.js` in the same folder.

Paste in the provided script.

---

### 5. ⚙️ Configure the Constants

At the top of your script, set:

```js
const SET_NAME = 'Saqiya Festival';    // Your set name
const PRINT_RUN = 'Unlimited';         // Your print run
const PROCESS_ONLY = ['Default'];      // Only include specific version types
```

You can update these later as needed.

---

### 6. 📦 Install Dependencies

Run the following:

```bash
npm init -y
npm install csv-parse
```

Then edit `package.json` to add this(You can add it under version.):
```json
"type": "module"
```

---

### 7. ▶️ Run the Parser

```bash
node generate_card_versions.js
```

This will generate a new file:

```
insert_versions.sql
```

---

### 8. 🧠 Import into Supabase

1. Go to [Supabase Studio](https://app.supabase.com/)  
2. Open **SQL Editor**  
3. Paste the contents of `insert_versions.sql`  
4. Run the SQL to insert your card versions


## ✅ Example Output SQL

```sql
-- Abandon Reason [Default: ✔, Foil: ✘, Thium: ✘, Special: ✘]
SELECT insert_card_version(
  'Abandon Reason',
  3,
  'Default',
  'Collin Ha',
  'My brain says no, but my body says yes.',
  'https://raw.githubusercontent.com/AscendentTCG/FAQ/images/assets/cards/images/Abandon%20Reason/Saqiya Festival/Unlimited/default/Abandon%20Reason.PNG',
  'Saqiya Festival'
);
```

---
