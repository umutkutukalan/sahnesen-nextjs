"use client";

import { CreateIntro } from "@/pages/create/CreateIntro";
import CreateProjectsBlogs from "@/pages/create/CreateProjectsBlogs";
import { useState } from "react";



export default function CreatePage() {
  const [resourceType, setResourceType] = useState<string>(""); // Varsayılan değer

  // Sayfa ilk açıldığında value seçilmeden hiçbir şey gösterme
  if (!resourceType) {
    return <CreateIntro setResourceType={setResourceType} />;
  }

  // Project & Blog için içerik oluşturma sayfası
  return <CreateProjectsBlogs resourceType={resourceType} />;
}
