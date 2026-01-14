// GOOGLE SHEETS - YENİ ID İLE
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

console.log("🚀 YENİ Sheets ID ile başlıyor:", SHEET_ID);

// TEST VERİLERİ (Sheets çalışmazsa)
const TEST_PROMPTS = [
    {
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop",
        prompt: "Futuristic AI city with neural networks"
    },
    {
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
        prompt: "Beautiful mountain landscape"
    }
];

let currentLanguage = 'en';

// SAYFA YÜKLENDİĞİNDE
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Web sitesi yüklendi");
    initLanguage();
    loadPrompts();
    setupImageProtection();
});

// DİL AYARLARI
function initLanguage() {
    document.getElementById('current-language').textContent = 'English';
    
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            currentLanguage = this.getAttribute('data-lang');
            document.getElementById('current-language').textContent = 
                currentLanguage === 'tr' ? 'Turkish' : 'English';
            updateLanguage();
        });
    });
}

function updateLanguage() {
    document.querySelectorAll('[data-tr]').forEach(el => {
        const text = el.getAttribute(`data-${currentLanguage}`);
        if (text) el.textContent = text;
    });
}

// PROMPTLARI YÜKLE
async function loadPrompts() {
    console.log("📥 Yeni Sheets'ten veri çekiliyor...");
    
    try {
        const response = await fetch(SHEET_URL);
        console.log("🔧 Response durumu:", response.status);
        
        if (response.ok) {
            const text = await response.text();
            console.log("📝 Veri alındı, işleniyor...");
            
            // JSON'u temizle
            const cleanText = text.replace(/^.*?{/, '{').replace(/\);?$/, '');
            const jsonData = JSON.parse(cleanText);
            
            if (jsonData.table && jsonData.table.rows && jsonData.table.rows.length > 1) {
                displaySheetsPrompts(jsonData.table);
            } else {
                throw new Error('Boş veri');
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error("❌ Sheets hatası:", error.message);
        console.log("🔄 Test verileri yükleniyor...");
        displayTestPrompts();
    }
}

// SHEETS VERİLERİNİ GÖSTER
function displaySheetsPrompts(table) {
    const container = document.getElementById('prompts-container');
    let html = '';
    let count = 0;
    
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
            let imageUrl = row.c[0].v.toString();
            const promptText = row.c[1].v.toString();
            
            // URL düzelt
            if (imageUrl.includes('w-800')) {
                imageUrl = imageUrl.replace('w-800', 'w=800');
            }
            
            html += createPromptCard(imageUrl, promptText);
            count++;
        }
    }
    
    if (count > 0) {
        console.log(`✅ ${count} prompt Sheets'ten yüklendi`);
        container.innerHTML = html;
    } else {
        console.log("📭 Sheets'te veri bulunamadı");
        displayTestPrompts();
    }
    
    setupCopyButtons();
}

// TEST VERİLERİNİ GÖSTER
function displayTestPrompts() {
    const container = document.getElementById('prompts-container');
    let html = '';
    
    TEST_PROMPTS.forEach(item => {
        html += createPromptCard(item.image, item.prompt);
    });
    
    // Hata mesajı ekle
    html += `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: white;">
            <p><small>⚠️ Google Sheets bağlantısı kontrol ediliyor...</small></p>
            <p><small>Sheets ID: ${SHEET_ID}</small></p>
            <button onclick="location.reload()" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">
                Sayfayı Yenile
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    setupCopyButtons();
}

// PROMPT KARTI OLUŞTUR
function createPromptCard(imageUrl, promptText) {
    return `
        <div class="prompt-card">
            <img src="${imageUrl}" alt="AI Image" class="prompt-image" loading="lazy">
            <div class="prompt-content">
                <div class="prompt-text-container">
                    <p class="prompt-text">${promptText}</p>
                    <div class="fade-overlay"></div>
                </div>
                <button class="copy-btn" data-prompt="${promptText.replace(/"/g, '&quot;')}">
                    <i class="far fa-copy"></i>
                    <span>${currentLanguage === 'tr' ? 'Kopyala' : 'Copy'}</span>
                </button>
            </div>
        </div>
    `;
}

// KOPYALA BUTONLARI
function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-prompt');
            navigator.clipboard.writeText(text).then(() => {
                const notification = document.getElementById('copy-notification');
                notification.classList.add('show');
                setTimeout(() => notification.classList.remove('show'), 2000);
            });
        });
    });
}

// RESİM KORUMA - BASILI TUTUNCA LINK GELMESİN
function setupImageProtection() {
    console.log("🛡️ Resim koruma aktif");
    
    // CSS EKLE
    const style = document.createElement('style');
    style.textContent = `
        /* RESİM LINK MENÜSÜNÜ ENGELLE */
        .prompt-image {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        }
        
        /* TIKLAMAYA İZİN VER, SADECE LINK MENÜSÜNÜ ENGELLE */
        .prompt-card {
            cursor: default;
        }
        
        .copy-btn {
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(style);
    
    // SAĞ TIKI ENGELLE
    document.addEventListener('contextmenu', function(e) {
        if (e.target.classList.contains('prompt-image')) {
            e.preventDefault();
            console.log("⛔ Resim link menüsü engellendi");
            return false;
        }
    });
    
    // SÜRÜKLEMEYİ ENGELLE
    document.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('prompt-image')) {
            e.preventDefault();
            return false;
        }
    });
    
    // RESİMLERE ÖZEL AYARLAR
    setTimeout(() => {
        document.querySelectorAll('.prompt-image').forEach(img => {
            img.setAttribute('draggable', 'false');
        });
    }, 1000);
}

console.log("✨ Script hazır! Yeni Sheets ID: " + SHEET_ID);
console.log("🔗 Test URL:", SHEET_URL);
