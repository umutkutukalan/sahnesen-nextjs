export const formatTag = (value: string) => {
  return (
    value
      .toLowerCase()
      .trim()
      // Türkçe karakter dönüşümleri
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      // Boşlukları ve özel karakterleri temizle (örneğin tire ile birleştir veya tamamen kaldır)
      .replace(/[^a-z0-9]/g, "")
  ); // Tamamen harf ve rakam bırakmak için (koşu -> kosu)
  // Eğer boşlukların tire olmasını istersen üstteki yerine: .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") kullanabilirsin.
};
