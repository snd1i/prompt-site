// Bu dosya ESKİ SCRIPT DOSYANIZDAN BAĞIMSIZ
// enhanced-index.html ile kullanılacak

class PromptMasterPro {
    constructor() {
        this.init();
    }
    
    init() {
        // DOM yüklendiğinde çalışacaklar
        document.addEventListener('DOMContentLoaded', () => {
            this.animateStats();
            this.initScrollAnimations();
            this.initFloatingElements();
            this.addEventListeners();
            this.showWelcomeMessage();
        });
    }
    
    // İstatistikleri canlandır
    animateStats() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };
            
            // Görünür olduğunda başlat
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
            
            observer.observe(counter);
        });
    }
    
    // Scroll animasyonları
    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .community-content');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }
    
    // Yüzen elementler oluştur
    initFloatingElements() {
        const container = document.querySelector('.hero-section');
        if (!container) return;
        
        for (let i = 0; i < 15; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.width = Math.random() * 100 + 50 + 'px';
            element.style.height = element.style.width;
            element.style.left = Math.random() * 100 + '%';
            element.style.top = Math.random() * 100 + '%';
            element.style.background = `radial-gradient(circle, 
                rgba(255,255,255,${Math.random() * 0.1 + 0.05}) 0%, 
                rgba(255,255,255,0) 70%)`;
            element.style.animationDelay = Math.random() * 5 + 's';
            element.style.animationDuration = Math.random() * 10 + 10 + 's';
            
            container.appendChild(element);
        }
    }
    
    // Event listener'ları ekle
    addEventListeners() {
        // Telegram butonlarına tıklama
        document.querySelectorAll('[href*="t.me"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.currentTarget.href;
                console.log(`Opening Telegram: ${url}`);
                // İsterseniz analytics ekleyebilirsiniz
            });
        });
        
        // Ana sayfaya yönlendirme butonu
        const accessBtn = document.querySelector('[href="index.html"]');
        if (accessBtn) {
            accessBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }
    
    // Karşılama mesajı
    showWelcomeMessage() {
        console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 PromptMaster Pro - Enhanced Version Loaded!     ║
║                                                      ║
║   📢 Channel: https://t.me/sndiyi                    ║
║   👤 Admin: https://t.me/k4miran_sndi                ║
║   🎨 Access Prompts: index.html                      ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
        `);
        
        // İsterseniz bildirim de gösterebilirsiniz
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Welcome to PromptMaster Pro!', {
                body: 'Join our Telegram community @sndiyi',
                icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png'
            });
        }
    }
}

// Uygulamayı başlat
new PromptMasterPro();
