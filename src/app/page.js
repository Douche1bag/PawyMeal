"use client"; // Needed for useState and useEffect in Next.js

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userEmail = localStorage.getItem("user");
      if (userEmail) {
        const email = userEmail.replace(/"/g, "");
        try {
          const response = await fetch(`/api/customer?email=${email}`);
          const data = await response.json();
          if (data.success) {
            setIsLoggedIn(true);
            setUserInfo(data.customer);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
        }
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <Nav />
      <div className="flex justify-between items-center px-20 py-20">
        {/* Left Side Content */}
        <div className="w-1/2">
          <h1 className="text-4xl font-bold text-gray-800">Pawy Meal</h1>
          <p className="mt-4 text-gray-600 text-lg max-w-md">
            SWITCHING YOUR DOG'S DIET TO FRESH FOOD PROMOTES A HEALTHY MIND &
            BODY WHILE INCREASING THEIR LONG LIFESPAN
          </p>

          {/* Get Started/Order Meal Button */}
          <Link href={isLoggedIn ? "/meal-login" : "/PetProfile"}>
            <button className="mt-6 px-6 py-3 text-white bg-gray-800 hover:bg-gray-600 rounded-md transition">
              {isLoggedIn ? "Order Meal" : "Get Started"}
            </button>
          </Link>
        </div>

        {/* Right Side - Image */}
        <div className="w-1/2 h-[700px] flex justify-center items-center border border-gray-300 rounded-lg">
          <img
            src="https://cdn.theatlantic.com/thumbor/o4vuSvQcVHA2k4VcY8Kg2ry683s=/144x320:3006x2466/1200x900/media/img/mt/2018/10/GettyImages_521915123/original.jpg"
            alt="Dog eating at table"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
