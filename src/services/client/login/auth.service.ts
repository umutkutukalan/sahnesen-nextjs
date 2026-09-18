export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password?email=${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error: ${response.status}`);
    }

    return response.text();
  } catch (error) {
    console.error("Şifre sıfırlama maili gönderilirken hata oluştu:", error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error: ${response.status}`);
    }

    return response.text();
  } catch (error) {
    console.error("Şifre sıfırlanırken hata oluştu:", error);
    throw error;
  }
};
