"use client"; // Needed for useState and useEffect in Next.js

import Link from "next/link";
import { useRouter } from "next/navigation";

const Nav = () => {
  const router = useRouter();
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex justify-between items-center px-20 py-6">
      <Link href="/" className="text-2xl font-bold">
        LOGO
      </Link>
      <div className="flex gap-4">
        <Link href="/recipe">
          <button className="px-4 py-2 rounded-md hover:bg-gray-100">Recipe</button>
        </Link>
        <Link href="/setting">
          <button className="px-4 py-2 rounded-md hover:bg-gray-100">Setting</button>
        </Link>
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700"
          >
            Logout
          </button>
        ) : (
          <Link href="/login">
            <button className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Nav;
