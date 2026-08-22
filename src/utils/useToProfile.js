import { useRouter } from "next/navigation";
import { generateSlug } from "../utils/GenerateSlug";

export const useToProfile = () => {
  const router = useRouter();
  const ToProfile = (toUsername) => {
    const usernameSlug = generateSlug(toUsername);
    router.push(`/profil/${usernameSlug}`);
  };
  return { ToProfile };
};
