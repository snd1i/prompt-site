# AI Prompt Gallery

Modern, responsive AI prompt gallery that displays image generation prompts from Google Sheets.

## 🚀 Quick Setup

### 1. Upload to GitHub
1. Go to your GitHub repository
2. Click "Add file" → "Upload files"
3. Upload these 4 files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

### 2. Enable GitHub Pages
1. Go to Repository Settings
2. Find "Pages" in left menu
3. Under "Source", select "main" branch
4. Click "Save"
5. Wait 1-2 minutes
6. Your site will be live at: `https://[username].github.io/[repository-name]/`

## 📊 Google Sheets Setup

### Sheet Structure
Use only 2 columns in your Google Sheet:

| Column | Description | Example |
|--------|-------------|---------|
| `image` | Image URL | `https://images.unsplash.com/photo-...` |
| `prompt` | English prompt text | `Photographic, ultra realistic, a robot drawing...` |

### Sharing Settings (IMPORTANT)
1. Open your Google Sheet
2. Click "Share" button (top-right)
3. Change from "Restricted" to "Anyone with the link"
4. Set permission to "Viewer"
5. Click "Done"

## 🌍 Language Support

### Interface Languages (5 supported)
- 🇬🇧 English
- 🇹🇯 Kurdish Sorani
- 🇹🇯 Kurdish Badini
- 🇹🇷 Turkish
- 🇮🇶 Arabic

### Prompts Language
- All prompts are displayed in **ENGLISH ONLY**
- Interface texts change based on selected language
- Prompt content remains in English for all languages

## 🔧 Customization

### Change Google Sheets ID
Edit `script.js` line 2:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
