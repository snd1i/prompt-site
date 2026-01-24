// language-modal.js - TAM VERSİYON DİL SEÇİM MODALI

console.log('🌍 Dil seçim modalı yükleniyor...');

// Dil verileri - SORANİ EKLENDİ
const languages = [
    {
        code: 'en',
        flag: '🇬🇧',
        name: 'English',
        native: 'English',
        dir: 'ltr'
    },
    {
        code: 'tr',
        flag: '🇹🇷',
        name: 'Turkish',
        native: 'Türkçe',
        dir: 'ltr'
    },
    {
        code: 'ar',
        flag: '🇮🇶',
        name: 'Arabic',
        native: 'العربية',
        dir: 'rtl'
    },
    {
        code: 'sorani',  // SORANİ EKLENDİ
        flag: '🇹🇯',
        name: 'Kurdish Sorani',
        native: 'کوردی سۆرانی',
        dir: 'rtl'
    },
    {
        code: 'badini',
        flag: '🇹🇯',
        name: 'Kurdish Badini',
        native: 'کوردی بەدینی',
        dir: 'rtl'
    }
];

// Badini çevirileri
const badiniTranslations = {
    'select_language': 'زمانەکێ هەلبژێرە',
    'select_your_preferred': 'زمانێ خو هەلبژێرە',
    'continue': 'بەردەوام بون',
    'language_set_to': 'زمان هاتە گهورین بو'
};

let selectedLanguage = null;

// Modal oluştur - GÜZELLEŞTİRİLMİŞ
function createLanguageModal() {
    console.log('🎨 Profesyonel dil modalı oluşturuluyor...');
    
    // Mevcut modal varsa kaldır
    const existingModal = document.getElementById('language-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'language-modal-overlay';
    overlay.className = 'language-modal-overlay';
    
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
    
    // Her dil için buton oluştur - TÜM DİLLER
    languages.forEach(lang => {
        const button = document.createElement('button');
        button.className = 'language-option-btn';
        button.dataset.lang = lang.code;
        button.type = 'button';
        
        button.innerHTML = `
            <div class="language-flag">${lang.flag}</div>
            <div class="language-name">${lang.name}</div>
            <div class="language-native">${lang.native}</div>
        `;
        
        button.addEventListener('click', () => selectLanguage(lang.code));
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            selectLanguage(lang.code);
        });
        
        grid.appendChild(button);
    });
    
    // Devam butonu
    const continueBtn = document.createElement('button');
    continueBtn.className = 'language-continue-btn';
    continueBtn.id = 'language-continue-btn';
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = true;
    continueBtn.type = 'button';
    
    continueBtn.addEventListener('click', saveLanguageAndClose);
    continueBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        saveLanguageAndClose();
    });
    
    // Modal içine ekle
    modal.appendChild(title);
    modal.appendChild(subtitle);
    modal.appendChild(grid);
    modal.appendChild(continueBtn);
    
    // Overlay içine ekle
    overlay.appendChild(modal);
    
    // Body'e ekle (en üste)
    document.body.insertBefore(overlay, document.body.firstChild);
    
    console.log('✅ Profesyonel dil modalı oluşturuldu');
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
    const continueBtn = document.getElementById('language-continue-btn');
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.style.opacity = '1';
        
        // Badini seçilirse buton metnini Badini yap
        if (langCode === 'badini') {
            continueBtn.textContent = badiniTranslations.continue || 'Continue';
        } else {
            continueBtn.textContent = 'Continue';
        }
    }
}

// Dili kaydet ve modalı kapat
function saveLanguageAndClose() {
    if (!selectedLanguage) {
        console.log('⚠️ Lütfen bir dil seçin');
        return;
    }
    
    console.log(`💾 Dil kaydediliyor: ${selectedLanguage}`);
    
    // LocalStorage'a kaydet
    localStorage.setItem('languageSelected', 'true');
    localStorage.setItem('selectedLanguage', selectedLanguage);
    
    // Modalı kapat
    closeLanguageModal();
    
    // Mevcut dil değiştirme fonksiyonunu çağır
    setTimeout(() => {
        if (typeof changeLanguage === 'function') {
            changeLanguage(selectedLanguage);
        } else {
            console.log('⚠️ changeLanguage fonksiyonu bulunamadı, sayfa yenileniyor...');
            location.reload();
        }
    }, 300);
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

// İlk açılışta kontrol et
function checkFirstVisit() {
    console.log('🔍 İlk ziyaret kontrol ediliyor...');
    
    const languageSelected = localStorage.getItem('languageSelected');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    console.log('LocalStorage:', { languageSelected, savedLanguage });
    
    if (!languageSelected || languageSelected === 'false' || languageSelected === 'null') {
        // İlk kez geliyor - modal göster
        console.log('👋 İlk ziyaret veya dil seçilmemiş, modal gösteriliyor');
        setTimeout(() => {
            createLanguageModal();
        }, 1000);
    } else if (savedLanguage) {
        // Daha önce dil seçmiş - o dili yükle
        console.log(`📖 Kayıtlı dil yükleniyor: ${savedLanguage}`);
        setTimeout(() => {
            if (typeof changeLanguage === 'function') {
                changeLanguage(savedLanguage);
            }
        }, 500);
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM yüklendi');
    setTimeout(checkFirstVisit, 500);
});

// Mevcut dil değiştirme fonksiyonunu yakala
if (typeof changeLanguage === 'function') {
    const originalChangeLanguage = changeLanguage;
    window.changeLanguage = function(lang) {
        console.log(`🌐 Dil değiştiriliyor (modal): ${lang}`);
        originalChangeLanguage(lang);
        // Dil değişince localStorage'ı güncelle
        localStorage.setItem('selectedLanguage', lang);
    };
}

console.log('✨ Dil seçim sistemi hazır! Tüm diller mevcut.');
