// app/profile/[usernameSlug]/page.tsx
import Profile from "@/pages/profile/Profile";

export default async function ProfilePage({
    params
}: {
    params: Promise<{ usernameSlug: string }> // Promise olarak tip
}) {
    const { usernameSlug } = await params; // await ile unwrap
    return <Profile usernameSlug={usernameSlug} />;
}