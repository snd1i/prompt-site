// Google Sheets API URL (JSON formatında)
const SHEET_ID = '1ycPsfDBTQOVgewcBizheXinnrqe4UV';
const SHEET_NAME = 'Sheet1'; // Google Sheets sayfa adı
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// Dil desteği - DİL SEÇİCİ İNGİLİZCE
const languages = {
    'en': 'English',
    'sorani': 'Kurdish Sorani',
    'badini': 'Kurdish Badini',
    'tr': 'Turkish',
    'ar': 'Arabic'
};

// Varsayılan dil İngilizce
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Badini çevirileri için obje
const badiniTranslations = {
    // Hata mesajları
    'loading': 'چافەرێبە',
    'load_error': 'خەلەتیەک چێبی هیفیە سەڤحێ جدید بکە',
    'no_prompts': 'هێشتا چ کود داخل نەکرنە',
    'copy_button': 'کوپی بکە',
    'copied': 'هاتە کوپیکرن',
    'telegram_title': 'کەنالێ مەیێ تلیگرامی',
    'telegram_desc': 'بو پرومپتێن جدید و تحدیسان جوین بکە',
    'change_language': 'زمانی بگهورە',
    'view_full': 'دیتنا هەمیێ',
    'scroll_more': 'بو دیتنا پتر کودێن وینا ببە خارێ',
    'click_copy': 'ژبو کوپیکرنێ تبلا خو لێبدە',
    'image_loading': 'چافەرێی رسمی بە',
    'gallery': 'گەلەری',
    'image_error': 'خەلەتیەک چێبی وێنە نەهات',
    'network_error': 'خەلەتی انترنێتا تە نە درستە',
    'try_again': 'دوبارە بکە',
    'language': 'زمان',
    'settings': 'سێتینگ',
    'close': 'بگرە',
    'back': 'پاشڤە زفرین'
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("Site yüklendi. Dil:", currentLanguage);
    initLanguageSelector();
    loadPrompts();
    updateLanguage();
    
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
    
    // Kopyala butonları (dinamik olarak güncellenecek)
    updateCopyButtons();
    
    // Badini dili için özel font
    if (currentLanguage === 'badini') {
        document.body.style.fontFamily = "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif";
        document.documentElement.lang = 'badini';
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
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span) {
            const text = span.getAttribute(`data-${currentLanguage}`);
            if (text) {
                span.textContent = text;
            } else if (currentLanguage === 'badini') {
                span.textContent = badiniTranslations.copy_button || 'کوپی بکە';
            }
        }
    });
}

// Google Sheets'ten verileri çek
async function loadPrompts() {
    try {
        console.log("Google Sheets'ten veri çekiliyor...");
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log("Google Sheets verisi alındı.");
        
        // Google Sheets JSON formatını işle
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        // Verileri işle ve promptları oluştur
        processSheetData(json.table);
        
    } catch (error) {
        console.error('Google Sheets verileri yüklenirken hata:', error);
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
    
    // Sütun başlıklarını al
    const cols = table.cols.map(col => col.label);
    console.log("Sütunlar:", cols);
    
    // Promptlar için verileri işle
    const prompts = [];
    
    table.rows.forEach((row, index) => {
        // İlk satır başlık olabilir, kontrol et
        if (index === 0) return;
        
        const prompt = {};
        row.c.forEach((cell, cellIndex) => {
            const colName = cols[cellIndex];
            if (colName && cell) {
                prompt[colName] = cell.v || cell.f || '';
            }
        });
        
        // Boş satırları atla
        if (Object.keys(prompt).length > 0 && prompt.image) {
            prompts.push(prompt);
        }
    });
    
    console.log(`${prompts.length} prompt bulundu.`);
    
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
    
    prompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        container.appendChild(card);
    });
    
    // Kopyalama butonlarına event listener ekle
    attachCopyListeners();
    // Dil değişince butonları güncelle
    updateCopyButtons();
}

// Prompt kartı oluştur
function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    // Resim URL'si - 'image' sütunundan
    const imageUrl = prompt.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    // Prompt metni - 'prompt' sütunundan (HER ZAMAN İNGİLİZCE)
    const promptText = prompt.prompt || prompt.Prompt || 'No prompt text available.';
    
    // Buton metni - diline göre
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
        <img src="${imageUrl}" alt="AI Generated Image" class="prompt-image" loading="lazy">
        <div class="prompt-content">
            <div class="prompt-text-container">
                <p class="prompt-text">${escapeHtml(promptText)}</p>
                <div class="fade-overlay"></div>
            </div>
            <button class="copy-btn" data-prompt="${escapeHtml(promptText)}">
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
        this.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        let altText = 'Image failed to load';
        if (currentLanguage === 'badini') {
            altText = badiniTranslations.image_error || 'وێنە نەهات';
        } else if (currentLanguage === 'tr') {
            altText = 'Resim yüklenemedi';
        } else if (currentLanguage === 'ar') {
            altText = 'فشل تحميل الصورة';
        } else if (currentLanguage === 'sorani') {
            altText = 'وێنە بار نەکرا';
        }
        this.alt = altText;
    };
    
    return card;
}

// Kopyalama butonlarına event listener ekle
function attachCopyListeners() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const promptText = this.getAttribute('data-prompt');
            copyToClipboard(promptText);
        });
    });
}

// Panoya kopyala
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyNotification();
    } catch (err) {
        // Fallback için eski yöntem
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    }
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

// HTML escape fonksiyonu (güvenlik için)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Google Sheets sütun yapısı hakkında bilgi
console.log(`
🚀 AI PROMPT GALLERY
📊 GOOGLE SHEETS YAPISI:
Sadece 2 sütun kullanın:
1. image: Resim URL'si (Unsplash, Imgur, vs.)
2. prompt: İngilizce prompt metni

🌍 DİL DESTEĞİ:
- Arayüz: 5 dil (English, Kurdish Sorani, Kurdish Badini, Turkish, Arabic)
- Promptlar: Sadece İngilizce (tüm dillerde İngilizce gösterilir)

✅ SİTENİZ HAZIR!
Google Sheets'inizi düzenleyin ve siteniz otomatik güncellenecek.
`);
