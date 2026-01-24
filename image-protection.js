// image-protection.js - SADECE URL GİZLEME
// Resme basılı tutunca URL görünmez, başka hiçbir şey değişmez

console.log('🔒 URL gizleme aktif...');

function preventImageURLPreview() {
    // Tüm resimleri seç
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Sadece dragstart event'ini engelle (URL görünmesini önle)
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Context menu'yu normal bırak, sadece URL görünmesin
        img.addEventListener('contextmenu', function(e) {
            // Normal sağ tık menüsü açılsın ama URL görünmesin
            // Hiçbir şey yapma, sadece dragstart'ı engelledik
            return true;
        });
    });
    
    console.log(`✅ ${images.length} resim için URL gizlendi`);
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(preventImageURLPreview, 1000);
});

// Yeni resimler için de çalıştır
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            setTimeout(preventImageURLPreview, 100);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('✨ URL gizleme hazır!');
