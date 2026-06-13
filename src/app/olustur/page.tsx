"use client";

import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import CreateProjectsBlogs from "@/pages/create/CreateProjectsBlogs";

export default function CreatePage() {

  // Project & Blog için içerik oluşturma sayfası

  return (
    <>
      <EditorNavbar transparent={false} />
      <CreateProjectsBlogs />;
    </>
  )
}
