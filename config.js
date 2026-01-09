// CONFIGURATION FILE
const CONFIG = {
    // Google Sheets Configuration
    SHEET_ID: "1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY",
    SHEET_NAME: "Sheet1",
    
    // Telegram Configuration
    TELEGRAM_BOT_USERNAME: "k4miran_sndi",
    TELEGRAM_SUPPORT_LINK: "https://t.me/k4miran_sndi",
    TELEGRAM_PROMPT_LINK: "https://t.me/PrompttAI_bot/Prompts",
    
    // Default Images
    DEFAULT_IMAGE: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    
    // New Prompt Days (how many days a prompt is considered "new")
    NEW_PROMPT_DAYS: 7,
    
    // App Settings
    DEFAULT_LANGUAGE: "en",
    ITEMS_PER_PAGE: 20,
    
    // Ads Configuration
    ADS_ENABLED: true,
    ADS_ID: 2423518
};

// State Management
const STATE = {
    allPrompts: [],
    filteredPrompts: [],
    currentFilter: 'all',
    currentLanguage: CONFIG.DEFAULT_LANGUAGE,
    likes: JSON.parse(localStorage.getItem('promptLikes')) || {},
    searchQuery: '',
    viewedNewPrompts: JSON.parse(localStorage.getItem('viewedNewPrompts')) || []
};
