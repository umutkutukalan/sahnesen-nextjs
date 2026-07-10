// services/client/user/user.service.ts

export interface UpdateUserData {
  name?: string;
  surname?: string;
  bio?: string;
}

export const getUserProfile = async (username: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("User profile alınırken hata:", error);
    throw error;
  }
};

export const getUserProfileMe = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("User profile alınırken hata:", error);
    throw error;
  }
};

export const updateUser = async (userData: UpdateUserData) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // withCredentials: true karşılığı
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata oluştu:", error);
    throw error;
  }
};

export const updateProfileImg = async (img: File) => {
  const form = new FormData();
  form.append("file", img);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/profile-image`,
      {
        method: "POST",
        credentials: "include",
        body: form,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.text();
  } catch (error) {
    console.error(
      "Kullanıcı profil fotoğrafı güncellenirken hata oluştu:",
      error,
    );
    throw error;
  }
};

export const updateCoverImg = async (img: File) => {
  const form = new FormData();
  form.append("file", img);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/me/cover-image`,
      {
        method: "POST",
        credentials: "include",
        body: form,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.text();
  } catch (error) {
    console.error(
      "Kullanıcı kapak fotoğrafı güncellenirken hata oluştu:",
      error,
    );
    throw error;
  }
};

export const userService = {
  getUserProfile,
  updateUser,
};
