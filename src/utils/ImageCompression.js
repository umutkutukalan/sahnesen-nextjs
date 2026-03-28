/**
 * Resim sıkıştırma utility fonksiyonu
 * @param {File} file - Sıkıştırılacak resim dosyası
 * @param {Object} options - Sıkıştırma seçenekleri
 * @param {number} options.maxSize - Maksimum boyut (px) - varsayılan: 200
 * @param {number} options.quality - Kalite (0-1 arası) - varsayılan: 0.3
 * @param {string} options.format - Çıktı formatı - varsayılan: 'image/jpeg'
 * @returns {Promise<string>} - Sıkıştırılmış base64 string
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // Varsayılan ayarlar
    const { maxSize = 200, quality = 0.3, format = "image/jpeg" } = options;

    // Dosya tipini kontrol et
    if (!file.type.startsWith("image/")) {
      reject(new Error("Geçerli bir resim dosyası değil"));
      return;
    }

    // FileReader ile base64'e çevir
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;

      // Resmi sıkıştır
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Boyut hesaplama
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Resmi çiz ve sıkıştır
          // Anti-aliasing ve render kalitesi ayarları
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Keskin görüntü için özel ayarlar
          ctx.webkitImageSmoothingEnabled = true;
          ctx.mozImageSmoothingEnabled = true;
          ctx.msImageSmoothingEnabled = true;

          // Resmi çiz ve sıkıştır
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL(format, quality);

          console.log("🖼️ Resim Sıkıştırıldı:");
          console.log("📊 Original boyut:", base64String.length);
          console.log("📉 Sıkıştırılmış boyut:", compressedBase64.length);
          console.log("📐 Yeni boyutlar:", `${width}x${height}`);
          console.log("🎯 Kalite:", `${Math.round(quality * 100)}%`);

          resolve(compressedBase64);
        } catch (error) {
          reject(new Error("Resim sıkıştırma hatası: " + error.message));
        }
      };

      img.onerror = () => {
        reject(new Error("Resim yüklenemedi"));
      };

      img.src = base64String;
    };

    reader.onerror = () => {
      reject(new Error("Dosya okuma hatası"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Profil resmi için özel sıkıştırma
 * @param {File} file - Resim dosyası
 * @returns {Promise<string>} - Sıkıştırılmış base64 string
 */
export const compressProfileImage = (file) => {
  return compressImage(file, {
    maxSize: 800,
    quality: 0.8,
    format: "image/jpeg",
  });
};

/**
 * Profil border resmi için özel sıkıştırma (yüksek kalite)
 * @param {File} file - Resim dosyası
 * @returns {Promise<string>} - Sıkıştırılmış base64 string
 */
export const compressProfileBorder = (file) => {
  return compressImage(file, {
    maxSize: 1200, // Daha büyük boyut (800 → 1200)
    quality: 0.98, // Çok yüksek kalite (%80 → %95)
    format: "image/jpeg",
  });
};
