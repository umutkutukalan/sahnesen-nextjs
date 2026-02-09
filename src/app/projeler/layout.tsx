// app/projeler/layout.tsx

import Navbar from "@/components/navbar/Navbar";


export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar transparent={false} />
      <div className="pt-16 min-h-screen">
        {children}
      </div>
    </>
  );
}