// Google Sheets API URL
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 AI Prompt Gallery - Çalışıyor");

// Dil ayarları
const languages = {
    'en': 'English',
    'tr': 'Turkish'
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

// Dil seçiciyi başlat
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

// Dil güncelle
function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) element.textContent = text;
    });
}

// Google Sheets'ten veri çek
async function loadPrompts() {
    const container = document.getElementById('prompts-container');
    
    try {
        console.log("📥 Sheets'ten veri çekiliyor...");
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Sheets hatası');
        }
        
        const text = await response.text();
        const jsonStr = text.replace("google.visualization.Query.setResponse(", "").replace(/\);?$/, "");
        const jsonData = JSON.parse(jsonStr);
        
        displayPrompts(jsonData.table);
        
    } catch (error) {
        console.error("❌ Hata:", error);
        showTestData();
    }
}

// Promtları göster
function displayPrompts(table) {
    const container = document.getElementById('prompts-container');
    const prompts = [];
    
    // İlk satır başlık, onu atla
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        
        if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
            let imageUrl = row.c[0].v.toString();
            const promptText = row.c[1].v.toString();
            
            // URL düzelt
            if (imageUrl.includes('w-800')) {
                imageUrl = imageUrl.replace('w-800', 'w=800');
            }
            
            prompts.push({
                image: imageUrl,
                prompt: promptText
            });
        }
    }
    
    console.log(`✅ ${prompts.length} prompt bulundu`);
    
    if (prompts.length > 0) {
        showPrompts(prompts);
    } else {
        showTestData();
    }
}

// Promptları HTML'e ekle
function showPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        
        card.innerHTML = `
            <img src="${prompt.image}" alt="AI Image ${index + 1}" class="prompt-image">
            <div class="prompt-content">
                <div class="prompt-text-container">
                    <p class="prompt-text">${prompt.prompt}</p>
                    <div class="fade-overlay"></div>
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${prompt.prompt.replace(/'/g, "\\'")}')">
                    <i class="far fa-copy"></i>
                    <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Test verileri göster
function showTestData() {
    const container = document.getElementById('prompts-container');
    
    const testData = [
        {
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
            prompt: "Futuristic AI city with neural networks"
        },
        {
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            prompt: "Beautiful mountain landscape"
        }
    ];
    
    showPrompts(testData);
    
    container.innerHTML += `
        <div style="text-align: center; color: white; grid-column: 1 / -1;">
            <p><small>Test modu: Sheets bağlantısı kontrol ediliyor...</small></p>
        </div>
    `;
}

// Kopyalama fonksiyonu
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('copy-notification');
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    });
}

console.log("✨ Script hazır!");
