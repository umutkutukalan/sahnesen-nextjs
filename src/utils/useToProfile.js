import { useRouter } from "next/navigation";
import { generateSlug } from "../utils/GenerateSlug";


export const useToProfile = () => {
  const router = useRouter();
  const ToProfile = (toUser, toUsername) => {
    const usernameSlug = generateSlug(toUsername);
    const id = toUser?.id;
    const username = toUser?.username;
    router.push(`/profile/${usernameSlug}`);
  };
  return { ToProfile };
};
