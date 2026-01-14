// GOOGLE SHEETS - KESİN ÇALIŞAN ID
const SHEET_ID = '1ycPsfDBTQOVgewcBizheXinnrqe4UV'; // BU ÇALIŞIYOR
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 AI Prompt Gallery - ÇALIŞAN");
console.log("🔗 Sheets URL:", SHEET_URL);

// TEST VERİLERİ
const TEST_DATA = [
    {
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
        prompt: "Futuristic AI city with neural networks"
    },
    {
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
        prompt: "Beautiful mountain landscape at sunrise"
    }
];

let currentLanguage = 'en';

// SAYFA YÜKLENDİ
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi");
    loadPrompts();
    setupLanguage();
    setupImageProtection();
});

// DİL AYARLARI
function setupLanguage() {
    document.getElementById('current-language').textContent = 'English';
    
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            currentLanguage = this.getAttribute('data-lang');
            document.getElementById('current-language').textContent = 
                currentLanguage === 'tr' ? 'Turkish' : 'English';
            updateLanguage();
        });
    });
}

function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(el => {
        const text = el.getAttribute(`data-${currentLanguage}`);
        if (text) el.textContent = text;
    });
}

// PROMPTLARI YÜKLE
async function loadPrompts() {
    const container = document.getElementById('prompts-container');
    
    try {
        console.log("📥 Sheets verisi alınıyor...");
        const response = await fetch(SHEET_URL);
        
        if (response.ok) {
            const text = await response.text();
            const cleanText = text.replace(/^.*?{/, '{').replace(/\);?$/, '');
            const jsonData = JSON.parse(cleanText);
            
            if (jsonData.table && jsonData.table.rows && jsonData.table.rows.length > 1) {
                console.log("✅ Sheets çalışıyor!");
                displaySheetsData(jsonData.table);
            } else {
                throw new Error('Boş veri');
            }
        } else {
            throw new Error('HTTP hatası');
        }
    } catch (error) {
        console.log("🔄 Sheets çalışmıyor, test verileri gösteriliyor");
        displayTestData();
    }
}

// SHEETS VERİLERİNİ GÖSTER
function displaySheetsData(table) {
    const container = document.getElementById('prompts-container');
    let html = '';
    
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
            const imageUrl = row.c[0].v.toString().replace('w-800', 'w=800');
            const promptText = row.c[1].v.toString();
            
            html += `
                <div class="prompt-card">
                    <img src="${imageUrl}" alt="AI Image" class="prompt-image" loading="lazy">
                    <div class="prompt-content">
                        <div class="prompt-text-container">
                            <p class="prompt-text">${promptText}</p>
                            <div class="fade-overlay"></div>
                        </div>
                        <button class="copy-btn" data-prompt="${promptText.replace(/"/g, '&quot;')}">
                            <i class="far fa-copy"></i>
                            <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    container.innerHTML = html || displayTestData();
    setupCopyButtons();
}

// TEST VERİLERİNİ GÖSTER
function displayTestData() {
    const container = document.getElementById('prompts-container');
    let html = '';
    
    TEST_DATA.forEach(item => {
        html += `
            <div class="prompt-card">
                <img src="${item.image}" alt="AI Image" class="prompt-image">
                <div class="prompt-content">
                    <div class="prompt-text-container">
                        <p class="prompt-text">${item.prompt}</p>
                        <div class="fade-overlay"></div>
                    </div>
                    <button class="copy-btn" data-prompt="${item.prompt.replace(/"/g, '&quot;')}">
                        <i class="far fa-copy"></i>
                        <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupCopyButtons();
    return html;
}

// KOPYALA BUTONLARI
function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-prompt');
            navigator.clipboard.writeText(text).then(() => {
                showNotification();
            });
        });
    });
}

// BİLDİRİM GÖSTER
function showNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

// RESİM KORUMA - SADECE LINK MENÜSÜ
function setupImageProtection() {
    console.log("🛡️ Resim koruma aktif");
    
    // CSS EKLE
    const style = document.createElement('style');
    style.textContent = `
        .prompt-image {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // EVENT'LAR
    document.addEventListener('contextmenu', function(e) {
        if (e.target.classList.contains('prompt-image')) {
            e.preventDefault();
        }
    });
    
    // RESİMLER YÜKLENDİKTEN SONRA
    setTimeout(() => {
        document.querySelectorAll('.prompt-image').forEach(img => {
            img.setAttribute('draggable', 'false');
        });
    }, 1000);
}

console.log("✨ Script hazır! Sheets ID: " + SHEET_ID);
