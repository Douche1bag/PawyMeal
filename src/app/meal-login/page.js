"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Nav from "../../components/Nav";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const MealLogin = () => {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    { name: '7 Days', price: 399 },
    { name: '14 Days', price: 699 },
    { name: '30 Days', price: 999 }
  ];

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`${API_BASE}/menu`);
        const data = await response.json();
        
        if (data.success) {
          // Process the menus and transform image URLs
          const processedMenus = data.menus.map(menu => {
            // Extract the file ID from the URL
            const fileIdMatch = menu.image_url.match(/[-\w]{25,}/);
            const fileId = fileIdMatch ? fileIdMatch[0] : null;
            
            return {
              ...menu,
              image_url: fileId 
                ? `https://lh3.googleusercontent.com/d/${fileId}`
                : menu.image_url,
              ingredients: Array.isArray(menu.ingredients) 
                ? menu.ingredients.map(ing => ({
                    id: ing.ingredient_id,
                    name: ing.name || 'Unknown',
                    description: ing.description || 'No description available'
                  }))
                : []
            };
          });
          setMenus(processedMenus);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Failed to fetch menus');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const handleMealSelection = (menuId) => {
    setSelectedMeals(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  const handleSubmitOrder = async () => {
    if (!selectedPlan) {
      alert("Please select a plan");
      return;
    }
    if (selectedMeals.length === 0) {
      alert("Please select at least one meal");
      return;
    }

    const userEmail = localStorage.getItem("user");
    if (!userEmail) {
      alert("Please log in to place an order");
      return;
    }

    try {
      // First get customer_id from email
      const customerResponse = await fetch(`${API_BASE}/customer?email=${userEmail.replace(/"/g, "")}`);
      const customerData = await customerResponse.json();
      
      if (!customerData.success || !customerData.customer) {
        throw new Error("Customer not found");
      }

      const planPrice = plans.find(p => p.name === selectedPlan)?.price || 0;

      const orderData = {
        email: userEmail.replace(/"/g, ""),
        plan: selectedPlan,
        quantity: 1, // Add default quantity
        price: planPrice,
        date_order: new Date().toISOString().split('T')[0],
        customer_id: customerData.customer.customer_id,
        order_status: 'Pending',
        selectedMeals: selectedMeals
      };

      console.log("Sending order data:", orderData); // Debug log

      const response = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Order placed successfully!");
        router.push('/setting?tab=orders');
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">Our Meals</h1>

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`p-4 border rounded-lg ${
                  selectedPlan === plan.name 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm">{plan.price} THB</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Menu Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menus.map((menu) => (
            <div 
              key={menu.menu_id} 
              className={`border rounded-lg overflow-hidden shadow-lg cursor-pointer ${
                selectedMeals.includes(menu.menu_id) ? 'ring-2 ring-gray-800' : ''
              }`}
              onClick={() => handleMealSelection(menu.menu_id)}
            >
              <div className="relative w-full h-48">
                <Image 
                  src={menu.image_url}
                  alt={menu.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{menu.name}</h3>
                <p className="text-gray-600 mb-4">{menu.description}</p>
                
                {menu.ingredients && menu.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside">
                      {menu.ingredients.map((ingredient, index) => (
                        <li key={ingredient.id || index} className="text-gray-600">
                          {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary and Submit Button */}
        <div className="mt-8 text-center">
          <p className="mb-4">
            Selected Plan: {selectedPlan || 'None'} <br />
            Selected Meals: {selectedMeals.length}
          </p>
          <button
            onClick={handleSubmitOrder}
            disabled={!selectedPlan || selectedMeals.length === 0}
            className={`px-8 py-3 rounded-lg ${
              !selectedPlan || selectedMeals.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealLogin;
