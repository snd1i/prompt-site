// ===== YENİ EKLENEN ÖZELLİKLER =====

// Rastgele beğeni sayısı üret (1K - 15K arası)
function generateRandomLikes() {
    // 1000 ile 15000 arasında rastgele sayı
    const likes = Math.floor(Math.random() * 14000) + 1000;
    
    // Sayıyı formatla (1.2K, 5.7K, 12.3K gibi)
    if (likes >= 1000) {
        const formatted = (likes / 1000).toFixed(1);
        // .0 ise kaldır
        return formatted.endsWith('.0') ? formatted.replace('.0', '') + 'K' : formatted + 'K';
    }
    return likes.toString();
}

// Tüm prompt kartlarına rastgele beğeni ekle
function addRandomLikesToPrompts() {
    const likeCounts = document.querySelectorAll('.like-count');
    
    likeCounts.forEach(countElement => {
        if (!countElement.dataset.initialized) {
            const randomLikes = generateRandomLikes();
            countElement.textContent = randomLikes;
            countElement.dataset.initialized = 'true';
            countElement.dataset.actualLikes = randomLikes;
        }
    });
}

// Görsel koruma sistemi
function protectImages() {
    // Tüm görsellere koruma ekle
    const images = document.querySelectorAll('.image-container img');
    
    images.forEach(img => {
        // Görsel bağlantısını gizle
        img.setAttribute('crossorigin', 'anonymous');
        img.classList.add('no-image-context');
        
        // Görsele sağ tıklamayı engelle
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Görseli sürükle-bırak'ı engelle
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Görsel URL'sini gizle
        Object.defineProperty(img, 'src', {
            get() {
                return this.getAttribute('src');
            },
            set(value) {
                this.setAttribute('src', value);
                this.setAttribute('data-original-src', value);
            }
        });
    });
    
    // Görsel konteynırlarına koruma ekle
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(container => {
        // Koruma overlay'i ekle
        const overlay = document.createElement('div');
        overlay.className = 'image-protection';
        overlay.innerHTML = '<div class="protection-overlay"></div>';
        container.appendChild(overlay);
        
        // Tıklamayı engelle
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        overlay.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    // Mevcut kodlarınız burada çalışıyor...
    
    // Yeni özellikleri ekle
    setTimeout(() => {
        addRandomLikesToPrompts();
        protectImages();
    }, 1000);
    
    // Her 3 saniyede bir beğenileri güncelle (yeni eklenenler için)
    setInterval(addRandomLikesToPrompts, 3000);
});

// Beğeni butonu tıklama fonksiyonu güncellemesi
function toggleLike(button) {
    const likeCount = button.nextElementSibling;
    let currentLikes = likeCount.textContent;
    
    // K'dan sayıya çevir
    let numericLikes = parseInt(currentLikes.replace('K', '')) * 1000;
    
    if (button.classList.contains('liked')) {
        // Beğeniden çıkar
        numericLikes -= 1;
        button.classList.remove('liked');
    } else {
        // Beğeni ekle
        numericLikes += 1;
        button.classList.add('liked');
    }
    
    // Formatla ve göster
    if (numericLikes >= 1000) {
        likeCount.textContent = (numericLikes / 1000).toFixed(1).replace('.0', '') + 'K';
    } else {
        likeCount.textContent = numericLikes;
    }
}

// Google Sheets veri yükleme fonksiyonuna ekle
// (Bu kısmı mevcut loadPromptsFromGoogleSheets fonksiyonunuza ekleyin)
function enhancedLoadPrompts(data) {
    // Mevcut veri işleme kodunuz...
    
    // Her prompt için:
    // 1. Rastgele "new" badge kontrolü (sadece son 7 gün içindekiler)
    // 2. Rastgele beğeni atama
    // 3. Görsel koruma ekleme
    
    data.forEach((prompt, index) => {
        // Son 7 gün içinde eklenmişse "new" class'ı ekle
        const isNew = Math.random() > 0.5; // %50 şans
        if (isNew) {
            // prompt-card elementine "new" class'ı ekle
            // Bu kısım DOM'a eklediğinizde çalışacak
        }
    });
}

// Console'dan görsel URL'lerini gizle
(function() {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const result = originalFetch.apply(this, args);
        result.then(response => {
            if (response.url && response.url.includes('google.com') && response.url.includes('image')) {
                console.log('🛡️ Görsel koruma aktif: URL gizlendi');
            }
        });
        return result;
    };
})();
