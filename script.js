// ===== GOOGLE SHEETS AYARLARI =====
const SHEET_ID = '1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY';
const API_KEY = 'AIzaSyDyJ6YvBt7l24p4WpJ7n5L2vqjC6bW8zKk'; // Bu çalışacak

// ===== GLOBAL DEĞİŞKENLER =====
let allPrompts = [];
let filteredPrompts = [];
let currentFilter = 'all';
let currentLanguage = 'en';
let userLikes = JSON.parse(localStorage.getItem('promptMasterLikes')) || {};

// ===== ÇEVİRİLER =====
const translations = {
    en: {
        all: "All",
        most_liked: "Most Liked",
        newest: "Newest",
        subtitle: "Professional AI Image Prompts",
        footerText: "Create amazing AI images with professional prompts",
        searchPlaceholder: "Search prompts...",
        noResults: "No prompts found",
        loading: "Loading prompts from Google Sheets...",
        copy: "Copy",
        share: "Share",
        like: "Like",
        new: "NEW"
    },
    tr: {
        all: "Tümü",
        most_liked: "En Beğenilen",
        newest: "En Yeni",
        subtitle: "Profesyonel AI Görsel Promptları",
        footerText: "Profesyonel prompt'larla harika AI görselleri oluşturun",
        searchPlaceholder: "Prompt ara...",
        noResults: "Prompt bulunamadı",
        loading: "Google Sheets'ten prompt'lar yükleniyor...",
        copy: "Kopyala",
        share: "Paylaş",
        like: "Beğen",
        new: "YENİ"
    }
};

// ===== İLK BEĞENİ ÜRETİCİ =====
function generateInitialLikes() {
    const likes = Math.floor(Math.random() * 14000) + 1000;
    return {
        formatted: likes >= 1000 ? (likes / 1000).toFixed(1).replace('.0', '') + 'K' : likes.toString(),
        numeric: likes
    };
}

// ===== GÖRSEL KORUMA =====
function protectImages() {
    const images = document.querySelectorAll('.image-container img, .share-image img');
    
    images.forEach(img => {
        img.setAttribute('crossorigin', 'anonymous');
        
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showNotification('🛡️ Resim koruma aktif', 'warning');
            return false;
        });
        
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    });
}

// ===== BİLDİRİM SİSTEMİ =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'warning' ? 'exclamation-circle' : 
                         type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ===== GOOGLE SHEETS'TEN VERİ ÇEKME =====
async function loadFromGoogleSheets() {
    try {
        showNotification('📊 Google Sheets verileri yükleniyor...', 'info');
        
        const range = 'Sheet1!A:G'; // A'dan G'ye kadar sütunlar
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.values || data.values.length < 2) {
            throw new Error('Google Sheets boş veya hatalı');
        }
        
        const rows = data.values;
        const headers = rows[0];
        
        allPrompts = rows.slice(1).map((row, index) => {
            const promptId = (index + 1).toString();
            const initialLikes = generateInitialLikes();
            
            // LocalStorage'dan beğeni durumunu kontrol et
            let baseLikes = initialLikes.numeric;
            let userLiked = false;
            
            if (userLikes[promptId]) {
                baseLikes = userLikes[promptId].baseLikes;
                userLiked = userLikes[promptId].liked;
            } else {
                userLikes[promptId] = {
                    baseLikes: baseLikes,
                    liked: false
                };
            }
            
            const totalLikes = baseLikes + (userLiked ? 1 : 0);
            
            // Google Sheets sütunları:
            // 0: Başlık, 1: Açıklama, 2: Prompt, 3: Resim URL, 4: Kategori, 5: Tarih, 6: Yeni mi?
            return {
                id: index + 1,
                title: row[0] || 'Untitled',
                description: row[1] || '',
                prompt: row[2] || '',
                image: row[3] || 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&h=600&fit=crop',
                category: row[4] || 'art',
                baseLikes: baseLikes,
                totalLikes: totalLikes,
                likesFormatted: totalLikes >= 1000 ? 
                    (totalLikes / 1000).toFixed(1).replace('.0', '') + 'K' : 
                    totalLikes.toString(),
                userLiked: userLiked,
                date: row[5] || new Date().toISOString().split('T')[0],
                isNew: row[6] === 'TRUE' || row[6] === 'true' || false
            };
        });
        
        filteredPrompts = [...allPrompts];
        
        // LocalStorage'ı güncelle
        localStorage.setItem('promptMasterLikes', JSON.stringify(userLikes));
        
        updateStats();
        renderPrompts();
        showNotification('✅ Google Sheets verileri yüklendi!', 'success');
        
    } catch (error) {
        console.error('Google Sheets hatası:', error);
        showNotification('❌ Google Sheets yüklenemedi', 'error');
        
        // Fallback: Demo veriler
        loadDemoPrompts();
    }
}

// ===== DEMO VERİLER (YEDEK) =====
function loadDemoPrompts() {
    const demoPrompts = [
        {
            id: 1,
            title: "Cyberpunk Cityscape",
            description: "A futuristic city with neon lights, flying cars, and towering skyscrapers at night",
            prompt: "cyberpunk cityscape, neon lights, raining, futuristic, towering skyscrapers, flying cars, cinematic lighting, 8k, ultra detailed",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
            category: "landscape",
            isNew: true
        },
        {
            id: 2,
            title: "Fantasy Warrior",
            description: "A powerful warrior in fantasy armor with glowing magical effects",
            prompt: "fantasy warrior, full body, intricate armor, glowing magical effects, dramatic lighting, cinematic, detailed, 8k",
            image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&h=600&fit=crop",
            category: "characters",
            isNew: true
        }
    ];
    
    // Beğenileri ekle
    demoPrompts.forEach(prompt => {
        const promptId = prompt.id.toString();
        const initialLikes = generateInitialLikes();
        
        if (!userLikes[promptId]) {
            userLikes[promptId] = {
                baseLikes: initialLikes.numeric,
                liked: false
            };
        }
        
        prompt.baseLikes = userLikes[promptId].baseLikes;
        prompt.userLiked = userLikes[promptId].liked;
        prompt.totalLikes = prompt.baseLikes + (prompt.userLiked ? 1 : 0);
        prompt.likesFormatted = prompt.totalLikes >= 1000 ? 
            (prompt.totalLikes / 1000).toFixed(1).replace('.0', '') + 'K' : 
            prompt.totalLikes.toString();
    });
    
    allPrompts = demoPrompts;
    filteredPrompts = [...allPrompts];
    updateStats();
    renderPrompts();
}

// ===== PROMPT'LARI GÖSTER =====
function renderPrompts() {
    const promptsContainer = document.getElementById('promptsContainer');
    if (!promptsContainer) return;
    
    if (filteredPrompts.length === 0) {
        promptsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>${translations[currentLanguage].noResults}</h3>
                <p>Try different search terms or filters</p>
            </div>
        `;
        return;
    }
    
    promptsContainer.innerHTML = filteredPrompts.map(prompt => `
        <div class="prompt-card ${prompt.isNew ? 'new' : ''}" data-id="${prompt.id}" data-category="${prompt.category}">
            ${prompt.isNew ? '<div class="new-badge">' + translations[currentLanguage].new + '</div>' : ''}
            
            <div class="image-container">
                <img src="${prompt.image}" 
                     alt="${prompt.title}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&h=600&fit=crop'">
                <div class="image-protection"></div>
            </div>
            
            <div class="card-content">
                <div class="prompt-text">
                    <p><strong>${prompt.title}:</strong> ${prompt.description}</p>
                </div>
                
                <div class="card-meta">
                    <div class="likes-container">
                        <button class="like-btn ${prompt.userLiked ? 'liked' : ''}" onclick="toggleLike(this, ${prompt.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-count" data-prompt-id="${prompt.id}">
                            ${prompt.likesFormatted}
                        </span>
                    </div>
                    <span class="card-date">${formatDate(prompt.date)}</span>
                </div>
                
                <div class="card-actions">
                    <button class="action-btn copy-btn" onclick="copyPrompt('${encodeURIComponent(prompt.prompt)}')">
                        <i class="fas fa-copy"></i> ${translations[currentLanguage].copy}
                    </button>
                    <button class="action-btn share-btn" onclick="sharePrompt(${prompt.id})">
                        <i class="fas fa-share-alt"></i> ${translations[currentLanguage].share}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    protectImages();
}

// ===== BEĞENİ DEĞİŞTİR =====
function toggleLike(button, promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const likeCountElement = button.nextElementSibling;
    const promptIdStr = promptId.toString();
    
    if (button.classList.contains('liked')) {
        // Beğeniyi kaldır
        button.classList.remove('liked');
        prompt.userLiked = false;
        prompt.totalLikes = prompt.baseLikes;
        
        if (userLikes[promptIdStr]) {
            userLikes[promptIdStr].liked = false;
        }
    } else {
        // Beğeni ekle
        button.classList.add('liked');
        prompt.userLiked = true;
        prompt.totalLikes = prompt.baseLikes + 1;
        
        if (!userLikes[promptIdStr]) {
            userLikes[promptIdStr] = {
                baseLikes: prompt.baseLikes,
                liked: true
            };
        } else {
            userLikes[promptIdStr].liked = true;
        }
        
        showNotification('❤️ Beğendiniz!', 'success');
    }
    
    // Görüntüyü güncelle
    if (prompt.totalLikes >= 1000) {
        likeCountElement.textContent = (prompt.totalLikes / 1000).toFixed(1);
        likeCountElement.textContent = likeCountElement.textContent.endsWith('.0') 
            ? likeCountElement.textContent.replace('.0', '') + 'K' 
            : likeCountElement.textContent + 'K';
    } else {
        likeCountElement.textContent = prompt.totalLikes.toString();
    }
    
    prompt.likesFormatted = likeCountElement.textContent;
    
    localStorage.setItem('promptMasterLikes', JSON.stringify(userLikes));
    updateStats();
}

// ===== İSTATİSTİKLERİ GÜNCELLE =====
function updateStats() {
    const promptCount = document.getElementById('promptCount');
    const likeCount = document.getElementById('likeCount');
    
    if (promptCount) {
        promptCount.textContent = allPrompts.length;
    }
    
    if (likeCount) {
        let totalLikes = 0;
        allPrompts.forEach(prompt => {
            totalLikes += prompt.totalLikes;
        });
        
        if (totalLikes >= 1000) {
            likeCount.textContent = (totalLikes / 1000).toFixed(1).replace('.0', '') + 'K';
        } else {
            likeCount.textContent = totalLikes;
        }
    }
}

// ===== FİLTRELEME =====
function filterPrompts(filterType) {
    currentFilter = filterType;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    switch (filterType) {
        case 'most_liked':
            filteredPrompts = [...allPrompts].sort((a, b) => b.totalLikes - a.totalLikes);
            break;
            
        case 'newest':
            filteredPrompts = [...allPrompts].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            break;
            
        default:
            filteredPrompts = [...allPrompts];
            break;
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        searchPrompts(searchInput.value.trim());
        return;
    }
    
    renderPrompts();
}

// ===== ARAMA =====
function searchPrompts(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        filterPrompts(currentFilter);
        return;
    }
    
    filteredPrompts = allPrompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.prompt.toLowerCase().includes(searchTerm) ||
        prompt.category.toLowerCase().includes(searchTerm)
    );
    
    renderPrompts();
}

// ===== PROMPT KOPYALA =====
function copyPrompt(promptText) {
    const decodedPrompt = decodeURIComponent(promptText);
    navigator.clipboard.writeText(decodedPrompt).then(() => {
        showNotification('✅ Prompt kopyalandı!', 'success');
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
        showNotification('❌ Kopyalama başarısız', 'error');
    });
}

// ===== PAYLAŞIM =====
function sharePrompt(promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const shareModal = document.getElementById('shareModal');
    const shareImage = document.getElementById('shareImage');
    const shareMessageText = document.getElementById('shareMessageText');
    const shareLinkInput = document.getElementById('shareLinkInput');
    
    if (shareImage) shareImage.src = prompt.image;
    if (shareMessageText) shareMessageText.textContent = `"${prompt.title}" - ${prompt.likesFormatted} likes`;
    if (shareLinkInput) shareLinkInput.value = `https://t.me/sndiyi?text=${encodeURIComponent(prompt.title + ': ' + prompt.prompt)}`;
    
    shareModal.style.display = 'flex';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) {
        shareLinkInput.select();
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            showNotification('✅ Link kopyalandı!', 'success');
        });
    }
}

function shareToTelegram() {
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) {
        window.open(shareLinkInput.value, '_blank');
        closeShareModal();
    }
}

// ===== DİL DEĞİŞTİR =====
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = lang;
    }
    
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    const subtitle = document.getElementById('subtitle');
    const footerText = document.getElementById('footerText');
    const searchInput = document.getElementById('searchInput');
    
    if (subtitle && translations[lang].subtitle) {
        subtitle.textContent = translations[lang].subtitle;
    }
    if (footerText && translations[lang].footerText) {
        footerText.textContent = translations[lang].footerText;
    }
    if (searchInput && translations[lang].searchPlaceholder) {
        searchInput.placeholder = translations[lang].searchPlaceholder;
    }
    
    renderPrompts();
}

// ===== YARDIMCI FONKSİYONLAR =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchPrompts(e.target.value);
            }, 300);
        });
    }
    
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch && searchInput) {
        searchInput.addEventListener('input', () => {
            clearSearch.style.display = searchInput.value ? 'block' : 'none';
        });
        
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            filterPrompts(currentFilter);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeShareModal();
        }
    });
    
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                closeShareModal();
            }
        });
    }
}

// ===== UYGULAMAYI BAŞLAT =====
async function initializeApp() {
    showNotification('🚀 Uygulama başlatılıyor...', 'info');
    
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    changeLanguage(savedLanguage);
    
    await loadFromGoogleSheets();
    
    setupEventListeners();
    protectImages();
    
    showNotification('✅ Uygulama hazır!', 'success');
}

// ===== SAYFA YÜKLENDİĞİNDE ÇALIŞTIR =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// ===== GOOGLE SHEETS SÜTUN AÇIKLAMASI =====
/*
Google Sheets'inizde bu sütunları oluşturun:
A: Başlık (Title)
B: Açıklama (Description)
C: Prompt metni (Prompt)
D: Resim URL (Image URL)
E: Kategori (Category)
F: Tarih (Date - YYYY-MM-DD)
G: Yeni mi? (isNew - TRUE veya FALSE)

Örnek satır:
Cyberpunk City | Futuristic city... | cyberpunk cityscape... | https://... | landscape | 2024-01-15 | TRUE
*/
