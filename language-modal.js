// BASİT DİL MODALI
console.log('🌍 Basit dil modalı yükleniyor...');

function checkAndShowModal() {
    // localStorage kontrol
    const languageSelected = localStorage.getItem('languageSelected');
    const selectedLanguage = localStorage.getItem('selectedLanguage');
    
    console.log('Kontrol:', { languageSelected, selectedLanguage });
    
    // Eğer dil seçilmemişse modal göster
    if (!languageSelected) {
        console.log('👋 İlk ziyaret, modal gösteriliyor...');
        showSimpleLanguageModal();
    } else if (selectedLanguage && typeof changeLanguage === 'function') {
        console.log('📖 Kayıtlı dil yükleniyor:', selectedLanguage);
        changeLanguage(selectedLanguage);
    }
}

function showSimpleLanguageModal() {
    console.log('🔄 Basit modal oluşturuluyor...');
    
    // Modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Modal içeriği
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <h2 style="color: #333; margin-bottom: 10px;">Select Language</h2>
        <p style="color: #666; margin-bottom: 30px;">Select your preferred language</p>
        
        <div style="display: grid; gap: 10px; margin-bottom: 30px;">
            <button onclick="selectLang('en')" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer;">
                🇬🇧 English
            </button>
            <button onclick="selectLang('tr')" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer;">
                🇹🇷 Türkçe
            </button>
            <button onclick="selectLang('ar')" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer;">
                🇮🇶 العربية
            </button>
            <button onclick="selectLang('badini')" style="padding: 15px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; cursor: pointer;">
                🇹🇯 Kurdish Badini
            </button>
        </div>
        
        <button onclick="saveLanguage()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; border-radius: 10px; font-size: 16px; cursor: pointer; width: 100%;">
            Continue
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Global fonksiyonlar
    window.selectLang = function(lang) {
        window.selectedLang = lang;
        console.log('Dil seçildi:', lang);
    };
    
    window.saveLanguage = function() {
        if (!window.selectedLang) {
            alert('Please select a language!');
            return;
        }
        
        console.log('Dil kaydediliyor:', window.selectedLang);
        localStorage.setItem('languageSelected', 'true');
        localStorage.setItem('selectedLanguage', window.selectedLang);
        
        // Mevcut changeLanguage fonksiyonunu çağır
        if (typeof changeLanguage === 'function') {
            changeLanguage(window.selectedLang);
        }
        
        // Modalı kaldır
        overlay.remove();
        console.log('✅ Modal kapatıldı, dil:', window.selectedLang);
    };
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM yüklendi, modal kontrol ediliyor...');
    setTimeout(checkAndShowModal, 1000);
});

console.log('✨ Basit dil modalı hazır!');
