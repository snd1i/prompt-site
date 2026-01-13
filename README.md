# AI Prompt Galerisi - Kurulum ve Kullanım Kılavuzu

Merhaba! Bu rehber, kodlama bilgisi olmayanlar için hazırlanmıştır. Aşağıdaki adımları takip ederek web sitenizi ücretsiz olarak yayınlayabilirsiniz.

## 📱 Telefondan GitHub'a Nasıl Yüklenir?

### 1. GitHub Hesabı Oluşturun
- Telefonunuzdan Chrome veya Safari ile [GitHub.com](https://github.com) sitesine gidin
- Sağ üst köşedeki "Sign up" (Kaydol) butonuna tıklayın
- E-posta, şifre ve kullanıcı adı girin
- Hesabınızı doğrulayın

### 2. Yeni Depo (Repository) Oluşturun
- GitHub ana sayfasında, yeşil "New" (Yeni) butonuna tıklayın
- "Repository name" (Depo adı) kısmına: `ai-prompt-galerisi` yazın
- "Public" (Herkese açık) seçeneğini işaretleyin
- "Initialize this repository with a README" seçeneğini İŞARETLEMEYİN
- Yeşil "Create repository" (Depo oluştur) butonuna tıklayın

### 3. Dosyaları GitHub'a Yükleyin
Oluşturduğunuz depo sayfasında:
1. "Add file" (Dosya ekle) butonuna tıklayın
2. "Upload files" (Dosya yükle) seçeneğini seçin
3. Bilgisayarınızdan şu 4 dosyayı seçin:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
4. "Commit changes" (Değişiklikleri kaydet) butonuna tıklayın

## 🌐 GitHub Pages Nasıl Açılır?

1. Deponuzun ana sayfasında (ai-prompt-galerisi)
2. Üst menüden "Settings" (Ayarlar) sekmesine tıklayın
3. Sol menüden "Pages" sayfasını seçin
4. "Branch" kısmında "main" seçin
5. "Save" (Kaydet) butonuna tıklayın
6. 1-2 dakika bekleyin
7. Yeşil kutuda sitenizin linki görünecek: `https://[kullanıcı-adınız].github.io/ai-prompt-galerisi/`

**Tebrikler!** Artık siteniz tüm dünyada erişilebilir durumda.

## 📊 Google Sheets Nasıl Düzenlenir?

### 1. Mevcut Sheet'i Kopyalayın
- [Bu Google Sheets linkine](https://docs.google.com/spreadsheets/d/1a4gxpaMg2gHNP9krJtVtqmDwMsvpY1KD1tqIes6zNNY/edit?usp=drivesdk) gidin
- "Dosya" menüsünden "Kopya oluştur" seçeneğini tıklayın
- Kendi Google Drive'ınıza kaydedin

### 2. Sheet'i Herkese Açık Yapın
- Kopyaladığınız Sheet'te, sağ üstteki "Paylaş" butonuna tıklayın
- "Genel erişim" bölümünde "Herkes" seçeneğini seçin
- Yanındaki açılır menüden "Görüntüleyen" seçin
- "Tamam" butonuna tıklayın

### 3. Sheet Linkinizi Alın
- Tarayıcınızın adres çubuğundaki linki kopyalayın
- Link şuna benzer olacak: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
- Bu linki `script.js` dosyasındaki 2. satırdaki `SHEET_ID` kısmına değiştirin:
  - Linkten `YOUR_SHEET_ID` kısmını bulun (uzun harf-rakam karışımı)
  - `const SHEET_ID = 'YOUR_SHEET_ID';` şeklinde değiştirin

## ➕ Yeni Prompt Nasıl Eklenir?

### 1. Google Sheets'e Gidin
- Kopyaladığınız Sheet'i açın

### 2. Yeni Satır Ekleme
- En alt satıra gidin
- Her sütun için bilgileri girin:

| Sütun Adı | Ne Yazılacak? |
|-----------|--------------|
| image | Resim URL'si (Unsplash, Imgur, vb.) |
| prompt_tr | Türkçe prompt metni |
| prompt_en | İngilizce prompt metni |
| prompt_ar | Arapça prompt metni |
| prompt_sorani | Kürtçe Sorani prompt metni |
| prompt_badini | Boş bırakın veya "Buraya Badini kelime girilecek" yazın |

### 3. Örnek Satır:
