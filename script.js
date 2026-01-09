// MAIN SCRIPT FILE

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Main initialization function
async function initializeApp() {
    try {
        showLoading();
        await fetchPrompts();
        setupEventListeners();
        checkUrlForPrompt();
    } catch (error) {
        showError(error);
    }
}

// Fetch prompts from Google Sheets
async function fetchPrompts() {
    const URL = `https://opensheet.elk.sh/${CONFIG.SHEET_ID}/${CONFIG.SHEET_NAME}`;
    
    const response = await fetch(URL);
    const data = await response.json();
    
    // Process prompts data
    STATE.allPrompts = data.map((item, index) => {
        const promptId = item.prompt ? 
            item.prompt.substring(0, 50).replace(/\s/g, '_') + '_' + index : 
            'prompt_' + index;
        
        return {
            ...item,
            id: promptId,
            likes: STATE.likes[promptId] || 0,
            dateAdded: item.date || new Date().toISOString(),
            image: item.image || CONFIG.DEFAULT_IMAGE
        };
    });
    
    // Set initial language
    const savedLang = localStorage.getItem('preferredLanguage') || detectUserLanguage();
    document.getElementById('languageSelect').value = savedLang;
    changeLanguage(savedLang);
    
    // Initial render
    STATE.filteredPrompts = [...STATE.allPrompts];
    renderPrompts();
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
}

// Update all text on page
function updatePageText() {
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    document.title = t.title;
    document.querySelector('h1').innerHTML = `<i class="fas fa-robot"></i> ${t.title}`;
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
}

// Render prompts to the grid
function renderPrompts() {
    const container = document.getElementById('promptsContainer');
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    if (STATE.filteredPrompts.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--gray)">
                <i class="fas fa-search fa-3x" style="margin-bottom:20px;"></i>
                <h3>${t.no_results}</h3>
            </div>`;
        return;
    }
    
    container.innerHTML = STATE.filteredPrompts.map(prompt => {
        const promptId = prompt.id;
        const isLiked = localStorage.getItem(`liked_${promptId}`) === 'true';
        
        return `
            <div class="prompt-card" data-id="${promptId}">
                <img src="${prompt.image}" class="card-image" alt="Prompt preview">
                
                <div class="card-content">
                    <div class="prompt-text">
                        ${prompt.prompt || 'No prompt text available'}
                    </div>
                    
                    <div class="card-meta">
                        <div class="likes" onclick="toggleLike('${promptId}')">
                            <i class="fas fa-heart ${isLiked ? 'liked' : ''}"></i>
                            <span>${prompt.likes} ${t.likes}</span>
                        </div>
                        <div>${new Date(prompt.dateAdded).toLocaleDateString()}</div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="action-btn copy-btn" onclick="copyPrompt('${promptId}')">
                            <i class="fas fa-copy"></i> ${t.copy}
                        </button>
                        <button class="action-btn share-btn" onclick="openShareModal('${promptId}')">
                            <i class="fas fa-share-alt"></i> ${t.share}
                        </button>
                        <a class="action-btn support-btn" href="${CONFIG.TELEGRAM_SUPPORT_LINK}" target="_blank">
                            <i class="fab fa-telegram"></i> ${t.support}
                        </a>
                    </div>
                    
                    <button class="action-btn prompt-btn" onclick="goToPrompt('${promptId}')">
                        <i class="fas fa-arrow-right"></i> ${t.view_prompt}
                    </button>
                </div>
            </div>
        `;
    }).join('');
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

// Open share modal
function openShareModal(promptId) {
    const prompt = STATE.allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    STATE.currentSharingPrompt = prompt;
    const t = TRANSLATIONS[STATE.currentLanguage];
    
    // Update modal content
    document.getElementById('shareModalImage').src = prompt.image;
    document.getElementById('shareModalMessage').innerHTML = `
        <h3 style="margin-bottom:10px; color:var(--primary)">${t.share_title}</h3>
        <p>${t.share_message}</p>
    `;
    
    // Update button texts
    document.getElementById('telegramBtnText').textContent = t.telegram_btn;
    document.getElementById('promptLinkText').textContent = t.prompt_btn;
    
    // Set up button actions
    const telegramBtn = document.getElementById('openInTelegramBtn');
    const promptLinkBtn = document.getElementById('promptLinkBtn');
    
    telegramBtn.onclick = () => {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(t.share_message)}`;
        window.open(shareUrl, '_blank');
    };
    
    promptLinkBtn.onclick = () => {
        const shareLink = `${window.location.origin}${window.location.pathname}?prompt=${encodeURIComponent(promptId)}`;
        window.open(shareLink, '_blank');
    };
    
    // Show modal
    document.getElementById('shareOverlay').style.display = 'flex';
}

// Close share modal
function closeShareModal() {
    document.getElementById('shareOverlay').style.display = 'none';
    STATE.currentSharingPrompt = null;
}

// Go directly to prompt
function goToPrompt(promptId) {
    const shareLink = `${window.location.origin}${window.location.pathname}?prompt=${encodeURIComponent(promptId)}`;
    window.location.href = shareLink;
}

// Toggle like
function toggleLike(promptId) {
    const prompt = STATE.allPrompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const isLiked = localStorage.getItem(`liked_${promptId}`) === 'true';
    
    if (isLiked) {
        prompt.likes--;
        localStorage.setItem(`liked_${promptId}`, 'false');
    } else {
        prompt.likes++;
        localStorage.setItem(`liked_${promptId}`, 'true');
    }
    
    // Update likes in localStorage
    STATE.likes[promptId] = prompt.likes;
    localStorage.setItem('promptLikes', JSON.stringify(STATE.likes));
    
    // Re-render prompts
    renderPrompts();
    
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
        default:
            STATE.filteredPrompts = [...STATE.allPrompts];
    }
    
    renderPrompts();
}

// Reset filters
function resetFilters() {
    STATE.currentFilter = 'none';
    STATE.filteredPrompts = [...STATE.allPrompts];
    document.getElementById('searchInput').value = '';
    renderPrompts();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value.toLowerCase();
        applySearchFilter();
    });
    
    // Close modal on overlay click
    document.getElementById('shareOverlay').addEventListener('click', (e) => {
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
        if (STATE.currentFilter !== 'none') {
            filterPrompts(STATE.currentFilter);
        }
    } else {
        STATE.filteredPrompts = STATE.allPrompts.filter(prompt => 
            prompt.prompt.toLowerCase().includes(STATE.searchQuery) ||
            (prompt.tags && prompt.tags.toLowerCase().includes(STATE.searchQuery))
        );
    }
    
    renderPrompts();
}

// Check URL for prompt parameter
function checkUrlForPrompt() {
    const urlParams = new URLSearchParams(window.location.search);
    const promptId = urlParams.get('prompt');
    
    if (promptId) {
        setTimeout(() => {
            const promptElement = document.querySelector(`[data-id="${promptId}"]`);
            if (promptElement) {
                promptElement.scrollIntoView({ behavior: 'smooth' });
                
                // Add highlight effect
                promptElement.style.boxShadow = '0 0 0 3px var(--accent), 0 10px 30px rgba(0,0,0,0.2)';
                promptElement.style.transform = 'translateY(-10px)';
                
                // Show notification
                const t = TRANSLATIONS[STATE.currentLanguage];
                showNotification(t.share_message);
                
                // Remove highlight after 5 seconds
                setTimeout(() => {
                    promptElement.style.boxShadow = 'var(--shadow)';
                    promptElement.style.transform = 'translateY(0)';
                }, 5000);
            }
        }, 1000);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Show loading state
function showLoading() {
    const container = document.getElementById('promptsContainer');
    const t = TRANSLATIONS[STATE.currentLanguage] || TRANSLATIONS[CONFIG.DEFAULT_LANGUAGE];
    
    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--gray)">
            <i class="fas fa-spinner fa-spin fa-3x" style="margin-bottom:20px;"></i>
            <h3>${t.loading || 'Loading...'}</h3>
        </div>
    `;
}

// Show error state
function showError(error) {
    console.error('App error:', error);
    const container = document.getElementById('promptsContainer');
    const t = TRANSLATIONS[STATE.currentLanguage] || TRANSLATIONS[CONFIG.DEFAULT_LANGUAGE];
    
    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--gray)">
            <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom:20px; color:var(--accent);"></i>
            <h3>${t.error_loading || 'Error loading prompts'}</h3>
            <p style="margin-top:10px; font-size:14px;">${error.message || 'Please check your connection'}</p>
            <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:var(--primary); color:white; border:none; border-radius:5px; cursor:pointer;">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
                  }
