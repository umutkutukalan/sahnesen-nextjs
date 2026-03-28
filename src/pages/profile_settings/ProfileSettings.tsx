"use client";

import { useState } from "react";
import { profileSettingsOptions } from "../../constants";
import { useUser } from "../../context/UserContext";
import ProfileDetails from "@/components/profile_settings/ProfileDetails";
import SocialAccounts from "@/components/profile_settings/SocialAccounts";

const ProfileSettings = () => {
  const { user } = useUser();
  const [settingsTitle, setSettingsTitle] = useState("Hesap Bilgileri");
  return (
    <div className="page">
      <div className="w-full h-full flex">
        <div
          className="w-1/5 flex h-full flex-col gap-5 p-5 border-r border-gray-200"
          style={{ position: "sticky", top: "64px" }}
        >
          {profileSettingsOptions.map((option) => (
            <li
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => setSettingsTitle(option.title)}
            >
              {option.title}
            </li>
          ))}
        </div>
        <div className="w-4/5 h-full flex flex-col gap-5">
          {settingsTitle === "Hesap Bilgileri" && (
            <ProfileDetails user={user} />
          )}
          {settingsTitle === "Profiller" && <SocialAccounts user={user} />}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
