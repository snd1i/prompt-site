// frame-script.js - RESİM ÇERÇEVELERİ (MEVCUT KODLARA DOKUNMAZ)

// Çerçeve stilleri
const FRAME_STYLES = [
    'professional-frame',  // Profesyonel gölge
    'modern-frame',       // Modern gradient
    'elegant-frame',      // Elegant border
    'gold-frame',         // Gold frame
    'silver-frame',       // Silver frame
    'glass-frame',        // Glass effect
    'neon-frame',         // Neon glow
    'polaroid-frame',     // Polaroid style
    'vintage-frame',      // Vintage look
    'minimal-frame'       // Minimal border
];

// Varsayılan çerçeve (istediğinizi değiştirin)
const DEFAULT_FRAME = 'professional-frame';

// Çerçeve uygulama fonksiyonu
function applyFramesToImages() {
    console.log('🖼️ Resim çerçeveleri uygulanıyor...');
    
    // Tüm prompt resimlerini bul
    const images = document.querySelectorAll('.prompt-image');
    
    if (images.length === 0) {
        console.log('⏳ Henüz resim yüklenmemiş, bekleniyor...');
        setTimeout(applyFramesToImages, 1000);
        return;
    }
    
    images.forEach((img, index) => {
        // Resmin etrafına konteyner ekle
        const container = document.createElement('div');
        container.className = `image-frame-container ${DEFAULT_FRAME}`;
        
        // Resmi konteynere taşı
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        
        console.log(`✅ Resim ${index + 1} çerçevelendi: ${DEFAULT_FRAME}`);
    });
    
    console.log(`🎉 ${images.length} resim çerçevelendi!`);
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    // İlk çalıştırma
    setTimeout(applyFramesToImages, 2000);
    
    // Google Sheets verisi yüklendikten sonra tekrar çalıştır
    const originalLoadPrompts = loadPrompts;
    window.loadPrompts = function() {
        originalLoadPrompts();
        setTimeout(applyFramesToImages, 3000);
    };
    
    // DisplayPrompts fonksiyonunu izle
    const originalDisplayPrompts = displayPrompts;
    window.displayPrompts = function(prompts) {
        originalDisplayPrompts(prompts);
        setTimeout(applyFramesToImages, 1000);
    };
});

// Manuel olarak çerçeve değiştirme fonksiyonu (isteğe bağlı)
function changeFrameStyle(styleName) {
    const containers = document.querySelectorAll('.image-frame-container');
    
    containers.forEach(container => {
        // Eski çerçeve sınıflarını kaldır
        FRAME_STYLES.forEach(frameStyle => {
            container.classList.remove(frameStyle);
        });
        
        // Yeni çerçeve sınıfını ekle
        container.classList.add(styleName);
    });
    
    console.log(`🔄 Çerçeve stili değiştirildi: ${styleName}`);
}

// Çerçeve seçici oluştur (isteğe bağlı - admin panel gibi)
function createFrameSelector() {
    const selector = document.createElement('div');
    selector.id = 'frame-selector';
    selector.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        padding: 10px;
        border-radius: 10px;
        z-index: 9999;
        display: none;
    `;
    
    FRAME_STYLES.forEach(style => {
        const btn = document.createElement('button');
        btn.textContent = style.replace('-frame', '');
        btn.style.cssText = `
            display: block;
            margin: 5px 0;
            padding: 5px 10px;
            background: #333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        btn.onclick = () => changeFrameStyle(style);
        selector.appendChild(btn);
    });
    
    document.body.appendChild(selector);
}

// Konsoldan çerçeve değiştirmek için
window.changeFrame = changeFrameStyle;

console.log('✨ Frame script yüklendi!');
console.log('🖼️ Kullanılabilir çerçeveler:', FRAME_STYLES);
console.log('🔧 Konsoldan değiştirmek için: changeFrame("frame-adi")');
