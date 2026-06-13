"use client";

import Navbar from "@/components/navbar/Navbar";
import CreateProjectsBlogs from "@/pages/create/CreateProjectsBlogs";

export default function CreatePage() {

  // Project & Blog için içerik oluşturma sayfası

  return (
    <>
      <Navbar transparent={false} />
      <CreateProjectsBlogs />;
    </>
  )
}
