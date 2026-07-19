"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  isProfileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setProfileSidebarOpen: (open: boolean) => void;
  toggleProfileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileSidebarOpen, setProfileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleProfileSidebar = () => {
    setProfileSidebarOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        isProfileSidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        setProfileSidebarOpen,
        toggleProfileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
