// CONFIGURATION FILE
const CONFIG = {
    // Google Sheets Configuration
    SHEET_ID: "1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY",
    SHEET_NAME: "Sheet1",
    
    // Telegram Bot Configuration
    TELEGRAM_BOT_USERNAME: "k4miran_sndi",
    TELEGRAM_SUPPORT_LINK: "https://t.me/k4miran_sndi",
    
    // Default Image (if no image in sheet)
    DEFAULT_IMAGE: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
    
    // Ads Configuration
    ADS_ENABLED: true,
    ADS_ID: 2423518,
    
    // App Settings
    DEFAULT_LANGUAGE: "en",
    ITEMS_PER_PAGE: 20,
    ENABLE_DARK_MODE: true
};

// State Management
const STATE = {
    allPrompts: [],
    filteredPrompts: [],
    currentFilter: 'none',
    currentLanguage: CONFIG.DEFAULT_LANGUAGE,
    likes: JSON.parse(localStorage.getItem('promptLikes')) || {},
    currentSharingPrompt: null,
    searchQuery: ''
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, STATE };
}
