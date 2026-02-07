// Türkçe karakterleri İngilizce'ye çeviren ve URL dostu hale getiren fonksiyon
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\s-]/g, "") // Özel karakterleri kaldır
    .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
    .replace(/-+/g, "-") // Birden fazla tireyi tek bir tireye indir
    .trim();
};