// services/client/user/user.service.ts

export interface UpdateUserData {
    name?: string;
    surname?: string;
    bio?: string;
}

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

        console.log("Response status:", response.status);
        console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`);

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
            `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
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

export const userService = {
    getUserProfile,
    updateUser,
};