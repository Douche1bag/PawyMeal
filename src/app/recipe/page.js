"use client"; // ✅ Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "../../components/Nav"; // Use relative path
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const RecipePage = () => {
  const [isClient, setIsClient] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetch(`${API_BASE}/menu`)
      .then((response) => response.json())
      .then((data) => {
        // If data is an array, use data directly
        const menus = Array.isArray(data) ? data : data.menus || data.data || [];
        console.log("Original URLs:", menus.map(m => m.image_url));

        const processedMenus = menus.map(menu => {
          const fileIdMatch = menu.image_url?.match(/[-\w]{25,}/);
          const fileId = fileIdMatch ? fileIdMatch[0] : null;
          return {
            ...menu,
            image_url: fileId 
              ? `https://lh3.googleusercontent.com/d/${fileId}`
              : menu.image_url
          };
        });

        console.log("Processed URLs:", processedMenus.map(m => m.image_url));
        setMenuItems(processedMenus || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading menu data:", error);
        setLoading(false);
      });
  }, []);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">Our Recipes</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((menu) => (
              <div
                key={menu.id || menu._id || menu.menu_id}
                className="p-3 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedMenu(menu)}
              >
                <div className="relative w-full h-32">
                  <Image
                    src={menu.image_url}
                    alt={menu.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md"
                    unoptimized
                  />
                </div>
                <h3 className="mt-2 text-md font-semibold text-center">{menu.name}</h3>
                <p className="text-gray-600 text-xs text-center">{menu.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Modal for selected menu */}
        {selectedMenu && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="relative w-full h-64">
                <Image
                  src={selectedMenu.image_url}
                  alt={selectedMenu.name}
                  fill
                  sizes="100vw"
                  className="object-cover rounded-t-lg"
                  unoptimized
                />
              </div>
              <div className="text-center p-4">
                <h3 className="text-xl font-bold">{selectedMenu.name}</h3>
                <p className="text-gray-600 text-sm">{selectedMenu.description}</p>
              </div>

              {/* Key Ingredients */}
              {selectedMenu.ingredients && selectedMenu.ingredients.length > 0 && (
                <div className="mt-4 px-4">
                  <h3 className="text-lg font-semibold text-center">Key Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMenu.ingredients.map((ingredient, index) => (
                      <div key={ingredient._id || ingredient.id || index} className="p-2 bg-white shadow-sm rounded-md text-center text-sm">
                        <h4 className="font-semibold">{ingredient.name}</h4>
                        <p className="text-gray-600">{ingredient.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4">
                <button
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  onClick={() => setSelectedMenu(null)}
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipePage;