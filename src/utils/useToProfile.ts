import { useRouter } from "next/navigation";
import { generateSlug } from "./GenerateSlug";

export const useToProfile = () => {
  const router = useRouter();
  const ToProfile = (username: string) => {
    console.log(username);
    const usernameSlug = generateSlug(username);
    router.push(`/profil/${usernameSlug}`);
  };
  return { ToProfile };
};
