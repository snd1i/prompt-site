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

// Badini çevirileri
const badiniTranslations = {
    'loading': 'چافەرێبە',
    'load_error': 'خەلەتیەک چێبی هیفیە سەڤحێ جدید بکە',
    'no_prompts': 'هێشتا چ کود داخل نەکرنە',
    'copy_button': 'کوپی بکە',
    'copied': 'هاتە کوپیکرن',
    'telegram_title': 'کەنالێ مەیێ تلیگرامی',
    'telegram_desc': 'بو پرومپتێن جدید و تحدیسان جوین بکە'
};

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
    // Tüm elementleri güncelle
    document.querySelectorAll('[data-tr]').forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Badini dili için font
    if (currentLanguage === 'badini') {
        document.body.style.fontFamily = "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif";
    } else {
        document.body.style.fontFamily = "'Poppins', sans-serif";
    }
    
    // Kopyala butonlarını güncelle
    updateCopyButtons();
}

// Kopyala butonlarını güncelle
function updateCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn span');
    
    copyButtons.forEach(span => {
        const text = span.getAttribute(`data-${currentLanguage}`);
        if (text) {
            span.textContent = text;
        } else if (currentLanguage === 'badini') {
            span.textContent = badiniTranslations.copy_button || 'کوپی بکە';
        }
    });
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
    let errorMessage = '';
    let tryAgainText = 'Try Again';
    
    if (currentLanguage === 'badini') {
        errorMessage = badiniTranslations.load_error || 'خەلەتیەک چێبی';
        tryAgainText = 'دوبارە بکە';
    } else if (currentLanguage === 'tr') {
        errorMessage = 'Promptlar yüklenirken bir hata oluştu.';
        tryAgainText = 'Tekrar Dene';
    } else if (currentLanguage === 'ar') {
        errorMessage = 'حدث خطأ أثناء تحميل الأوامر.';
        tryAgainText = 'حاول مرة أخرى';
    } else if (currentLanguage === 'sorani') {
        errorMessage = 'هەڵەیەک ڕوویدا لە کاتی بارکردنی پڕۆمپتەکان.';
        tryAgainText = 'دووبارە هەوڵبدە';
    } else {
        errorMessage = 'An error occurred while loading prompts.';
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
    let message = '';
    
    if (currentLanguage === 'badini') {
        message = badiniTranslations.no_prompts;
    } else if (currentLanguage === 'tr') {
        message = 'Henüz prompt eklenmemiş.';
    } else if (currentLanguage === 'ar') {
        message = 'لم تتم إضافة أي أوامر بعد.';
    } else if (currentLanguage === 'sorani') {
        message = 'هیچ پڕۆمپتێک زیاد نەکراوە.';
    } else {
        message = 'No prompts added yet.';
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
        if (currentLanguage === 'badini') {
            copyButtonText = badiniTranslations.copy_button || 'کوپی بکە';
        } else if (currentLanguage === 'tr') {
            copyButtonText = 'Promptu Kopyala';
        } else if (currentLanguage === 'ar') {
            copyButtonText = 'نسخ الأمر';
        } else if (currentLanguage === 'sorani') {
            copyButtonText = 'پڕۆمپتەکە کۆپی بکە';
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
                    <span data-en="Copy Prompt" 
                          data-tr="Promptu Kopyala" 
                          data-ar="نسخ الأمر" 
                          data-sorani="پڕۆمپتەکە کۆپی بکە"
                          data-badini="${badiniTranslations.copy_button || 'کوپی بکە'}">
                        ${copyButtonText}
                    </span>
                </button>
            </div>
        `;
        
        // Resim yükleme hatası
        const img = card.querySelector('img');
        img.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800';
            console.log(`⚠️ Resim yüklenemedi: ${prompt.image}`);
        };
        
        container.appendChild(card);
    });
    
    // Kopyalama butonlarına tıklama ekle
    attachCopyListeners();
    // Dil güncellemesi
    updateCopyButtons();
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
                // Fallback
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
    
    // Metni güncelle
    const span = notification.querySelector('span');
    if (currentLanguage === 'badini') {
        span.textContent = badiniTranslations.copied || 'هاتە کوپیکرن';
    }
    
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

// Console bilgisi
console.log(`
✨ AI PROMPT GALLERY - Hazır!
📊 Sheets: ${SHEET_ID}
🌍 Diller: English, Kurdish Sorani, Kurdish Badini, Turkish, Arabic
🚀 Özellikler: Resimler tam boyutlu, 5 dil, kopyalama, Telegram bağlantısı
`);
