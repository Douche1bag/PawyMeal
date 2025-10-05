"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const SettingsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [allergyOptions, setAllergyOptions] = useState([]);


  // Get logged-in user data from session
  const getUserSession = () => {
    if (typeof window === "undefined") return null;
    try {
      const session = localStorage.getItem('userSession');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error parsing user session:', error);
      return null;
    }
  };

  const userSession = getUserSession();
  const email = userSession?.email || searchParams.get('email');

  // Redirect to login if no user session
  useEffect(() => {
    if (!userSession && !searchParams.get('email')) {
      console.log('No user session found, redirecting to login');
      router.push('/login');
      return;
    }
  }, [userSession, searchParams, router]);

  // Debug logging
  useEffect(() => {
    console.log('User session:', userSession);
    console.log('Using email:', email);
  }, [userSession, email]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching customer data for email:', email);
        
        // Fetch customer data by email
        const customerResponse = await fetch(`${API_BASE}/customer?email=${email}`);
        const customerResult = await customerResponse.json();
        
        console.log('Customer API response:', customerResult);

        if (!customerResult.success || !customerResult.data) {
          console.error('Customer fetch failed:', customerResult.error || 'No data returned');
          setError(`Unable to load user data for ${email}. Please try logging in again.`);
          return;
        }

        const customer = customerResult.data;
        console.log('Successfully loaded customer data:', customer);

        console.log('Loaded customer data:', customer);
        setUserData(customer);

        // Fetch orders using email-based system
        try {
          const orderResponse = await fetch(`${API_BASE}/order?customer_email=${encodeURIComponent(email)}`);
          const orderResult = await orderResponse.json();
          
          if (orderResult.success && orderResult.data) {
            setOrders(Array.isArray(orderResult.data) ? orderResult.data : []);
            console.log('Loaded orders:', orderResult.data);
          } else {
            setOrders([]);
            console.log('No orders found for customer');
          }
        } catch (orderError) {
          console.error('Order fetch error:', orderError);
          setOrders([]);
        }

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
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      let response, result;
      
      if (userData) {
        // Include the customer ID in the update request
        const updateData = {
          ...userData,
          id: userData._id // The API expects 'id', not '_id'
        };
        
        response = await fetch(`${API_BASE}/customer`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
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

      alert("User information updated successfully!");
      
      // Refresh the user data
      const customerResponse = await fetch(`${API_BASE}/customer?email=${email}`);
      const customerResult = await customerResponse.json();
      if (customerResult.success && customerResult.data) {
        setUserData(customerResult.data);
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
      const response = await fetch(`${API_BASE}/order/${orderId}`, {
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <p>Loading user settings...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p className="text-red-500 mb-4">{error}</p>
      <div className="space-x-4">
        <Link href="/customer/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to Home
        </Link>
        <Link href="/login" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Login
        </Link>
      </div>
    </div>
  );

  // Show error if no user data
  if (!userData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-gray-500 mb-4">No user data available. Please log in or register.</p>
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Login
          </Link>
          <Link href="/register" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                ← Back to Home
              </Link>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome, {userData?.name || userData?.email || 'User'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen p-6">
        <div className="space-y-1">
          <Link
            href="/customer/dashboard"
            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition block"
          >
            ← Dashboard
          </Link>
        </div>
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
              name="phone"
              value={userData?.phone || userData?.mobile_no || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
              placeholder="Enter your mobile number"
            />

            <label>Address</label>
            <textarea
              name="address"
              value={userData?.address || ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
              placeholder="Enter your address"
              rows="3"
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
    </div>
  );
};

// Main component with Suspense boundary
const Settings = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading Settings...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
};

export default Settings;
