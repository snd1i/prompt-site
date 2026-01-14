// GOOGLE SHEETS AYARLARI
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 AI Prompt Gallery Başladı");
console.log("📊 Sheets ID:", SHEET_ID);
console.log("🔗 API URL:", SHEET_URL);

// Dil ayarları
const languages = {
    'en': 'English',
    'tr': 'Turkish'
};

let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM yüklendi");
    loadPrompts();
    updateLanguage();
    setupImageProtection();
});

// Dil güncelle
function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(el => {
        const text = el.getAttribute(`data-${currentLanguage}`);
        if (text) el.textContent = text;
    });
    
    document.getElementById('current-language').textContent = languages[currentLanguage];
}

// Google Sheets'ten veri çek
async function loadPrompts() {
    console.log("📥 Sheets'ten veri çekiliyor...");
    
    try {
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            console.error("❌ HTTP Hatası:", response.status);
            showTestData();
            return;
        }
        
        const text = await response.text();
        console.log("📝 Gelen veri:", text.substring(0, 200));
        
        // JSON'u temizle
        const cleanText = text.replace(/^.*?{/, '{').replace(/\);?$/, '');
        const jsonData = JSON.parse(cleanText);
        
        console.log("✅ JSON parse edildi");
        displayPromptsFromData(jsonData.table);
        
    } catch (error) {
        console.error("❌ Hata:", error);
        showTestData();
    }
}

// Verileri göster
function displayPromptsFromData(table) {
    const container = document.getElementById('prompts-container');
    
    if (!table || !table.rows || table.rows.length < 2) {
        showTestData();
        return;
    }
    
    let html = '';
    
    // İlk satır başlık, onu atla
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
                        <button class="copy-btn" onclick="copyPrompt('${promptText.replace(/'/g, "\\'")}')">
                            <i class="far fa-copy"></i>
                            <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    if (html) {
        container.innerHTML = html;
    } else {
        showTestData();
    }
}

// TEST verileri göster (Sheets çalışmazsa)
function showTestData() {
    console.log("🧪 Test verileri gösteriliyor...");
    
    const container = document.getElementById('prompts-container');
    const testPrompts = [
        {
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
            prompt: "Futuristic AI city with neural networks"
        },
        {
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
            prompt: "Beautiful mountain landscape at sunrise"
        }
    ];
    
    let html = '';
    testPrompts.forEach(prompt => {
        html += `
            <div class="prompt-card">
                <img src="${prompt.image}" alt="AI Image" class="prompt-image">
                <div class="prompt-content">
                    <div class="prompt-text-container">
                        <p class="prompt-text">${prompt.prompt}</p>
                        <div class="fade-overlay"></div>
                    </div>
                    <button class="copy-btn" onclick="copyPrompt('${prompt.prompt.replace(/'/g, "\\'")}')">
                        <i class="far fa-copy"></i>
                        <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html + `
        <div style="text-align: center; color: white; grid-column: 1 / -1; padding: 20px;">
            <p><small>Test modu: Google Sheets bağlantısı kontrol ediliyor...</small></p>
            <button onclick="location.reload()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Sayfayı Yenile
            </button>
        </div>
    `;
}

// Prompt kopyala
function copyPrompt(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('copy-notification');
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    });
}

// Resim koruma
function setupImageProtection() {
    console.log("🛡️ Resim koruma aktif");
    
    // CSS ile koruma
    const style = document.createElement('style');
    style.textContent = `
        .prompt-image {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Event listener'lar
    document.addEventListener('contextmenu', e => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    
    document.addEventListener('dragstart', e => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
}

console.log("✨ Script hazır!");
