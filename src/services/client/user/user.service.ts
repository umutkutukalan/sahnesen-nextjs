export const getUserProfile = async (username: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    
    console.log("Response status:", response.status); // ekle
    console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`); // ekle
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("User profile alınırken hata:", error);
    throw error;
  }
};