import Navbar from "@/components/navbar/Navbar";
import ProfileSidebar from "@/components/sidebar/ProfileSidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Navbar transparent={false} isProfile={true} />
        <div className="flex min-h-screen">
          <ProfileSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
