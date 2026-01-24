// image-protection.js - RESİM KORUMA SİSTEMİ (MEVCUT KODLARA DOKUNMAZ)

console.log('🛡️ Resim koruma sistemi yükleniyor...');

// Tüm resimleri koruma altına al
function protectAllImages() {
    console.log('🔒 Resimler koruma altına alınıyor...');
    
    // Tüm resimleri seç
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Resim özelliklerini ayarla
        img.setAttribute('draggable', 'false');
        img.style.userSelect = 'none';
        img.style.webkitUserDrag = 'none';
        img.style.khtmlUserDrag = 'none';
        img.style.mozUserDrag = 'none';
        img.style.msUserDrag = 'none';
        
        // Context menu (sağ tık) engelle
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showProtectionMessage('⛔ Resimler koruma altındadır!');
            return false;
        });
        
        // Drag start engelle
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Select start engelle
        img.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Copy engelle
        img.addEventListener('copy', function(e) {
            e.preventDefault();
            showProtectionMessage('⛔ Kopyalama engellendi!');
            return false;
        });
        
        // Mouse ile resim URL'sini görmeyi engelle
        img.addEventListener('mousedown', function(e) {
            if (e.button === 0) { // Sol tık
                // Normal tıklamaya izin ver, sadece uzun basmayı engelle
                this._clickTimer = setTimeout(() => {
                    showProtectionMessage('⛔ Resim koruma altındadır!');
                }, 800); // 800ms'den uzun basılı tutunca uyarı göster
            }
        });
        
        img.addEventListener('mouseup', function(e) {
            if (this._clickTimer) {
                clearTimeout(this._clickTimer);
                this._clickTimer = null;
            }
        });
        
        img.addEventListener('mouseleave', function(e) {
            if (this._clickTimer) {
                clearTimeout(this._clickTimer);
                this._clickTimer = null;
            }
        });
        
        // Touch events için (mobil)
        img.addEventListener('touchstart', function(e) {
            this._touchTimer = setTimeout(() => {
                showProtectionMessage('⛔ Resim koruma altındadır!');
                e.preventDefault();
            }, 800);
        });
        
        img.addEventListener('touchend', function(e) {
            if (this._touchTimer) {
                clearTimeout(this._touchTimer);
                this._touchTimer = null;
            }
        });
        
        img.addEventListener('touchcancel', function(e) {
            if (this._touchTimer) {
                clearTimeout(this._touchTimer);
                this._touchTimer = null;
            }
        });
    });
    
    console.log(`✅ ${images.length} resim koruma altına alındı`);
}

// Koruma mesajı göster
function showProtectionMessage(message) {
    // Mevcut mesaj varsa kaldır
    const existingMsg = document.getElementById('protection-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Yeni mesaj oluştur
    const msg = document.createElement('div');
    msg.id = 'protection-message';
    msg.textContent = message;
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        animation: protectionFade 2s ease-in-out;
        pointer-events: none;
    `;
    
    // Animasyon CSS'ini ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes protectionFade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(msg);
    
    // 2 saniye sonra mesajı kaldır
    setTimeout(() => {
        if (msg.parentNode) {
            msg.remove();
        }
    }, 2000);
}

// Sayfa üzerindeki tüm bağlantıları kontrol et
function protectLinks() {
    const links = document.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"], a[href*=".gif"], a[href*=".webp"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showProtectionMessage('⛔ Direkt bağlantı engellendi!');
            return false;
        });
    });
}

// İnspect element'i engellemeye çalış (temel koruma)
function preventInspect() {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U engelleme
    document.addEventListener('keydown', function(e) {
        // DevTools açma tuş kombinasyonları
        if (
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.key === 'F12') ||
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.key === 'u')
        ) {
            e.preventDefault();
            showProtectionMessage('⛔ Bu özellik devre dışı bırakıldı!');
            return false;
        }
    });
    
    // Sağ tık menüsünü engelle (tüm sayfa için)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            // Resimler için özel mesaj (yukarıda zaten var)
            return;
        }
        // Diğer elementler için genel engelleme
        e.preventDefault();
        return false;
    }, false);
}

// Yeni resimler yüklendiğinde de koruma uygula
function setupImageObserver() {
    // MutationObserver ile yeni eklenen resimleri izle
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'IMG') {
                            // Yeni resim bulundu, koruma uygula
                            protectSingleImage(node);
                        } else if (node.querySelectorAll) {
                            // İçindeki resimleri koru
                            const images = node.querySelectorAll('img');
                            images.forEach(protectSingleImage);
                        }
                    }
                });
            }
        });
    });
    
    // Body'deki değişiklikleri izle
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('👁️ Resim gözlemcisi aktif');
}

// Tek bir resmi koru
function protectSingleImage(img) {
    if (img.getAttribute('data-protected')) return;
    
    img.setAttribute('data-protected', 'true');
    img.setAttribute('draggable', 'false');
    img.style.userSelect = 'none';
    img.style.webkitUserDrag = 'none';
    
    // Event listeners ekle
    const events = ['contextmenu', 'dragstart', 'selectstart', 'copy'];
    events.forEach(event => {
        img.addEventListener(event, function(e) {
            e.preventDefault();
            showProtectionMessage('⛔ Resim koruma altındadır!');
            return false;
        });
    });
    
    // Uzun basmayı engelle
    let pressTimer;
    img.addEventListener('mousedown', function(e) {
        pressTimer = setTimeout(() => {
            showProtectionMessage('⛔ Resim koruma altındadır!');
        }, 800);
    });
    
    img.addEventListener('mouseup', function() {
        clearTimeout(pressTimer);
    });
    
    img.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer);
    });
}

// Tüm koruma sistemini başlat
function initializeProtection() {
    console.log('🚀 Resim koruma sistemi başlatılıyor...');
    
    // Mevcut resimleri koru
    protectAllImages();
    
    // Bağlantıları koru
    protectLinks();
    
    // Inspect engelle (temel)
    preventInspect();
    
    // Yeni resimleri izle
    setupImageObserver();
    
    // Prompt resimleri özel koruma
    protectPromptImages();
    
    console.log('✅ Resim koruma sistemi aktif!');
}

// Prompt resimlerine özel koruma
function protectPromptImages() {
    // Prompt resimlerini bul
    const promptImages = document.querySelectorAll('.prompt-image');
    
    promptImages.forEach(img => {
        // URL'yi gizlemek için
        img.onerror = function() {
            // Hata durumunda farklı bir resim göster
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
        };
        
        // Resmin URL'sini gizle
        Object.defineProperty(img, 'src', {
            get: function() {
                return this._originalSrc || '';
            },
            set: function(value) {
                this._originalSrc = value;
                // Proxy üzerinden yükle
                loadImageThroughProxy(this, value);
            }
        });
    });
}

// Proxy üzerinden resim yükle
function loadImageThroughProxy(imgElement, originalUrl) {
    // Burada bir proxy servisi kullanabilirsiniz
    // Şimdilik direkt yüklüyoruz ama kaynağı gizliyoruz
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = function() {
        // Resim yüklendikten sonra canvas'a çiz
        const canvas = document.createElement('canvas');
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0);
        
        // Canvas'ı data URL'ye çevir (orijinal URL gizli)
        imgElement.src = canvas.toDataURL('image/jpeg', 0.9);
        imgElement.setAttribute('data-original-url', 'protected');
    };
    tempImg.onerror = function() {
        // Hata durumunda placeholder göster
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIEdlbmVyYXRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
    };
    tempImg.src = originalUrl;
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    // Biraz bekle (diğer script'lerin yüklenmesi için)
    setTimeout(initializeProtection, 2000);
    
    // Resimler yüklendikten sonra tekrar kontrol et
    window.addEventListener('load', function() {
        setTimeout(initializeProtection, 1000);
    });
});

// Google Sheets'ten resimler yüklendiğinde de koruma uygula
if (typeof displayPrompts === 'function') {
    const originalDisplayPrompts = displayPrompts;
    window.displayPrompts = function(prompts) {
        originalDisplayPrompts(prompts);
        setTimeout(initializeProtection, 500);
    };
}

console.log('🛡️ Resim koruma scripti hazır!');
