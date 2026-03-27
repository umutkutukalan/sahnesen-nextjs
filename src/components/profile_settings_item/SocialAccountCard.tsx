import {
  AiFillFacebook,
  AiFillGithub,
  AiFillInstagram,
  AiFillLinkedin,
  AiFillTwitterSquare,
  AiFillYoutube,
} from "react-icons/ai";
import EditAccounts from "./EditAccounts";
import { useState } from "react";

const SocialAccountCard = ({ account, onUpdate }) => {
  const [editSettings, setEditSettings] = useState(false);
  console.log("SocialAccountCard component - account:", account);
  return (
    <div
      className={`flex items-center gap-2 p-3 w-80 rounded-md border border-gray-200 hover:bg-gray-200 transition-all relative ${editSettings ? "cursor-default" : "cursor-pointer"}`}
      onClick={() => {
        if (!editSettings) setEditSettings(true);
      }}
    >
      <div className="absolute -left-1 -top-1">
        <div
          className={`w-3 h-3 rounded-full ${
            account.isPublic ? "bg-green-600" : "bg-red-600"
          }`}
        ></div>
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {account.platform === "Instagram" && (
            <AiFillInstagram className="text-2xl text-gray-700" />
          )}
          {account.platform === "Facebook" && (
            <AiFillFacebook className="text-2xl text-gray-700" />
          )}
          {account.platform === "YouTube" && (
            <AiFillYoutube className="text-2xl text-gray-700" />
          )}
          {account.platform === "Twitter" && (
            <AiFillTwitterSquare className="text-2xl text-gray-700" />
          )}
          {account.platform === "LinkedIn" && (
            <AiFillLinkedin className="text-2xl text-gray-700" />
          )}
          {account.platform === "Github" && (
            <AiFillGithub className="text-2xl text-gray-700" />
          )}
          <p className="text-sm">{account.username}</p>
        </div>
      </div>
      <EditAccounts
        editSettings={editSettings}
        setEditSettings={setEditSettings}
        account={account}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default SocialAccountCard;
