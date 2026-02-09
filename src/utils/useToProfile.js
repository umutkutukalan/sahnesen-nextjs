import { generateSlug } from "../utils/GenerateSlug";
import { useRouter } from "next/router";

export const useToProfile = () => {
  const router = useRouter();
  const ToProfile = (toUser, toUsername) => {
    const usernameSlug = generateSlug(toUsername);
    const id = toUser?.id;
    const username = toUser?.username;
    router.push(`/profil/${usernameSlug}`);
  };
  return { ToProfile };
};
