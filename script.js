// Google Sheets API URL (JSON formatında)
const SHEET_ID = '1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY';
const SHEET_NAME = 'Sheet1'; // Google Sheets sayfa adı
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// Dil desteği
const languages = {
    'tr': 'Türkçe',
    'en': 'English',
    'ar': 'العربية',
    'sorani': 'Kürtçe Sorani',
    'badini': 'Kürtçe Badini'
};

// Varsayılan dil
let currentLanguage = localStorage.getItem('selectedLanguage') || 'tr';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Badini notları (Badini dili için özel işlem)
    if (currentLanguage === 'badini') {
        document.querySelectorAll('.badini-note').forEach(note => {
            note.textContent = 'Buraya Badini kelime girilecek';
        });
    }
}

// Belirli bir selector için metni güncelle
function updateTextBySelector(selector, lang) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text && text !== 'Buraya Badini kelime girilecek') {
            element.textContent = text;
        }
    });
}

// Google Sheets'ten verileri çek
async function loadPrompts() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Google Sheets JSON formatını işle
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        // Verileri işle ve promptları oluştur
        processSheetData(json.table);
        
    } catch (error) {
        console.error('Google Sheets verileri yüklenirken hata:', error);
        document.getElementById('prompts-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p data-tr="Promptlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin." 
                   data-en="An error occurred while loading prompts. Please refresh the page."
                   data-ar="حدث خطأ أثناء تحميل الأوامر. يرجى تحديث الصفحة."
                   data-sorani="هەڵەیەک ڕوویدا لە کاتی بارکردنی پڕۆمپتەکان. تکایە پەڕەکە نوێ بکەرەوە."
                   data-badini="Buraya Badini kelime girilecek">
                    Promptlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
                </p>
            </div>
        `;
        updateLanguage();
    }
}

// Google Sheets verilerini işle
function processSheetData(table) {
    const container = document.getElementById('prompts-container');
    
    // Sütun başlıklarını al
    const cols = table.cols.map(col => col.label);
    
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
        if (Object.keys(prompt).length > 0) {
            prompts.push(prompt);
        }
    });
    
    // Prompt kartlarını oluştur
    if (prompts.length > 0) {
        displayPrompts(prompts);
    } else {
        container.innerHTML = `
            <div class="no-prompts">
                <i class="fas fa-image"></i>
                <p data-tr="Henüz prompt eklenmemiş." 
                   data-en="No prompts added yet."
                   data-ar="لم تتم إضافة أي أوامر بعد."
                   data-sorani="هیچ پڕۆمپتێک زیاد نەکراوە."
                   data-badini="Buraya Badini kelime girilecek">
                    Henüz prompt eklenmemiş.
                </p>
            </div>
        `;
        updateLanguage();
    }
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
}

// Prompt kartı oluştur
function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    // Resim URL'si (image sütunu) - eğer yoksa varsayılan resim
    const imageUrl = prompt.image || prompt.resim || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    // Prompt metni (prompt sütunu) - farklı dil sütunlarını kontrol et
    let promptText = '';
    
    if (currentLanguage === 'tr' && prompt.prompt_tr) {
        promptText = prompt.prompt_tr;
    } else if (currentLanguage === 'en' && prompt.prompt_en) {
        promptText = prompt.prompt_en;
    } else if (currentLanguage === 'ar' && prompt.prompt_ar) {
        promptText = prompt.prompt_ar;
    } else if (currentLanguage === 'sorani' && prompt.prompt_sorani) {
        promptText = prompt.prompt_sorani;
    } else if (currentLanguage === 'badini') {
        promptText = 'Buraya Badini kelime girilecek';
    } else {
        // Varsayılan olarak ilk sütunu kullan
        promptText = prompt.prompt || prompt.prompt_tr || prompt.prompt_en || 
                     prompt.Prompt || 'Prompt metni bulunamadı.';
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="AI Generated Image" class="prompt-image">
        <div class="prompt-content">
            <div class="prompt-text-container">
                <p class="prompt-text">${escapeHtml(promptText)}</p>
                <div class="fade-overlay"></div>
            </div>
            <button class="copy-btn" data-prompt="${escapeHtml(promptText)}">
                <i class="far fa-copy"></i>
                <span data-tr="Promptu Kopyala" 
                      data-en="Copy Prompt" 
                      data-ar="نسخ الأمر" 
                      data-sorani="پڕۆمپتەکە کۆپی بکە"
                      data-badini="Buraya Badini kelime girilecek">
                    Promptu Kopyala
                </span>
            </button>
        </div>
    `;
    
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
    notification.classList.add('show');
    
    // Bildirimi güncelle (dil desteği için)
    updateTextBySelector('#copy-notification span', currentLanguage);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// HTML escape fonksiyonu (güvenlik için)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Google Sheets sütun yapısı hakkında bilgi
console.log(`
📊 GOOGLE SHEETS SÜTUN YAPISI:

Google Sheets'te aşağıdaki sütunları kullanmanız önerilir:

1. image: Resim URL'si (Unsplash, Imgur vb.)
2. prompt_tr: Türkçe prompt metni
3. prompt_en: İngilizce prompt metni  
4. prompt_ar: Arapça prompt metni
5. prompt_sorani: Kürtçe Sorani prompt metni
6. prompt_badini: Kürtçe Badini prompt metni (Boş bırakabilirsiniz)

NOT: Sütun adları farklı olabilir, script otomatik olarak uyum sağlayacaktır.
`);
