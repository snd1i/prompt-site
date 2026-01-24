// image-protection.js - SADECE URL GİZLEME (MEVCUT KODLARA DOKUNMAZ)

console.log('🔒 URL gizleme sistemi yükleniyor...');

// URL gizleme fonksiyonu
function hideImageURLs() {
    console.log('🖼️ Resim URL\'leri gizleniyor...');
    
    // Tüm resimleri seç
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Sadece URL gizleme için özel işlem
        protectImageURL(img);
    });
    
    console.log(`✅ ${images.length} resim URL'si gizlendi`);
}

// Tek bir resmin URL'sini gizle
function protectImageURL(img) {
    // Eğer zaten korunmuşsa atla
    if (img.getAttribute('data-url-protected')) return;
    
    // İşaretle
    img.setAttribute('data-url-protected', 'true');
    
    // Resmin orijinal URL'sini sakla
    const originalSrc = img.src;
    
    // Resme tıklandığında normal davranış (hiçbir şey yapma)
    img.addEventListener('click', function(e) {
        // Normal tıklamaya izin ver
        return true;
    });
    
    // Resme basılı tutulduğunda URL'yi gizle
    let longPressTimer;
    
    img.addEventListener('mousedown', function(e) {
        // Sadece sol tık için
        if (e.button === 0) {
            longPressTimer = setTimeout(() => {
                // Basılı tutulunca resmin src'sini geçici olarak değiştir
                this.dataset.originalSrc = this.src;
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMmEiLz48L3N2Zz4=';
            }, 100); // Çok hızlı çalışsın
        }
    });
    
    img.addEventListener('mouseup', function(e) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // Orijinal resmi geri yükle
        if (this.dataset.originalSrc) {
            this.src = this.dataset.originalSrc;
            delete this.dataset.originalSrc;
        }
    });
    
    img.addEventListener('mouseleave', function(e) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // Orijinal resmi geri yükle
        if (this.dataset.originalSrc) {
            this.src = this.dataset.originalSrc;
            delete this.dataset.originalSrc;
        }
    });
    
    // Touch events için (mobil)
    img.addEventListener('touchstart', function(e) {
        longPressTimer = setTimeout(() => {
            // Basılı tutulunca resmin src'sini geçici olarak değiştir
            this.dataset.originalSrc = this.src;
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMmEiLz48L3N2Zz4=';
        }, 100);
    });
    
    img.addEventListener('touchend', function(e) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // Orijinal resmi geri yükle
        if (this.dataset.originalSrc) {
            this.src = this.dataset.originalSrc;
            delete this.dataset.originalSrc;
        }
    });
    
    img.addEventListener('touchcancel', function(e) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        // Orijinal resmi geri yükle
        if (this.dataset.originalSrc) {
            this.src = this.dataset.originalSrc;
            delete this.dataset.originalSrc;
        }
    });
    
    // Sağ tık menüsünü ENGELLEME (sadece URL gizleme için)
    img.addEventListener('contextmenu', function(e) {
        // Sağ tık yapıldığında resmi geçici olarak değiştir
        this.dataset.originalSrc = this.src;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMmEiLz48L3N2Zz4=';
        
        // 500ms sonra geri yükle
        setTimeout(() => {
            if (this.dataset.originalSrc) {
                this.src = this.dataset.originalSrc;
                delete this.dataset.originalSrc;
            }
        }, 500);
        
        e.preventDefault();
        return false;
    });
    
    // Sürükleme işlemini engelle (URL gözükmesin)
    img.addEventListener('dragstart', function(e) {
        // Sürüklenen veriyi boş olarak ayarla
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.setData('text/html', '');
        e.dataTransfer.setData('text/uri-list', '');
        
        // Görsel feedback için resmi geçici değiştir
        this.dataset.originalSrc = this.src;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYTFhMmEiLz48L3N2Zz4=';
        
        // Sürükleme bittiğinde geri yükle
        setTimeout(() => {
            if (this.dataset.originalSrc) {
                this.src = this.dataset.originalSrc;
                delete this.dataset.originalSrc;
            }
        }, 100);
        
        return false;
    });
}

// Yeni resimleri izle
function setupImageObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'IMG') {
                            protectImageURL(node);
                        } else if (node.querySelectorAll) {
                            const images = node.querySelectorAll('img');
                            images.forEach(protectImageURL);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('👁️ Resim gözlemcisi aktif');
}

// Başlangıç fonksiyonu
function initializeURLProtection() {
    console.log('🚀 URL gizleme sistemi başlatılıyor...');
    
    // Mevcut resimleri koru
    hideImageURLs();
    
    // Yeni resimleri izle
    setupImageObserver();
    
    console.log('✅ URL gizleme sistemi aktif!');
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeURLProtection, 1000);
});

// Google Sheets'ten resimler yüklendiğinde de koruma uygula
if (typeof displayPrompts === 'function') {
    const originalDisplayPrompts = displayPrompts;
    window.displayPrompts = function(prompts) {
        originalDisplayPrompts(prompts);
        setTimeout(initializeURLProtection, 500);
    };
}

console.log('🔒 URL gizleme scripti hazır!');
