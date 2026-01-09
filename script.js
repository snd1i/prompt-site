// MAIN SCRIPT FILE

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    try {
        await fetchPrompts();
        setupEventListeners();
        updateStats();
    } catch (error) {
        showError(error);
    }
}

// Fetch prompts from Google Sheets
async function fetchPrompts() {
    try {
        const URL = `https://opensheet.elk.sh/${CONFIG.SHEET_ID}/${CONFIG.SHEET_NAME}`;
        console.log('Fetching from:', URL);
        
        const response = await fetch(URL);
        if (!response.ok) throw new Error('Failed to fetch prompts');
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format from Google Sheets');
        }
        
        // Process prompts data
        STATE.allPrompts = data.map((item, index) => {
            const promptId = item.prompt ? 
                item.prompt.substring(0, 50).replace(/\s/g, '_') + '_' + index : 
                'prompt_' + index;
            
            const dateAdded = item.date || new Date().toISOString();
            const isNew = isPromptNew(dateAdded);
            const isViewed = STATE.viewedNewPrompts.includes(promptId);
            
            return {
                ...item,
                id: promptId,
                likes: STATE.likes[promptId] || 0,
                dateAdded: dateAdded,
                image: item.image || CONFIG.DEFAULT_IMAGE,
                prompt: item.prompt || 'No prompt text available',
                isNew: isNew && !isViewed,
                isViewed: isViewed
            };
        });
        
        console.log('Processed prompts:', STATE.allPrompts);
        
        // Set initial language
        const savedLang = localStorage.getItem('preferredLanguage') || detectUserLanguage();
        document.getElementById('languageSelect').value = savedLang;
        changeLanguage(savedLang);
        
        // Initial render
        STATE.filteredPrompts = [...STATE.allPrompts];
        renderPrompts();
        
    } catch (error) {
        console.error('Error fetching prompts:', error);
        showError(error);
    }
}

// Check if prompt is new (within last N days)
function isPromptNew(dateString) {
    try {
        const promptDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - promptDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= CONFIG.NEW_PROMPT_DAYS;
    } catch (e) {
        return false;
    }
}

// Mark prompt as viewed (remove NEW badge)
function markPromptAsViewed(promptId) {
    if (!STATE.viewedNewPrompts.includes(promptId)) {
        STATE.viewedNewPrompts.push(promptId);
        localStorage.setItem('viewedNewPrompts', JSON.stringify(STATE.viewedNewPrompts));
        
        // Update the prompt in the array
        const promptIndex = STATE.allPrompts.findIndex(p => p.id === promptId);
        if (promptIndex !== -1) {
            STATE.allPrompts[promptIndex].isNew = false;
            STATE.allPrompts[promptIndex].isViewed = true;
        }
    }
}

// Detect user language from browser
function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];
    return TRANSLATIONS[langCode] ? langCode : CONFIG.DEFAULT_LANGUAGE;
}

// Change language
function changeLanguage(lang) {
    STATE.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    updatePageText();
    renderPrompts();
    updateStats();
}

// Update all text on page
function updatePageText() {
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    document.title = t.title;
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('searchInput').placeholder = t.search_placeholder;
    document.getElementById('footerText').textContent = t.footer;
    
    // Update button texts
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update filter buttons active state
    updateFilterButtons();
}

// Update filter buttons active state
function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.filter-btn[onclick*="${STATE.currentFilter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Update statistics
function updateStats() {
    const totalPrompts = STATE.allPrompts.length;
    const totalLikes = STATE.allPrompts.reduce((sum, prompt) => sum + prompt.likes, 0);
    
    document.getElementById('promptCount').textContent = totalPrompts;
    document.getElementById('likeCount').textContent = totalLikes;
}

// Render prompts to the grid
function renderPrompts() {
    const container = document.getElementById('promptsContainer');
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    if (STATE.filteredPrompts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>${t.no_results}</h3>
                <p>Try different keywords</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = STATE.filteredPrompts.map(prompt => {
        const promptId = prompt.id;
        const isLiked = localStorage.getItem(`liked_${promptId}`) === 'true';
        
        return `
            <div class="prompt-card" data-id="${promptId}">
                ${prompt.isNew ? `<div class="new-badge">${t.new_badge}</div>` : ''}
                
                <div class="image-container">
                    <img src="${prompt.image}" alt="Prompt image">
                </div>
                
                <div class="card-content">
                    <div class="prompt-text">
                        <p>${prompt.prompt}</p>
                    </div>
                    
                    <div class="card-meta">
                        <div class="likes-container">
                            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${promptId}')">
                                <i class="fas fa-heart"></i>
                            </button>
                            <span class="like-count">${prompt.likes} ${t.likes}</span>
                        </div>
                        <div class="card-date">
                            ${formatDate(prompt.dateAdded)}
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="action-btn copy-btn" onclick="copyPrompt('${promptId}')">
                            <i class="fas fa-copy"></i> ${t.copy}
                        </button>
                        <button class="action-btn share-btn" onclick="sharePrompt('${promptId}')">
                            <i class="fas fa-share-alt"></i> ${t.share}
                        </button>
                        <a class="action-btn support-btn" href="${CONFIG.TELEGRAM_SUPPORT_LINK}" target="_blank">
                            <i class="fab fa-telegram"></i> ${t.support}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click event to new badges to mark as viewed
    document.querySelectorAll('.new-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            const promptId = badge.closest('.prompt-card').dataset.id;
            markPromptAsViewed(promptId);
            badge.style.display = 'none';
        });
    });
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(STATE.currentLanguage === 'ku' ? 'en-US' : STATE.currentLanguage, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Recent';
    }
}

// Copy prompt to clipboard
function copyPrompt(promptId) {
    const prompt = STATE.allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    navigator.clipboard.writeText(prompt.prompt || '')
        .then(() => {
            showNotification(TRANSLATIONS[STATE.currentLanguage].copied);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            // Fallback method
            const textarea = document.getElementById('hiddenTextarea');
            textarea.value = prompt.prompt || '';
            textarea.select();
            document.execCommand('copy');
            showNotification(TRANSLATIONS[STATE.currentLanguage].copied);
        });
}

// Share prompt
function sharePrompt(promptId) {
    const prompt = STATE.allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    // Mark as viewed when sharing
    if (prompt.isNew) {
        markPromptAsViewed(promptId);
    }
    
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    // Update modal content
    document.getElementById('shareImage').src = prompt.image;
    document.getElementById('shareMessageText').textContent = t.share_message;
    document.getElementById('shareLinkInput').value = CONFIG.TELEGRAM_PROMPT_LINK;
    
    // Show modal
    document.getElementById('shareModal').style.display = 'flex';
}

// Close share modal
function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// Copy share link
function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    input.select();
    document.execCommand('copy');
    
    const t = TRANSLATIONS[STATE.currentLanguage];
    showNotification(t.copied);
}

// Share to Telegram
function shareToTelegram() {
    const t = TRANSLATIONS[STATE.currentLanguage];
    const message = `${t.share_message}\n\n${CONFIG.TELEGRAM_PROMPT_LINK}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.TELEGRAM_PROMPT_LINK)}&text=${encodeURIComponent(message)}`;
    
    window.open(telegramShareUrl, '_blank');
    closeShareModal();
    showNotification(t.shared);
}

// Toggle like
function toggleLike(promptId) {
    const prompt = STATE.allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const isLiked = localStorage.getItem(`liked_${promptId}`) === 'true';
    const likeBtn = document.querySelector(`.prompt-card[data-id="${promptId}"] .like-btn`);
    
    if (isLiked) {
        prompt.likes--;
        localStorage.setItem(`liked_${promptId}`, 'false');
        if (likeBtn) likeBtn.classList.remove('liked');
    } else {
        prompt.likes++;
        localStorage.setItem(`liked_${promptId}`, 'true');
        if (likeBtn) likeBtn.classList.add('liked');
    }
    
    // Update likes in localStorage
    STATE.likes[promptId] = prompt.likes;
    localStorage.setItem('promptLikes', JSON.stringify(STATE.likes));
    
    // Update UI
    const likeCount = document.querySelector(`.prompt-card[data-id="${promptId}"] .like-count`);
    if (likeCount) {
        const t = TRANSLATIONS[STATE.currentLanguage];
        likeCount.textContent = `${prompt.likes} ${t.likes}`;
    }
    
    // Update stats
    updateStats();
    
    // Re-apply current filter if needed
    if (STATE.currentFilter === 'most_liked') {
        filterPrompts('most_liked');
    }
}

// Filter prompts
function filterPrompts(filterType) {
    STATE.currentFilter = filterType;
    
    switch(filterType) {
        case 'most_liked':
            STATE.filteredPrompts = [...STATE.allPrompts].sort((a, b) => b.likes - a.likes);
            break;
        case 'newest':
            STATE.filteredPrompts = [...STATE.allPrompts].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'oldest':
            STATE.filteredPrompts = [...STATE.allPrompts].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        case 'all':
        default:
            STATE.filteredPrompts = [...STATE.allPrompts];
    }
    
    updateFilterButtons();
    renderPrompts();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value.toLowerCase();
        applySearchFilter();
        
        // Show/hide clear button
        if (STATE.searchQuery.trim()) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        STATE.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        applySearchFilter();
    });
    
    // Close modal on overlay click
    document.getElementById('shareModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeShareModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeShareModal();
        }
    });
}

// Apply search filter
function applySearchFilter() {
    if (!STATE.searchQuery.trim()) {
        STATE.filteredPrompts = [...STATE.allPrompts];
    } else {
        STATE.filteredPrompts = STATE.allPrompts.filter(prompt => 
            (prompt.prompt && prompt.prompt.toLowerCase().includes(STATE.searchQuery)) ||
            (prompt.tags && prompt.tags.toLowerCase().includes(STATE.searchQuery)) ||
            (prompt.category && prompt.category.toLowerCase().includes(STATE.searchQuery))
        );
    }
    
    // Apply current filter after search
    if (STATE.currentFilter !== 'all') {
        filterPrompts(STATE.currentFilter);
    } else {
        renderPrompts();
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 2px solid var(--card-border);
        backdrop-filter: blur(20px);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show error state
function showError(error) {
    console.error('App error:', error);
    const container = document.getElementById('promptsContainer');
    const t = TRANSLATIONS[STATE.currentLanguage] || TRANSLATIONS[CONFIG.DEFAULT_LANGUAGE];
    
    container.innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${t.error_loading}</h3>
            <p>${error.message || 'Please check your connection'}</p>
            <button class="telegram-btn" onclick="location.reload()" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
                          }
