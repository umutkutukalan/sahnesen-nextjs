export const getOptimizedImageUrl = (url) => {
  if (!url) return "";

  // Google profil resmi ise boyutu artır
  if (url.includes("googleusercontent.com")) {
    // =s96-c yerine =s400-c kullan (400px boyut)
    return url.replace(/=s\d+-c/, "=s400-c");
  }

  return url;
};
