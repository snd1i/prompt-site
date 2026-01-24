// language-modal.js - FULLSCREEN DİL SEÇİM MODALI

console.log('🌍 Dil seçim modalı yükleniyor...');

// Badini çevirileri
const badiniTranslations = {
    'select_language': 'زمانەکێ هەلبژێرە',
    'select_your_preferred': 'زمانێ خو هەلبژێرە',
    'continue': 'بەردەوام بون',
    'language_set_to': 'زمان هاتە گهورین بو'
};

// Dil verileri
const languages = [
    {
        code: 'en',
        flag: '🇬🇧',
        name: 'English',
        native: 'English',
        dir: 'ltr',
        badiniName: 'ئینگلیزی'
    },
    {
        code: 'tr',
        flag: '🇹🇷',
        name: 'Turkish',
        native: 'Türkçe',
        dir: 'ltr',
        badiniName: 'تورکی'
    },
    {
        code: 'ar',
        flag: '🇮🇶',
        name: 'Arabic',
        native: 'العربية',
        dir: 'rtl',
        badiniName: 'عەرەبی'
    },
    {
        code: 'sorani',
        flag: '🇹🇯',
        name: 'Kurdish Sorani',
        native: 'کوردی سۆرانی',
        dir: 'rtl',
        badiniName: 'کوردی سۆرانی'
    },
    {
        code: 'badini',
        flag: '🇹🇯',
        name: 'Kurdish Badini',
        native: 'کوردی بەدینی',
        dir: 'rtl',
        badiniName: 'کوردی بەدینی'
    }
];

// Seçilen dil
let selectedLanguage = null;

// Modal oluştur
function createLanguageModal() {
    console.log('🔄 Dil seçim modalı oluşturuluyor...');
    
    // Modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'language-modal-overlay';
    overlay.id = 'language-modal-overlay';
    
    // Modal içeriği
    const modal = document.createElement('div');
    modal.className = 'language-modal';
    
    // Başlık
    const title = document.createElement('h1');
    title.className = 'language-modal-title';
    title.textContent = 'Select Language';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'language-modal-subtitle';
    subtitle.textContent = 'Select your preferred language';
    
    // Dil seçenekleri grid
    const grid = document.createElement('div');
    grid.className = 'language-options-grid';
    
    // Her dil için buton oluştur
    languages.forEach(lang => {
        const button = document.createElement('div');
        button.className = 'language-option-btn';
        button.dataset.lang = lang.code;
        
        button.innerHTML = `
            <div class="language-flag">${lang.flag}</div>
            <div class="language-name">${lang.name}</div>
            <div class="language-native">${lang.native}</div>
        `;
        
        // Tıklama event'i
        button.addEventListener('click', () => selectLanguage(lang.code));
        
        grid.appendChild(button);
    });
    
    // Devam butonu
    const continueBtn = document.createElement('button');
    continueBtn.className = 'language-continue-btn';
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = true;
    
    // Devam butonu event'i
    continueBtn.addEventListener('click', () => saveLanguageAndClose());
    
    // Modal içine ekle
    modal.appendChild(title);
    modal.appendChild(subtitle);
    modal.appendChild(grid);
    modal.appendChild(continueBtn);
    
    // Overlay içine ekle
    overlay.appendChild(modal);
    
    // Body'e ekle
    document.body.appendChild(overlay);
    
    console.log('✅ Dil seçim modalı oluşturuldu');
    
    // Badini dili seçilirse buton metnini Badini yap
    updateUIForBadini();
    
    // Otomatik dil önerisi
    suggestLanguage();
}

// Dil seç
function selectLanguage(langCode) {
    console.log(`🎯 Dil seçildi: ${langCode}`);
    
    // Tüm butonlardan selected class'ını kaldır
    document.querySelectorAll('.language-option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Seçilen butona selected class'ını ekle
    const selectedBtn = document.querySelector(`[data-lang="${langCode}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // Seçilen dili kaydet
    selectedLanguage = langCode;
    
    // Devam butonunu aktif et
    const continueBtn = document.querySelector('.language-continue-btn');
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    
    // Badini seçilirse buton metnini Badini yap
    if (langCode === 'badini') {
        continueBtn.textContent = badiniTranslations.continue;
    } else {
        continueBtn.textContent = 'Continue';
    }
}

// Badini dili için UI güncelle
function updateUIForBadini() {
    // Badini butonunu bul
    const badiniBtn = document.querySelector('[data-lang="badini"]');
    if (badiniBtn) {
        const nativeText = badiniBtn.querySelector('.language-native');
        if (nativeText) {
            nativeText.textContent = 'کوردی بەدینی';
        }
    }
}

// Tarayıcı dilini öner
function suggestLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log(`🌐 Tarayıcı dili: ${browserLang}`);
    
    let suggestedLang = 'en'; // Varsayılan
    
    if (browserLang.includes('tr')) {
        suggestedLang = 'tr';
    } else if (browserLang.includes('ar')) {
        suggestedLang = 'ar';
    } else if (browserLang.includes('ku')) {
        suggestedLang = 'badini'; // Badini öner
    }
    
    // Önerilen dili seç
    setTimeout(() => {
        selectLanguage(suggestedLang);
        console.log(`💡 Önerilen dil: ${suggestedLang}`);
    }, 300);
}

// Dili kaydet ve modalı kapat
function saveLanguageAndClose() {
    if (!selectedLanguage) {
        console.log('⚠️ Lütfen bir dil seçin');
        return;
    }
    
    console.log(`💾 Dil kaydediliyor: ${selectedLanguage}`);
    
    // LocalStorage'a kaydet
    localStorage.setItem('selectedLanguage', selectedLanguage);
    localStorage.setItem('languageSelected', 'true');
    
    // Mevcut dil değiştirme fonksiyonunu çağır
    if (typeof changeLanguage === 'function') {
        changeLanguage(selectedLanguage);
    }
    
    // Modalı kapat
    closeLanguageModal();
    
    // Kullanıcıya bildirim
    showLanguageSetNotification(selectedLanguage);
}

// Modalı kapat
function closeLanguageModal() {
    const overlay = document.getElementById('language-modal-overlay');
    if (overlay) {
        // Animasyonla kapat
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                console.log('❌ Dil seçim modalı kapatıldı');
            }
        }, 300);
    }
}

// Dil ayarlandı bildirimi
function showLanguageSetNotification(langCode) {
    const lang = languages.find(l => l.code === langCode);
    if (!lang) return;
    
    let message = '';
    let langName = '';
    
    if (langCode === 'badini') {
        // Badini dilinde bildirim
        message = `${badiniTranslations.language_set_to} ${lang.badiniName}`;
        langName = lang.badiniName;
    } else {
        // Diğer dillerde İngilizce bildirim
        message = `Language set to ${lang.name}`;
        langName = lang.name;
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-family: 'Poppins', sans-serif;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    
    // Badini dili için font ayarla
    if (langCode === 'badini' || langCode === 'sorani' || langCode === 'ar') {
        notification.style.fontFamily = "'Noto Sans Arabic', sans-serif";
        notification.style.textAlign = 'right';
        notification.style.direction = 'rtl';
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
    
    console.log(`📢 Bildirim: ${message}`);
}

// İlk açılışta kontrol et
function checkFirstVisit() {
    console.log('🔍 İlk ziyaret kontrol ediliyor...');
    
    const languageSelected = localStorage.getItem('languageSelected');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    if (!languageSelected) {
        // İlk kez geliyor - modal göster
        console.log('👋 İlk ziyaret, dil seçim modalı gösteriliyor');
        setTimeout(createLanguageModal, 500); // Sayfa yüklendikten sonra
    } else if (savedLanguage && typeof changeLanguage === 'function') {
        // Daha önce dil seçmiş - o dili yükle
        console.log(`📖 Kayıtlı dil yükleniyor: ${savedLanguage}`);
        setTimeout(() => {
            changeLanguage(savedLanguage);
        }, 1000);
    } else {
        // Varsayılan dil
        console.log('🌐 Varsayılan dil: English');
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkFirstVisit, 100);
});

// Mevcut dil değiştirme fonksiyonunu yakala
if (typeof changeLanguage === 'function') {
    const originalChangeLanguage = changeLanguage;
    window.changeLanguage = function(lang) {
        originalChangeLanguage(lang);
        // Dil değişince localStorage'ı güncelle
        localStorage.setItem('selectedLanguage', lang);
    };
}

console.log('✨ Dil seçim sistemi hazır!');
