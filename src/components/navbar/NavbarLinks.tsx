import Link from "next/link";

interface NavLinksProps {
  href: string;
  logo: React.ReactNode;
}

const NavLinks = ({ href, logo }: NavLinksProps) => {
  const isLogin = logo === "Giris Yap";

  return (
    <li className={`list-none`}>
      <Link
        href={href}
        className={` ${isLogin && "text-xs border-l pl-2 hover:text-gray-800 transition-all duration-100"}`}
      >
        {logo}
      </Link>
    </li>
  );
};

export default NavLinks;
