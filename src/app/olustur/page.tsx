"use client";

import CreateProjectsBlogs from "@/pages/create/CreateProjectsBlogs";
import { Suspense } from "react";

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-black font-semibold">
          Yükleniyor...
        </div>
      }
    >
      <CreateProjectsBlogs />
    </Suspense>
  );
}
