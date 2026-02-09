// import {
//   createProject,
//   createBlog,
//   createMusic,
//   profile2,
//   profile,
// } from "../utils";

import { generateSlug } from "../utils/GenerateSlug";

// export const images = {
//   projects: createProject,
//   blogs: createBlog,
//   musics: createMusic,
// };

export const artists = [
  {
    name: "Umut Kutukalan",
    description: "Web Developer, Musician, and Content Creator",
    socialLinks: {
      github: "github.com/umutkutukalan",
      linkedin: "linkedin.com/in/umutkutukalan",
      twitter: "twitter.com/umutkutukalan",
      instagram: "instagram.com/umutkutukalan",
      youtube: "youtube.com/umutkutukalan",
    },
    // profileImage: profile2,
  },
  {
    name: "Jane Doe",
    description: "Full Stack Developer and Tech Enthusiast",
    socialLinks: {
      github: "github.com/janedoe",
      linkedin: "linkedin.com/in/janedoe",
      twitter: "twitter.com/janedoe",
      instagram: "instagram.com/janedoe",
      youtube: "youtube.com/janedoe",
    },
    // profileImage: profile2,
  },
  {
    name: "John Smith",
    description: "Software Engineer and Open Source Contributor",
    socialLinks: {
      github: "github.com/johnsmith",
      linkedin: "linkedin.com/in/johnsmith",
      twitter: "twitter.com/johnsmith",
      instagram: "instagram.com/johnsmith",
      youtube: "youtube.com/johnsmith",
    },
    // profileImage: profile,
  },
  {
    name: "Alice Johnson",
    description: "Data Scientist and AI Researcher",
    socialLinks: {
      github: "github.com/alicejohnson",
      linkedin: "linkedin.com/in/alicejohnson",
      twitter: "twitter.com/alicejohnson",
      instagram: "instagram.com/alicejohnson",
      youtube: "youtube.com/alicejohnson",
    },
    // profileImage: profile,
  },
];

export const profileAccount = [
  {
    title: "Hesap Bilgileri",
    href: `/profil/@`, // Bu dinamik olacak
    icon: "FiUser",
    dynamic: true,
    state: {}, // state objesi eklendi
  },
  {
    title: "Projelerim",
    href: "/projeler", // Bu dinamik olacak
    icon: "RiComputerFill",
    dynamic: true, // Bu field'ı ekleyerek dinamik olduğunu belirtiyoruz
    state: {},
  },
  {
    title: "Bloglarım",
    href: "/bloglar",
    icon: "IoIosPaper",
    dynamic: true,
    state: {},
  },
];

// Dinamik profil menüsü oluşturan fonksiyon
export const getProfileAccountWithUser = (user) => {
  const usernameSlug = generateSlug(user?.username);
  return profileAccount.map((item) => {
    if (item.dynamic && item.title === "Projelerim" && user?.name) {
      return {
        ...item,
        href: `/${user.name}/projeler`,
      };
    } else if (item.dynamic && item.title === "Hesap Bilgileri") {
      return {
        ...item,
        href: `/profil/@${usernameSlug}`,
        state: { user },
      };
    } else if (item.dynamic && item.title === "Bloglarım" && user?.name) {
      return {
        ...item,
        href: `/${user.name}/bloglar`,
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
    title: "Profiller",
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
