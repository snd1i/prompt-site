// Google Sheets API URL
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 Sheets ID:", SHEET_ID);
console.log("🔗 API URL:", SHEET_URL);

// Dil ayarları
const languages = {
    'en': 'English', 'sorani': 'Kurdish Sorani', 'badini': 'Kurdish Badini', 
    'tr': 'Turkish', 'ar': 'Arabic'
};

let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi");
    initLanguageSelector();
    loadPrompts();
    updateLanguage();
    document.getElementById('current-language').textContent = languages[currentLanguage];
});

// Dil seçici
function initLanguageSelector() {
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            currentLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            document.getElementById('current-language').textContent = languages[lang];
            updateLanguage();
        });
    });
}

// Dil güncelleme
function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) element.textContent = text;
    });
}

// Sheets'ten veri çek
async function loadPrompts() {
    console.log("📥 Promtlar yükleniyor...");
    
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const jsonStr = text.replace("google.visualization.Query.setResponse(", "").replace(/\);?$/, "");
        const jsonData = JSON.parse(jsonStr);
        
        processSheetData(jsonData.table);
        
    } catch (error) {
        console.error("Hata:", error);
        loadTestData();
    }
}

// Verileri işle
function processSheetData(table) {
    const container = document.getElementById('prompts-container');
    const prompts = [];
    
    table.rows.forEach((row, index) => {
        if (index === 0) return; // Başlık satırı
        
        const cells = row.c || [];
        if (cells.length >= 2 && cells[0] && cells[0].v && cells[1] && cells[1].v) {
            prompts.push({
                image: cells[0].v,
                prompt: cells[1].v
            });
        }
    });
    
    console.log(`🎨 ${prompts.length} prompt bulundu`);
    displayPrompts(prompts);
}

// Test verileri
function loadTestData() {
    const testPrompts = [
        {
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
            prompt: "cute baby panda, Pixar style"
        },
        {
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
            prompt: "Beautiful mountain landscape at sunrise"
        }
    ];
    
    setTimeout(() => displayPrompts(testPrompts), 500);
}

// Promptları göster
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        
        // Resim URL'sini düzelt (typo fix)
        let imageUrl = prompt.image;
        if (imageUrl.includes('w-800')) {
            imageUrl = imageUrl.replace('w-800', 'w=800');
        }
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="AI Image" class="prompt-image" loading="lazy">
            <div class="prompt-content">
                <div class="prompt-text-container">
                    <p class="prompt-text">${prompt.prompt}</p>
                    <div class="fade-overlay"></div>
                </div>
                <button class="copy-btn" data-prompt="${prompt.prompt}">
                    <i class="far fa-copy"></i>
                    <span>Copy Prompt</span>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    attachCopyListeners();
}

// Kopyalama
function attachCopyListeners() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-prompt');
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification();
            });
        });
    });
}

function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

console.log("✨ Script hazır! Sheets ID: " + SHEET_ID);
