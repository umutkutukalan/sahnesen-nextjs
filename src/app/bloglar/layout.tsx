// app/bloglar/layout.tsx

import Navbar from "@/components/navbar/Navbar";


export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar transparent={false} />
      <div>
        {children}
      </div>
    </>
  );
}