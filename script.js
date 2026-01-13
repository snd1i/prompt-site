// Google Sheets API
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 Sheets ID:", SHEET_ID);

// Dil ayarları
const languages = {
    'en': 'English', 'sorani': 'Kurdish Sorani', 'badini': 'Kurdish Badini', 
    'tr': 'Turkish', 'ar': 'Arabic'
};

let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi - YENİ VERSİYON");
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
            changeLanguage(lang);
        });
    });
}

// Dil değiştir
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    document.getElementById('current-language').textContent = languages[lang];
    updateLanguage();
}

// Dil güncelle
function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) element.textContent = text;
    });
}

// Sheets'ten veri çek - KESİN ÇALIŞAN
async function loadPrompts() {
    console.log("📥 Sheets verisi çekiliyor...");
    
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        console.log("📝 Ham veri (ilk 200 karakter):", text.substring(0, 200));
        
        // Google formatını düzelt
        let jsonStr = text;
        if (jsonStr.startsWith("/*O_o*/")) {
            jsonStr = jsonStr.substring(7); // /*O_o*/ kısmını kes
        }
        if (jsonStr.includes("google.visualization.Query.setResponse(")) {
            jsonStr = jsonStr.replace("google.visualization.Query.setResponse(", "");
            jsonStr = jsonStr.substring(0, jsonStr.length - 2); // Son 2 karakteri kes
        }
        
        console.log("🔄 JSON dönüştürülüyor...");
        const jsonData = JSON.parse(jsonStr);
        console.log("✅ JSON parse edildi");
        
        // Verileri işle
        processSheetData(jsonData.table);
        
    } catch (error) {
        console.error("❌ HATA:", error.message);
        showErrorMessage(error.message);
    }
}

// Hata mesajı göster
function showErrorMessage(errorMsg) {
    const container = document.getElementById('prompts-container');
    
    let message = "Veri yüklenemedi: " + errorMsg;
    if (currentLanguage === 'tr') {
        message = "Veri yüklenemedi: " + errorMsg;
    } else if (currentLanguage === 'badini') {
        message = "داتا بار نه کرا: " + errorMsg;
    }
    
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button class="retry-btn" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                ${currentLanguage === 'tr' ? 'Tekrar Dene' : 'Try Again'}
            </button>
        </div>
    `;
}

// Verileri işle
function processSheetData(table) {
    console.log("📊 Tablo satır sayısı:", table.rows.length);
    
    const prompts = [];
    
    // İlk satırı atla (başlık satırı)
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        
        if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
            let imageUrl = row.c[0].v.toString();
            const promptText = row.c[1].v.toString();
            
            // URL'yi düzelt
            if (imageUrl.includes('w-800')) {
                imageUrl = imageUrl.replace('w-800', 'w=800');
            }
            
            prompts.push({
                image: imageUrl,
                prompt: promptText
            });
        }
    }
    
    console.log(`🎯 ${prompts.length} prompt bulundu`);
    
    if (prompts.length > 0) {
        displayPrompts(prompts);
    } else {
        document.getElementById('prompts-container').innerHTML = `
            <div class="no-prompts">
                <i class="fas fa-image"></i>
                <p>${currentLanguage === 'tr' ? 'Henüz prompt eklenmemiş' : 'No prompts added yet'}</p>
            </div>
        `;
    }
}

// Promptları göster
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <img src="${prompt.image}" alt="AI Image ${index + 1}" class="prompt-image" loading="lazy">
            <div class="prompt-content">
                <div class="prompt-text-container">
                    <p class="prompt-text">${prompt.prompt}</p>
                    <div class="fade-overlay"></div>
                </div>
                <button class="copy-btn" data-prompt="${prompt.prompt.replace(/"/g, '&quot;')}">
                    <i class="far fa-copy"></i>
                    <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Kopyalama butonlarına tıklama ekle
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-prompt');
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotification();
            });
        });
    });
}

// Kopyalama bildirimi
function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 2000);
}

console.log("✨ YENİ script.js yüklendi! Tarih: " + new Date().toLocaleString());
