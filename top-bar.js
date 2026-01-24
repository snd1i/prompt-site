// top-bar.js - ÜST BAR OLUŞTURMA (MEVCUT KODLARA DOKUNMAZ)

// Üst bar oluşturma fonksiyonu
function createTopBar() {
    console.log('🔼 Üst bar oluşturuluyor...');
    
    // Mevcut header'ı gizle
    const header = document.querySelector('.header');
    if (header) {
        header.style.display = 'none';
    }
    
    // Mevcut telegram section'ı gizle
    const telegramSection = document.querySelector('.telegram-section');
    if (telegramSection) {
        telegramSection.style.display = 'none';
    }
    
    // Üst bar konteyneri oluştur
    const topBar = document.createElement('div');
    topBar.className = 'top-bar-container';
    
    // Sol taraf: Logo ve başlık
    const leftSection = document.createElement('div');
    leftSection.className = 'top-bar-left';
    
    const logoLink = document.createElement('a');
    logoLink.href = '#';
    logoLink.className = 'logo-container';
    logoLink.onclick = function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    logoLink.innerHTML = `
        <div class="logo-icon">
            <i class="fas fa-robot"></i>
        </div>
        <div>
            <h1 class="site-title">AI Prompt Gallery</h1>
            <p class="site-subtitle">Image generation prompts</p>
        </div>
    `;
    
    leftSection.appendChild(logoLink);
    
    // Orta: Telegram bağlantıları
    const centerSection = document.createElement('div');
    centerSection.className = 'top-bar-center';
    centerSection.innerHTML = `
        <a href="https://t.me/sndiyi" target="_blank" class="telegram-mini">
            <i class="fab fa-telegram telegram-icon-mini"></i>
            <span class="telegram-text">@sndiyi</span>
        </a>
        <a href="https://t.me/k4miran_sndi" target="_blank" class="user-mini">
            <i class="fas fa-user user-icon-mini"></i>
            <span class="user-text">@k4miran_sndi</span>
        </a>
    `;
    
    // Sağ taraf: Dil seçiciyi taşı
    const rightSection = document.createElement('div');
    rightSection.className = 'top-bar-right';
    
    // Mevcut dil seçiciyi al
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
        // Dil seçiciyi orijinal yerinden kaldır
        languageSelector.parentNode.removeChild(languageSelector);
        rightSection.appendChild(languageSelector);
    } else {
        // Dil seçici yoksa yenisini oluştur
        const fallbackLanguage = document.createElement('div');
        fallbackLanguage.className = 'language-selector';
        fallbackLanguage.innerHTML = `
            <div class="language-dropdown">
                <button class="language-btn">
                    <i class="fas fa-globe"></i>
                    <span>English</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
        `;
        rightSection.appendChild(fallbackLanguage);
    }
    
    // Tüm bölümleri birleştir
    topBar.appendChild(leftSection);
    topBar.appendChild(centerSection);
    topBar.appendChild(rightSection);
    
    // Body'nin en başına ekle
    document.body.insertBefore(topBar, document.body.firstChild);
    
    console.log('✅ Üst bar oluşturuldu!');
    
    // Dil desteğini kur
    setupTopBarLanguageSupport();
    
    return topBar;
}

// Dil desteği için
function setupTopBarLanguageSupport() {
    // Dil değişimini dinle
    const originalChangeLanguage = window.changeLanguage;
    if (originalChangeLanguage) {
        window.changeLanguage = function(lang) {
            originalChangeLanguage(lang);
            updateTopBarText(lang);
        };
    }
    
    // Başlangıçta güncelle
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    updateTopBarText(currentLang);
}

// Üst bar metinlerini güncelle
function updateTopBarText(lang) {
    const title = document.querySelector('.site-title');
    const subtitle = document.querySelector('.site-subtitle');
    
    if (!title || !subtitle) return;
    
    const translations = {
        'en': {
            title: 'AI Prompt Gallery',
            subtitle: 'Image generation prompts'
        },
        'tr': {
            title: 'AI Prompt Galerisi',
            subtitle: 'Resim oluşturma promptları'
        },
        'ar': {
            title: 'معرض أوامر الذكاء الاصطناعي',
            subtitle: 'أوامر إنشاء الصور'
        },
        'sorani': {
            title: 'پڕۆمپتی گالێری ئەی آی',
            subtitle: 'پڕۆمپتی دروستکردنی وێنه'
        },
        'badini': {
            title: 'جهێ بدەستفە ینانا کودێن وێنا',
            subtitle: 'کودێن دروستکرنا وێنێ'
        }
    };
    
    const text = translations[lang] || translations['en'];
    
    title.textContent = text.title;
    subtitle.textContent = text.subtitle;
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(createTopBar, 100);
});

console.log('✨ Top bar script yüklendi!');
