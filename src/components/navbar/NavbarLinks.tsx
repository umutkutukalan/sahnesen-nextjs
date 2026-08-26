import Link from "next/link";
import React from "react";

interface NavLinksProps {
  href: string;
  logo: React.ReactNode;
  isLogin?: boolean; // String kıyaslaması yerine opsiyonel prop eklemek daha güvenlidir
}

const NavLinks = ({ href, logo, isLogin = false }: NavLinksProps) => {
  return (
    <li className="list-none">
      <Link
        href={href}
        className={`${
          isLogin
            ? "text-xs border-l pl-2 hover:text-gray-800 transition-all duration-100"
            : ""
        }`}
      >
        {logo}
      </Link>
    </li>
  );
};

export default NavLinks;
