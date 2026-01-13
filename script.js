// ===== CONFIGURATION =====
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_URL_HERE';
const SHEET_ID = 'YOUR_SHEET_ID';
const API_KEY = 'YOUR_API_KEY';

// ===== GLOBAL VARIABLES =====
let allPrompts = [];
let filteredPrompts = [];
let currentFilter = 'all';
let currentLanguage = 'en';
let isInitialized = false;
let userLikes = JSON.parse(localStorage.getItem('promptMasterLikes')) || {};

// ===== TRANSLATIONS =====
const translations = window.translations || {
    en: {
        all: "All",
        most_liked: "Most Liked",
        newest: "Newest",
        oldest: "Oldest",
        subtitle: "Professional AI Image Prompts",
        footerText: "Create amazing AI images with professional prompts",
        searchPlaceholder: "Search prompts...",
        noResults: "No prompts found",
        loading: "Loading prompts...",
        copy: "Copy",
        share: "Share",
        copied: "Copied!",
        like: "Like",
        new: "NEW"
    },
    tr: {
        all: "Tümü",
        most_liked: "En Beğenilen",
        newest: "En Yeni",
        oldest: "En Eski",
        subtitle: "Profesyonel AI Görsel Promptları",
        footerText: "Profesyonel prompt'larla harika AI görselleri oluşturun",
        searchPlaceholder: "Prompt ara...",
        noResults: "Prompt bulunamadı",
        loading: "Prompt'lar yükleniyor...",
        copy: "Kopyala",
        share: "Paylaş",
        copied: "Kopyalandı!",
        like: "Beğen",
        new: "YENİ"
    },
    ku: {
        all: "Hemû",
        most_liked: "Herî Hezkirî",
        newest: "Herî Nû",
        oldest: "Herî Kevin",
        subtitle: "Promptên Wêneyên AI yê Professional",
        footerText: "Bi promptên profesyonel re wêneyên AI yên ecêb çêbikin",
        searchPlaceholder: "Prompt bigerin...",
        noResults: "Prompt nehate dîtin",
        loading: "Prompt tên barkirin...",
        copy: "Kopî bike",
        share: "Parve bike",
        copied: "Hat kopîkirin!",
        like: "Hez bike",
        new: "NÛ"
    },
    ar: {
        all: "الكل",
        most_liked: "الأكثر إعجابًا",
        newest: "الأحدث",
        oldest: "الأقدم",
        subtitle: "برومبتات صور الذكاء الاصطناعي الاحترافية",
        footerText: "أنشئ صور ذكاء اصطناعي مذهلة باستخدام برومبتات احترافية",
        searchPlaceholder: "ابحث عن برومبتات...",
        noResults: "لم يتم العثور على برومبتات",
        loading: "جاري تحميل البرومبتات...",
        copy: "نسخ",
        share: "مشاركة",
        copied: "تم النسخ!",
        like: "إعجاب",
        new: "جديد"
    },
    ru: {
        all: "Все",
        most_liked: "Самые популярные",
        newest: "Самые новые",
        oldest: "Самые старые",
        subtitle: "Профессиональные промпты для AI изображений",
        footerText: "Создавайте удивительные AI изображения с профессиональными промптами",
        searchPlaceholder: "Поиск промптов...",
        noResults: "Промпты не найдены",
        loading: "Загрузка промптов...",
        copy: "Копировать",
        share: "Поделиться",
        copied: "Скопировано!",
        like: "Нравится",
        new: "НОВЫЙ"
    }
};

// ===== RANDOM LIKES GENERATOR (SADECE İLK YÜKLEMEDE) =====
function generateInitialLikes() {
    // 1000 ile 15000 arasında rastgele sayı
    const likes = Math.floor(Math.random() * 14000) + 1000;
    
    // Format: 1.2K, 5.7K, 12.3K gibi
    if (likes >= 1000) {
        const formatted = (likes / 1000).toFixed(1);
        return {
            formatted: formatted.endsWith('.0') ? formatted.replace('.0', '') + 'K' : formatted + 'K',
            numeric: likes
        };
    }
    return {
        formatted: likes.toString(),
        numeric: likes
    };
}

// ===== GÖRSEL KORUMA =====
function protectImages() {
    const images = document.querySelectorAll('.image-container img, .share-image img');
    
    images.forEach(img => {
        img.setAttribute('crossorigin', 'anonymous');
        img.classList.add('no-image-context');
        
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showNotification('🛡️ Resim koruma aktif', 'warning');
            return false;
        });
        
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        const originalSrc = img.src;
        img.dataset.originalSrc = originalSrc;
    });
    
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(container => {
        const overlay = document.createElement('div');
        overlay.className = 'image-protection';
        overlay.innerHTML = '<div class="protection-overlay"></div>';
        container.appendChild(overlay);
        
        overlay.addEventListener('contextmenu', function(e) {
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

// ===== UYGULAMA BAŞLATMA =====
async function initializeApp() {
    if (isInitialized) return;
    
    showNotification('🚀 Uygulama başlatılıyor...', 'info');
    
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    changeLanguage(savedLanguage);
    
    await loadPrompts();
    
    setupEventListeners();
    
    protectImages();
    
    isInitialized = true;
    showNotification('✅ Uygulama hazır!', 'success');
}

// ===== PROMPT'LARI YÜKLE =====
async function loadPrompts() {
    const promptsContainer = document.getElementById('promptsContainer');
    if (!promptsContainer) return;
    
    promptsContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>${translations[currentLanguage].loading}</p>
        </div>
    `;
    
    try {
        let promptsData = [];
        
        // DEMO VERİ - Google Sheets URL'nizi buraya ekleyin
        promptsData = [
            {
                id: 1,
                title: "Cyberpunk Cityscape",
                description: "A futuristic city with neon lights, flying cars, and towering skyscrapers at night",
                prompt: "cyberpunk cityscape, neon lights, raining, futuristic, towering skyscrapers, flying cars, cinematic lighting, 8k, ultra detailed",
                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
                category: "landscape",
                date: "2024-01-15",
                isNew: true
            },
            {
                id: 2,
                title: "Fantasy Warrior",
                description: "A powerful warrior in fantasy armor with glowing magical effects",
                prompt: "fantasy warrior, full body, intricate armor, glowing magical effects, dramatic lighting, cinematic, detailed, 8k",
                image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&h=600&fit=crop",
                category: "characters",
                date: "2024-01-14",
                isNew: true
            },
            {
                id: 3,
                title: "Surreal Landscape",
                description: "A dreamlike landscape with floating islands and waterfalls",
                prompt: "surreal landscape, floating islands, waterfalls, dreamlike, mystical, vibrant colors, magical, 8k",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                category: "landscape",
                date: "2024-01-13",
                isNew: false
            },
            {
                id: 4,
                title: "Steampunk Workshop",
                description: "A detailed steampunk workshop with gears and mechanical devices",
                prompt: "steampunk workshop, intricate details, gears, mechanical devices, brass and copper, warm lighting, detailed, 8k",
                image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop",
                category: "art",
                date: "2024-01-12",
                isNew: false
            },
            {
                id: 5,
                title: "AI Portrait",
                description: "A detailed portrait of a person with cybernetic enhancements",
                prompt: "cybernetic portrait, detailed face, glowing circuit patterns, neon accents, cinematic lighting, 8k, ultra detailed",
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
                category: "characters",
                date: "2024-01-11",
                isNew: false
            },
            {
                id: 6,
                title: "Magic Forest",
                description: "An enchanted forest with glowing plants and magical creatures",
                prompt: "enchanted forest, glowing plants, magical creatures, bioluminescent, mystical, fantasy, detailed, 8k",
                image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop",
                category: "landscape",
                date: "2024-01-10",
                isNew: false
            }
        ];
        
        // Her prompt'a rastgele başlangıç beğenisi ata (sadece ilk yüklemede)
        promptsData.forEach(prompt => {
            const promptId = prompt.id.toString();
            
            // LocalStorage'da kayıtlı beğeni var mı kontrol et
            if (userLikes[promptId] !== undefined) {
                // Kullanıcı daha önce beğenmiş, onun verisini kullan
                prompt.baseLikes = userLikes[promptId].baseLikes || 0;
                prompt.userLiked = userLikes[promptId].liked || false;
            } else {
                // İlk defa görüntüleniyor, rastgele beğeni ata
                const initialLikes = generateInitialLikes();
                prompt.baseLikes = initialLikes.numeric;
                prompt.userLiked = false;
                
                // LocalStorage'a kaydet
                userLikes[promptId] = {
                    baseLikes: prompt.baseLikes,
                    liked: false
                };
            }
            
            // Toplam beğeni sayısını hesapla
            prompt.totalLikes = prompt.baseLikes + (prompt.userLiked ? 1 : 0);
            
            // Formatlı gösterim için
            if (prompt.totalLikes >= 1000) {
                prompt.likesFormatted = (prompt.totalLikes / 1000).toFixed(1);
                prompt.likesFormatted = prompt.likesFormatted.endsWith('.0') 
                    ? prompt.likesFormatted.replace('.0', '') + 'K' 
                    : prompt.likesFormatted + 'K';
            } else {
                prompt.likesFormatted = prompt.totalLikes.toString();
            }
        });
        
        allPrompts = promptsData;
        filteredPrompts = [...allPrompts];
        
        updateStats();
        renderPrompts();
        
        // LocalStorage'ı güncelle
        localStorage.setItem('promptMasterLikes', JSON.stringify(userLikes));
        
    } catch (error) {
        console.error('Error loading prompts:', error);
        promptsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Prompts</h3>
                <p>Please check your connection and try again.</p>
                <button onclick="loadPrompts()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 10px; cursor: pointer;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
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
                     onerror="this.src='https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&h=600&fit=crop'">
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
                        <span class="like-count" data-prompt-id="${prompt.id}" data-base-likes="${prompt.baseLikes}">
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

// ===== BEĞENİ DEĞİŞTİRME =====
function toggleLike(button, promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const likeCountElement = button.nextElementSibling;
    const promptIdStr = promptId.toString();
    
    // Mevcut durumu kontrol et
    const currentlyLiked = button.classList.contains('liked');
    
    if (currentlyLiked) {
        // Beğeniyi kaldır
        button.classList.remove('liked');
        prompt.userLiked = false;
        prompt.totalLikes = prompt.baseLikes;
        
        // LocalStorage güncelle
        if (userLikes[promptIdStr]) {
            userLikes[promptIdStr].liked = false;
        }
        
        showNotification('💔 Beğeniniz kaldırıldı', 'info');
    } else {
        // Beğeni ekle
        button.classList.add('liked');
        prompt.userLiked = true;
        prompt.totalLikes = prompt.baseLikes + 1;
        
        // LocalStorage güncelle
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
    
    // Prompt verisini güncelle
    prompt.likesFormatted = likeCountElement.textContent;
    
    // LocalStorage'ı kaydet
    localStorage.setItem('promptMasterLikes', JSON.stringify(userLikes));
    
    // İstatistikleri güncelle
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
            
        case 'oldest':
            filteredPrompts = [...allPrompts].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
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

// ===== PROMPT KOPYALAMA =====
function copyPrompt(promptText) {
    const decodedPrompt = decodeURIComponent(promptText);
    navigator.clipboard.writeText(decodedPrompt).then(() => {
        showNotification('✅ Prompt kopyalandı!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
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
    if (shareMessageText) shareMessageText.textContent = `"${prompt.title}" - ${prompt.totalLikes} beğeni`;
    if (shareLinkInput) shareLinkInput.value = `https://t.me/sndiyi?text=${encodeURIComponent(prompt.title + ': ' + prompt.prompt)}`;
    
    shareModal.style.display = 'flex';
}

// ===== PAYLAŞIM MODAL KAPATMA =====
function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// ===== LİNK KOPYALAMA =====
function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) {
        shareLinkInput.select();
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            showNotification('✅ Link kopyalandı!', 'success');
        });
    }
}

// ===== TELEGRAM'A PAYLAŞ =====
function shareToTelegram() {
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) {
        window.open(shareLinkInput.value, '_blank');
        closeShareModal();
    }
}

// ===== DİL DEĞİŞTİRME =====
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
    
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateStats();
        }
    });
}

// ===== UYGULAMAYI BAŞLAT =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            border-left: 4px solid var(--primary);
        }
        
        .notification.success {
            border-left-color: #10B981;
        }
        
        .notification.warning {
            border-left-color: #F59E0B;
        }
        
        .notification.error {
            border-left-color: #EF4444;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification.success i {
            color: #10B981;
        }
        
        .notification.warning i {
            color: #F59E0B;
        }
        
        .notification.error i {
            color: #EF4444;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: #6B7280;
            cursor: pointer;
            font-size: 1.2rem;
            margin-left: 10px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .protection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 2;
        }
        
        .like-btn.liked i {
            color: var(--secondary) !important;
        }
    `;
    document.head.appendChild(style);
});

// ===== GOOGLE SHEETS ENTEGRASYONU =====
async function loadFromGoogleSheets() {
    /* 
    // Google Sheets API kullanımı:
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
    const data = await response.json();
    
    const rows = data.values;
    const headers = rows[0];
    
    allPrompts = rows.slice(1).map((row, index) => {
        const promptId = (index + 1).toString();
        const initialLikes = generateInitialLikes();
        
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
        
        return {
            id: index + 1,
            title: row[0] || '',
            description: row[1] || '',
            prompt: row[2] || '',
            image: row[3] || '',
            category: row[4] || 'art',
            baseLikes: baseLikes,
            totalLikes: totalLikes,
            likesFormatted: totalLikes >= 1000 ? (totalLikes / 1000).toFixed(1).replace('.0', '') + 'K' : totalLikes.toString(),
            userLiked: userLiked,
            date: row[5] || new Date().toISOString().split('T')[0],
            isNew: row[6] === 'TRUE'
        };
    });
    
    filteredPrompts = [...allPrompts];
    localStorage.setItem('promptMasterLikes', JSON.stringify(userLikes));
    updateStats();
    renderPrompts();
    */
}

// ===== HATA YAKALAMA =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showNotification('⚠️ Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// ===== SAYFA GÖRÜNÜRLÜĞÜ =====
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateStats();
    }
});

// ===== RESET BUTTON (Gizli - Geliştirici için) =====
function resetLikes() {
    if (confirm('Tüm beğenileri sıfırlamak istediğinize emin misiniz?')) {
        localStorage.removeItem('promptMasterLikes');
        userLikes = {};
        location.reload();
    }
}

// Console'a gizli buton ekle
console.log('%c🔧 Geliştirici Araçları:', 'color: #8B5CF6; font-weight: bold;');
console.log('%cresetLikes() - Beğenileri sıfırla', 'color: #EC4899;');
