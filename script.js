// Google Sheets API URL
const SHEET_ID = '1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 AI Prompt Gallery - Script.js yüklendi");
console.log("📊 Sheets ID:", SHEET_ID);

// Dil ayarları
const languages = {
    'en': 'English',
    'sorani': 'Kurdish Sorani',
    'badini': 'Kurdish Badini',
    'tr': 'Turkish',
    'ar': 'Arabic'
};

// Varsayılan dil
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi");
    initLanguageSelector();
    loadPrompts();
    updateLanguage();
    setupImageProtection(); // RESİM KORUMA
    document.getElementById('current-language').textContent = languages[currentLanguage];
});

// Dil seçiciyi başlat
function initLanguageSelector() {
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
}

// Dil değiştirme
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    document.getElementById('current-language').textContent = languages[lang];
    updateLanguage();
}

// Tüm sayfayı güncelle
function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    if (currentLanguage === 'badini') {
        document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
    } else {
        document.body.style.fontFamily = "'Poppins', sans-serif";
    }
}

// Google Sheets'ten veri çek
async function loadPrompts() {
    const container = document.getElementById('prompts-container');
    
    try {
        console.log("📥 Sheets verisi çekiliyor...");
        
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP hatası: ${response.status}`);
        }
        
        const text = await response.text();
        console.log("✅ Veri alındı");
        
        // Google formatını düzelt
        const jsonStr = text
            .replace("google.visualization.Query.setResponse(", "")
            .replace(/\);?$/, "");
        
        const jsonData = JSON.parse(jsonStr);
        processSheetData(jsonData.table);
        
    } catch (error) {
        console.error("❌ Hata:", error);
        showErrorMessage();
    }
}

// Hata mesajı göster
function showErrorMessage() {
    const container = document.getElementById('prompts-container');
    
    let errorMessage = 'An error occurred while loading prompts.';
    let tryAgainText = 'Try Again';
    
    if (currentLanguage === 'tr') {
        errorMessage = 'Promptlar yüklenirken bir hata oluştu.';
        tryAgainText = 'Tekrar Dene';
    }
    
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${errorMessage}</p>
            <button class="retry-btn" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                ${tryAgainText}
            </button>
        </div>
    `;
}

// Verileri işle
function processSheetData(table) {
    console.log("📊 Veriler işleniyor...");
    
    const prompts = [];
    
    // İlk satırı atla (başlık satırı)
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        
        if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
            let imageUrl = row.c[0].v.toString();
            const promptText = row.c[1].v.toString();
            
            // URL'yi düzelt (w-800 -> w=800)
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
        displayPrompts(prompts);
    } else {
        showNoPromptsMessage();
    }
}

// Prompt yok mesajı
function showNoPromptsMessage() {
    const container = document.getElementById('prompts-container');
    let message = 'No prompts added yet.';
    
    if (currentLanguage === 'tr') {
        message = 'Henüz prompt eklenmemiş.';
    }
    
    container.innerHTML = `
        <div class="no-prompts">
            <i class="fas fa-image"></i>
            <p>${message}</p>
        </div>
    `;
}

// Promptları göster
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        
        // Buton metni
        let copyButtonText = 'Copy Prompt';
        if (currentLanguage === 'tr') {
            copyButtonText = 'Promptu Kopyala';
        }
        
        card.innerHTML = `
            <img src="${prompt.image}" alt="AI Generated Image ${index + 1}" 
                 class="prompt-image" loading="lazy">
            <div class="prompt-content">
                <div class="prompt-text-container">
                    <p class="prompt-text">${escapeHtml(prompt.prompt)}</p>
                    <div class="fade-overlay"></div>
                </div>
                <button class="copy-btn" data-prompt="${escapeHtml(prompt.prompt)}">
                    <i class="far fa-copy"></i>
                    <span>${copyButtonText}</span>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Kopyalama butonlarına tıklama ekle
    attachCopyListeners();
    // Resim korumasını tekrar uygula
    setupImageProtection();
}

// Kopyalama butonlarını bağla
function attachCopyListeners() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const promptText = this.getAttribute('data-prompt');
            
            try {
                await navigator.clipboard.writeText(promptText);
                showCopyNotification();
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = promptText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyNotification();
            }
        });
    });
}

// Kopyalama bildirimi
function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// RESİM KORUMA SİSTEMİ - SADECE LINK MENÜSÜNÜ ENGELLE
function setupImageProtection() {
    console.log("🛡️ Resim koruma aktif...");
    
    // 1. Tüm resimleri koru
    setTimeout(() => {
        document.querySelectorAll('.prompt-image').forEach(img => {
            // Mobilde uzun basmayı engelle
            img.style.webkitTouchCallout = 'none';
            img.style.webkitUserSelect = 'none';
            img.style.userSelect = 'none';
            
            // Sürüklemeyi engelle
            img.setAttribute('draggable', 'false');
            
            // Sağ tıkı engelle
            img.oncontextmenu = function(e) {
                e.preventDefault();
                return false;
            };
            
            // Touch event'ini engelle (mobil)
            img.ontouchstart = function(e) {
                e.preventDefault();
                return false;
            };
        });
    }, 1000);
    
    // 2. Global koruma
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // 3. Sürükleme engelle
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
}

console.log(`
✨ AI PROMPT GALLERY - Hazır!
📊 Sheets: ${SHEET_ID}
🌍 Diller: English, Turkish, Kurdish
🛡️ Koruma: Resim link menüsü engellendi
🚀 Resimler: Orjinal boyutta gösteriliyor
`);
