/**
 * Cover/Kapak resmi için - kırpılmış görseli KALİTE KAYBI OLMADAN
 * makul bir dosya boyutuna indirir. Retina ekranları hesaba katar.
 */
export const compressCoverImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 2400, // Retina + geniş ekranlar için yeterli
      quality = 0.9,
      format = "image/jpeg",
    } = options;

    if (!file.type.startsWith("image/")) {
      reject(new Error("Geçerli bir resim dosyası değil"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let { width, height } = img;

          // SADECE maxWidth'ten büyükse küçült, küçükse dokunma
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Blob oluşturulamadı"));
                return;
              }
              const compressedFile = new File([blob], "cover.jpg", {
                type: format,
              });
              resolve(compressedFile); // File döndürüyor, base64 değil
            },
            format,
            quality,
          );
        } catch (error) {
          reject(new Error("Resim sıkıştırma hatası: " + error.message));
        }
      };
      img.onerror = () => reject(new Error("Resim yüklenemedi"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Dosya okuma hatası"));
    reader.readAsDataURL(file);
  });
};
