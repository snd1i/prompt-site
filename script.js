// GOOGLE SHEETS API URL
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 AI Prompt Gallery - 5 Dil Desteğiyle");
console.log("📊 Sheets ID:", SHEET_ID);

// Dil desteği
const languages = {
    'en': 'English',
    'sorani': 'Kurdish Sorani',
    'badini': 'Kurdish Badini',
    'tr': 'Turkish',
    'ar': 'Arabic'
};

// Badini çevirileri
const badiniTranslations = {
    'loading': 'چافەرێبە',
    'load_error': 'خەلەتیەک چێبی هیفیە سەڤحێ جدید بکە',
    'no_prompts': 'هێشتا چ کود داخل نەکرنە',
    'copy_button': 'کوپی بکە',
    'copied': 'هاتە کوپیکرن',
    'telegram_title': 'کەنالێ مەیێ تلیگرامی',
    'telegram_desc': 'بو پرومپتێن جدید و تحدیسان جوین بکە',
    'copy_prompt': 'کوپی بکە',
    'try_again': 'دوبارە بکە',
    'join_channel': 'بو کەنالێ بڕۆ'
};

// Varsayılan dil
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi. Aktif dil:", currentLanguage);
    initLanguageSelector();
    loadPrompts();
    updateLanguage();
    setupImageProtection();
    
    // Dil seçiciyi güncelle
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

// Tüm sayfa içeriğini seçilen dile göre güncelle
function updateLanguage() {
    // Başlık ve alt başlık
    updateTextBySelector('.title', currentLanguage);
    updateTextBySelector('.subtitle', currentLanguage);
    
    // Yükleme mesajı
    updateTextBySelector('.loading-spinner p', currentLanguage);
    
    // Telegram bölümü
    updateTextBySelector('.telegram-info h3', currentLanguage);
    updateTextBySelector('.telegram-info p', currentLanguage);
    
    // Footer
    updateTextBySelector('.footer p', currentLanguage);
    
    // Kopyalama bildirimi
    updateTextBySelector('#copy-notification span', currentLanguage);
    
    // Kopyala butonları
    updateCopyButtons();
    
    // Badini dili için özel font
    if (currentLanguage === 'badini' || currentLanguage === 'ar' || currentLanguage === 'sorani') {
        document.body.style.fontFamily = "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif";
        document.documentElement.lang = currentLanguage;
    } else {
        document.body.style.fontFamily = "'Poppins', sans-serif";
        document.documentElement.lang = currentLanguage;
    }
}

// Belirli bir selector için metni güncelle
function updateTextBySelector(selector, lang) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
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

// Google Sheets'ten verileri çek
async function loadPrompts() {
    const container = document.getElementById('prompts-container');
    
    try {
        console.log("📥 Google Sheets'ten veri çekiliyor...");
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log("✅ Veri alındı");
        
        // Google Sheets JSON formatını işle
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        // Verileri işle ve promptları oluştur
        processSheetData(json.table);
        
    } catch (error) {
        console.error('❌ Google Sheets verileri yüklenirken hata:', error);
        showErrorMessage();
    }
}

// Hata mesajını göster
function showErrorMessage() {
    const container = document.getElementById('prompts-container');
    let errorMessage = '';
    let tryAgainText = 'Try Again';
    
    if (currentLanguage === 'badini') {
        errorMessage = badiniTranslations.load_error || 'خەلەتیەک چێبی';
        tryAgainText = badiniTranslations.try_again || 'دوبارە بکە';
    } else if (currentLanguage === 'tr') {
        errorMessage = 'Promptlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
        tryAgainText = 'Tekrar Dene';
    } else if (currentLanguage === 'ar') {
        errorMessage = 'حدث خطأ أثناء تحميل الأوامر. يرجى تحديث الصفحة.';
        tryAgainText = 'حاول مرة أخرى';
    } else if (currentLanguage === 'sorani') {
        errorMessage = 'هەڵەیەک ڕوویدا لە کاتی بارکردنی پڕۆمپتەکان. تکایە پەڕەکە نوێ بکەرەوە.';
        tryAgainText = 'دووبارە هەوڵبدە';
    } else {
        errorMessage = 'An error occurred while loading prompts. Please refresh the page.';
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

// Google Sheets verilerini işle
function processSheetData(table) {
    const container = document.getElementById('prompts-container');
    
    // Promptlar için verileri işle
    const prompts = [];
    
    // İlk satır başlık, onu atla
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
    
    console.log(`✅ ${prompts.length} prompt bulundu`);
    
    // Prompt kartlarını oluştur
    if (prompts.length > 0) {
        displayPrompts(prompts);
    } else {
        showNoPromptsMessage();
    }
}

// Prompt yok mesajını göster
function showNoPromptsMessage() {
    const container = document.getElementById('prompts-container');
    let message = '';
    
    if (currentLanguage === 'badini') {
        message = badiniTranslations.no_prompts || 'هێشتا چ کود داخل نەکرنە';
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

// Promptları ekranda göster
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach((prompt, index) => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        
        // Kopyala butonu metni
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
            <img src="${prompt.image}" alt="AI Generated Image" class="prompt-image" loading="lazy">
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
            this.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop';
            let altText = 'Image failed to load';
            if (currentLanguage === 'badini') {
                altText = 'وێنە نەهات';
            } else if (currentLanguage === 'tr') {
                altText = 'Resim yüklenemedi';
            } else if (currentLanguage === 'ar') {
                altText = 'فشل تحميل الصورة';
            } else if (currentLanguage === 'sorani') {
                altText = 'وێنە بار نەکرا';
            }
            this.alt = altText;
        };
        
        container.appendChild(card);
    });
    
    // Kopyalama butonlarına event listener ekle
    attachCopyListeners();
    // Dil değişince butonları güncelle
    updateCopyButtons();
}

// Kopyalama butonlarına event listener ekle
function attachCopyListeners() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
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

// Kopyalandı bildirimi göster
function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    
    // Bildirim metnini güncelle
    const span = notification.querySelector('span');
    if (currentLanguage === 'badini') {
        span.textContent = badiniTranslations.copied || 'هاتە کوپیکرن';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// HTML escape fonksiyonu
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// RESİM KORUMA SİSTEMİ
function setupImageProtection() {
    console.log("🛡️ Resim koruma sistemi aktif...");
    
    // Event listener'lar
    document.addEventListener('contextmenu', function(e) {
        if (e.target.classList.contains('prompt-image')) {
            e.preventDefault();
            
            let message = '⛔ Images are protected!';
            if (currentLanguage === 'badini') {
                message = '⛔ وێنەکان پارێزراون!';
            } else if (currentLanguage === 'tr') {
                message = '⛔ Resimler korunuyor!';
            } else if (currentLanguage === 'ar') {
                message = '⛔ الصور محمية!';
            } else if (currentLanguage === 'sorani') {
                message = '⛔ وێنهکان پارێزراون!';
            }
            
            showProtectionMessage(message);
            return false;
        }
    });
    
    document.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('prompt-image')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Resimlere attribute ekle
    setTimeout(() => {
        document.querySelectorAll('.prompt-image').forEach(img => {
            img.setAttribute('draggable', 'false');
        });
    }, 1000);
}

// Koruma mesajı göster
function showProtectionMessage(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 2000);
}

console.log("✨ Script hazır! 5 dil desteği aktif");
console.log("🌍 Aktif dil: " + currentLanguage);
