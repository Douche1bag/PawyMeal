"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

const Settings = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState(null);
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allergyOptions, setAllergyOptions] = useState([]);
  const [orders, setOrders] = useState([]);

  // Get logged-in user email
  const email = typeof window !== "undefined"
    ? localStorage.getItem("user")?.replace(/"/g, "")
    : null;

  useEffect(() => {
    if (!email) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch customer data
        const customerResponse = await fetch(`/api/customer?email=${email}`);
        const customerResult = await customerResponse.json();

        if (!customerResult.success) {
          setError(customerResult.message);
          return;
        }

        // Fetch pet data using customer_id
        const petResponse = await fetch(`/api/pet?customer_id=${customerResult.customer.customer_id}`);
        const petResult = await petResponse.json();

        // Fetch orders
        const orderResponse = await fetch(`/api/order?customer_id=${customerResult.customer.customer_id}`);
        const orderResult = await orderResponse.json();

        setUserData(customerResult.customer);
        setPetData(petResult.pet);
        setOrders(orderResult.orders || []);

      } catch (error) {
        console.error("Fetch Error:", error);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  useEffect(() => {
    // Set active tab from URL parameter if present
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (activeTab === "dog") {
      setPetData(prev => ({ ...prev, [name]: value }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      let response, result;
      
      if (activeTab === "dog" && petData) {
        // Convert neutered to boolean before sending
        const processedPetData = {
          ...petData,
          neutered: petData.neutered === "true",
          weight: parseFloat(petData.weight),
          age: parseInt(petData.age),
        };

        response = await fetch("/api/pet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedPetData),
        });
      } else if (userData) {
        response = await fetch("/api/customer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Server returned empty response');
      }

      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }

      alert("✅ Profile updated successfully!");
      
      // Refresh the data instead of reloading the page
      if (activeTab === "dog") {
        const petResponse = await fetch(`/api/pet?customer_id=${userData.customer_id}`);
        const petResult = await petResponse.json();
        if (petResult.success) {
          setPetData(petResult.pet);
        }
      } else {
        const customerResponse = await fetch(`/api/customer?email=${email}`);
        const customerResult = await customerResponse.json();
        if (customerResult.success) {
          setUserData(customerResult.customer);
        }
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("❌ Failed to update profile: " + error.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!orderId) return;

    const confirmCancel = confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const response = await fetch(`/api/order/${orderId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ Order cancelled successfully!");
        setOrders(orders.filter(order => order.order_id !== orderId));
      } else {
        alert("❌ Failed to cancel order: " + result.message);
      }
    } catch (error) {
      console.error("Cancel Order Error:", error);
      alert("❌ Failed to cancel order: " + error.message);
    }
  };

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const response = await fetch("/data/sensitivity.json"); // Ensure this file exists!
        const data = await response.json();
        setAllergyOptions(data.foodAllergies || []);
      } catch (error) {
        console.error("Error loading allergy data:", error);
      }
    };

    fetchAllergies();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!userData || !petData) return <p>No data found.</p>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 p-6">
        <Link
          href="/"
          className="text-2xl font-bold uppercase tracking-wide text-gray-800 hover:text-red-500 transition"
        >
          LOGO
        </Link>
        <ul className="mt-6 space-y-3">
          <li
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "personal" ? "font-bold bg-gray-300" : ""
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </li>
          <li
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "dog" ? "font-bold bg-gray-300" : ""
            }`}
            onClick={() => setActiveTab("dog")}
          >
            Your Dog
          </li>
          <li
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "address" ? "font-bold bg-gray-300" : ""
            }`}
            onClick={() => setActiveTab("address")}
          >
            Address
          </li>
          <li
            className={`cursor-pointer p-2 rounded-md ${
              activeTab === "orders" ? "font-bold bg-gray-300" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </li>
        </ul>
        <Link
          href="/"
          className="block mt-6 bg-black text-white py-2 text-center rounded-md hover:bg-gray-700 transition"
        >
          Back to Home
        </Link>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        {/* Personal Information */}
        {activeTab === "personal" && (
          <div className="flex flex-col space-y-4">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={userData?.name || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile_no"
              value={userData?.mobile_no || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={userData?.email || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
              readOnly // Email should not be editable
            />

            <button 
              onClick={handleUpdate}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Dog Information */}
        {activeTab === "dog" && (
          <div className="flex flex-col space-y-4">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={petData.name || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Gender</label>
            <select
              name="gender"
              value={petData.gender || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <label>Age</label>
            <input
              type="number"
              name="age"
              value={petData.age || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={petData.weight || ""}
              onChange={handleChange}
              step="0.1"
              className="border p-2 rounded-md"
            />

            <label>Breed</label>
            <input
              type="text"
              name="breed"
              value={petData.breed || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Neutered</label>
            <select
              name="neutered"
              value={petData.neutered || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <button 
              onClick={handleUpdate}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Address Information */}
        {activeTab === "address" && (
          <div className="flex flex-col space-y-4">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={userData?.address || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>Zip Code</label>
            <input
              type="text"
              name="zipcode"
              value={userData?.zipcode || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <label>City</label>
            <input
              type="text"
              name="city"
              value={userData?.city || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />

            <button 
              onClick={handleUpdate}
              className="bg-black text-white py-2 rounded-md hover:bg-gray-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold">Your Orders</h2>
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order.order_id} className="p-4 border rounded-lg shadow">
                  <p><strong>Menu:</strong> {order.menu_names ? 
                    Array.isArray(order.menu_names) ? 
                      order.menu_names.join(", ") : 
                      order.menu_names
                    : "No menu selected"}
                  </p>
                  <p><strong>Plan:</strong> {order.plan}</p>
                  <p><strong>Price:</strong> {order.price} THB</p>
                  <p><strong>Order Date:</strong> {new Date(order.date_order).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {order.order_status}</p>
                  
                  {order.order_status === "Pending" && (
                    <button
                      onClick={() => handleCancelOrder(order.order_id)}
                      className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
