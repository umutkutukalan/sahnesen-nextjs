import Link from "next/link";
import React from "react";

interface NavLinksProps {
  href: string;
  logo: React.ReactNode;
  isLogin?: boolean; // String kıyaslaması yerine opsiyonel prop eklemek daha güvenlidir
  badgeCount?: number;
}

const NavLinks = ({
  href,
  logo,
  isLogin = false,
  badgeCount,
}: NavLinksProps) => {
  return (
    <li className="list-none relative flex items-center justify-center">
      <Link
        href={href}
        className={`relative inline-block ${
          isLogin
            ? "text-xs border-l pl-2 hover:text-gray-800 transition-all duration-100"
            : ""
        }`}
      >
        {/* Eğer okunmamış bildirim varsa rozeti logonun üzerine konumlandırıyoruz */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <div className="absolute -top-3 -right-2 min-w-[20px] min-h-[20px] rounded-sm flex items-center justify-center z-10 shadow-sm">
            <div className="w-[8px] px-2 min-h-[16px] rounded-sm bg-green-900 flex items-center justify-center">
              <p className="text-white text-[10px] font-medium leading-none">
                {badgeCount}
              </p>
            </div>
          </div>
        )}
        {logo}
      </Link>
    </li>
  );
};

export default NavLinks;
