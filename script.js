// Google Sheets
const SHEET_ID = '16GwAXZyYn109Bji4j--Ym9a-GG4b3oTkwP0bdQGnHkM';
const SHEET_NAME = 'Sheet1';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

let currentLanguage = 'en';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Site yüklendi");
    loadPrompts();
});

// Sheets'ten veri çek
async function loadPrompts() {
    console.log("📥 Veriler yükleniyor...");
    
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const jsonStr = text.replace("google.visualization.Query.setResponse(", "").replace(/\);?$/, "");
        const jsonData = JSON.parse(jsonStr);
        
        console.log("📊 Veri alındı, işleniyor...");
        
        const prompts = [];
        const rows = jsonData.table.rows || [];
        
        // Tüm satırları işle
        rows.forEach((row, index) => {
            if (row.c && row.c[0] && row.c[0].v && row.c[1] && row.c[1].v) {
                const imageVal = row.c[0].v.toString();
                const promptVal = row.c[1].v.toString();
                
                // Başlık satırını atla
                if (index === 0 && (imageVal === 'image' || promptVal === 'prompt')) {
                    console.log("📝 Başlık atlandı");
                    return;
                }
                
                // URL düzelt
                let imageUrl = imageVal;
                if (imageUrl.includes('w-800')) {
                    imageUrl = imageUrl.replace('w-800', 'w=800');
                }
                
                prompts.push({
                    image: imageUrl,
                    prompt: promptVal
                });
            }
        });
        
        console.log(`✅ ${prompts.length} prompt bulundu`);
        
        if (prompts.length > 0) {
            displayPrompts(prompts);
        } else {
            document.getElementById('prompts-container').innerHTML = `
                <div class="no-prompts">
                    <i class="fas fa-image"></i>
                    <p>Henüz prompt eklenmemiş</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById('prompts-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Veri yüklenemedi: ${error.message}</p>
                <button onclick="location.reload()">Tekrar Dene</button>
            </div>
        `;
    }
}

// Promptları göster
function displayPrompts(prompts) {
    const container = document.getElementById('prompts-container');
    container.innerHTML = '';
    
    prompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <img src="${prompt.image}" alt="AI Image" class="prompt-image">
            <div class="prompt-content">
                <p class="prompt-text">${prompt.prompt}</p>
                <button class="copy-btn" onclick="navigator.clipboard.writeText('${prompt.prompt.replace(/'/g, "\\'")}')">
                    <i class="far fa-copy"></i> Kopyala
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

console.log("✨ Script hazır!");
