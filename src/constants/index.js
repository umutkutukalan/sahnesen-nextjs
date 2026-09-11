export const profileAccount = [
  {
    title: "Hesap Bilgileri",
    href: `/profil/@`, // Bu dinamik olacak
    icon: "FiUser",
    dynamic: true,
    state: {}, // state objesi eklendi
  },
];

// Dinamik profil menüsü oluşturan fonksiyon
export const getProfileAccountWithUser = (user) => {
  return profileAccount.map((item) => {
    if (item.dynamic && item.title === "Hesap Bilgileri") {
      return {
        ...item,
        href: `/profil/${user?.username}`,
      };
    }
    return item;
  });
};

export const profileSettingsOptions = [
  {
    id: 1,
    title: "Hesap Bilgileri",
  },
  {
    id: 2,
    title: "Bağlantılar",
  },
  {
    id: 3,
    title: "Gizlilik Ayarları",
  },
  {
    id: 4,
    title: "Bildirim Ayarları",
  },
  {
    id: 5,
    title: "Tema Ayarları",
  },
];
