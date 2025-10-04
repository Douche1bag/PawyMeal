"use client"; // Needed for useState and useEffect in Next.js

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PetsIcon from "@mui/icons-material/Pets";

const Nav = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for user session on client side only
  useEffect(() => {
    const getUserSession = () => {
      try {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
      } catch (error) {
        return null;
      }
    };
    
    const userSession = getUserSession();
    setIsLoggedIn(userSession !== null);
    setIsLoading(false);
  }, []);
  
  // Don't render auth-dependent content until client-side hydration is complete
  if (isLoading) {
    return (
      <nav className="flex justify-between items-center px-20 py-6">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <PetsIcon sx={{ fontSize: 32, color: '#FF6B35' }} />
          <span>Pawy Meal</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/recipe">
            <button className="px-4 py-2 rounded-md hover:bg-gray-100">Recipe</button>
          </Link>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    // Clear all session data
    localStorage.removeItem("userSession");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="flex justify-between items-center px-20 py-6">
      <Link href="/" className="text-2xl font-bold flex items-center gap-2">
        <PetsIcon sx={{ fontSize: 32, color: '#FF6B35' }} />
        <span>Pawy Meal</span>
      </Link>
      <div className="flex gap-4">
        <Link href="/recipe">
          <button className="px-4 py-2 rounded-md hover:bg-gray-100">Recipe</button>
        </Link>
        {isLoggedIn && (
          <Link href="/setting">
            <button className="px-4 py-2 rounded-md hover:bg-gray-100">Setting</button>
          </Link>
        )}
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
