"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const SignupAndOrder = () => {
  const router = useRouter();
  const [allergies, setAllergies] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    neutered: "",
    allergies: [],
    bodyCondition: "",
    activeness: "",
  });

  useEffect(() => {
    // Load allergies from JSON file
    fetch("/data/sensitivity.json")
      .then((response) => response.json())
      .then((data) => {
        setAllergies(data.foodAllergies || []);
      })
      .catch((error) => {
        console.error("Error loading allergies:", error);
        setAllergies([]);
      });

    // Load dog breeds from JSON file
    fetch(`${API_BASE}/menu`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Menu data received:", data);
        // Process the menus and transform image URLs
        const menus = Array.isArray(data) ? data : data.data || [];
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
        setMenuData(processedMenus || []);
      })
      .catch((error) => {
        console.error("Error loading meals:", error);
        setMenuData([]);
      })
      .finally(() => {
        setLoading(false);
      });

    // Add new fetch for dog breeds
    fetch("/data/dogs.json")
      .then((response) => response.json())
      .then((data) => {
        setDogBreeds(data.dogs);
      })
      .catch((error) => console.error("Error loading dog breeds:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleAllergy = (name) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(name)
        ? prev.allergies.filter((a) => a !== name)
        : [...prev.allergies, name],
    }));
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => {
        const newStep = prev + 1;
        localStorage.setItem("petProfileStep", newStep);
        return newStep <= 9 ? newStep : prev;
      });
    }
  };

  const prevStep = () => {
    setStep((prev) => {
      const newStep = prev - 1;
      return newStep >= 1 ? newStep : prev;
    });
  };

  const validateStep = () => {
    if (step === 1 && !formData.name) return alert("Name is required.");
    if (step === 2 && !formData.dogName) return alert("Dog name is required.");
    if (step === 6 && formData.selectedMeals.length === 0) return alert("Please select at least one meal.");
    if (step === 6 && formData.selectedMeals.length > 2) return alert("You can select up to 2 meals.");
    if (step === 9 && !formData.address) return alert("Address is required.");
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.email || !formData.name || !formData.mobileNumber || !formData.password) {
        alert("Please fill in all required fields: name, email, mobile number, and password");
        return;
      }

      // Step 1: Save Customer data
      const customerData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        email: formData.email,
        address: formData.address || '',
        zipCode: formData.zipCode || '',
        city: formData.city || ''
      };

      console.log("Sending customer data:", customerData); // Debug log

      const customerResponse = await fetch(`${API_BASE}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const customerResult = await customerResponse.json();
      
      if (!customerResponse.ok) {
        throw new Error(customerResult.message || "Failed to create customer");
      }

      console.log("Customer created:", customerResult);

      // Step 2: Save Pet data with the customer_id
      const petResponse = await fetch(`${API_BASE}/pet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.dogName,
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          allergies: formData.allergies,
          age: parseInt(formData.age),
          active: formData.activeness,
          breed: formData.breed,
          body_conditions: formData.bodyCondition,
          neutered: formData.neutered === "true" || formData.neutered === true,
          customer_id: customerResult.customer.customer_id // Updated to access nested customer object
        }),
      });

      if (!petResponse.ok) {
        throw new Error("Failed to save pet data");
      }

      const petResult = await petResponse.json();
      console.log("Pet saved:", petResult); // Debug log

      // Step 3: Save Order data
      const price = formData.plan === "7 Days" ? 399.00 
                  : formData.plan === "14 Days" ? 699.00 
                  : 899.00;

      const orderResponse = await fetch(`${API_BASE}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: formData.plan,
          quantity: 1,
          price: price,
          date_order: new Date().toISOString().split('T')[0],
          customer_id: customerResult.customer.customer_id, // Updated to access nested customer object
          order_status: "Pending",
          selectedMeals: formData.selectedMeals
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Order error response:", errorText); // Debug log
        throw new Error(`Failed to save order data: ${errorText}`);
      }

      const orderResult = await orderResponse.json();
      console.log("Order saved:", orderResult); // Debug log

      // After successful submission
      alert("✅ Profile and order saved successfully!");
      // Store email for use in meal-login page
      localStorage.setItem("user", formData.email);
      // Redirect to meal-login page
      window.location.href = "/meal-login";

    } catch (error) {
      console.error("Submission error:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      {/* Step Navigation */}
      <div className="flex justify-start gap-4 text-gray-500 font-medium mb-6">
        <span className={`${step >= 1 ? "font-bold text-black underline" : ""}`}>1. Pet Profile</span>
        <span className={`${step >= 2 ? "font-bold text-black underline" : ""}`}>2. Dog Info</span>
        <span className={`${step >= 3 ? "font-bold text-black underline" : ""}`}>3. Body Condition & Activeness</span>
        <span className={`${step >= 4 ? "font-bold text-black underline" : ""}`}>4. Food Allergies</span>
        <span className={`${step >= 5 ? "font-bold text-black underline" : ""}`}>5. Meal Selection</span>
        <span className={`${step >= 6 ? "font-bold text-black underline" : ""}`}>6. Plan Selection</span>
        <span className={`${step >= 7 ? "font-bold text-black underline" : ""}`}>7. Order Summary</span>
        <span className={`${step >= 8 ? "font-bold text-black underline" : ""}`}>8. Address</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🐾 Pet Profile</h2>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-8">
        {/* Step 1: User Information */}
        {step === 1 && (
          <>
            <h3 className="text-lg font-semibold">Enter your information</h3>

            <label className="font-medium">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg"
              onChange={handleChange}
            />
            <label className="font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg"
              onChange={handleChange}
              required
            />
            <label className="font-medium">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Enter your mobile number"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={formData.mobileNumber}
              onChange={(e) => {
                const input = e.target.value.replace(/\D/g, "");
                if (input.length <= 10) {
                  setFormData({ ...formData, mobileNumber: input });
                }
              }}
              maxLength="10"
              required
            />
            <label className="font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg"
              onChange={handleChange}
            />

            <div className="flex justify-between mt-6">
              <Link href="/" className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</Link>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 2: Pet Information */}
        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold">Pet Information</h3>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Dog Name</label>
                <input
                  type="text"
                  name="dogName"
                  value={formData.dogName}
                  onChange={handleChange}
                  placeholder="Enter dog name"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight in kg"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Breed</label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                >
                  <option value="">Select breed</option>
                  {dogBreeds.map((breed, index) => (
                    <option key={index} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Neutered</label>
                <select
                  name="neutered"
                  value={formData.neutered}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                >
                  <option value="">Select option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 3: Body Condition & Activeness */}
        {step === 3 && (
          <>
            <h3 className="text-lg font-semibold">Body Condition & Activeness</h3>

            <label className="font-medium">Body Condition</label>
            <div className="flex gap-4">
              {["Skinny", "Moderate", "Overweight"].map((condition) => (
                <div
                  key={condition}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    formData.bodyCondition === condition ? "border-black bg-gray-100" : "border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, bodyCondition: condition })}
                >
                  {condition}
                </div>
              ))}
            </div>

            <label className="font-medium mt-4">Activeness</label>
            <div className="flex gap-4">
              {["Chilling", "Playful", "Super Active"].map((activity) => (
                <div
                  key={activity}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    formData.activeness === activity ? "border-black bg-gray-100" : "border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, activeness: activity })}
                >
                  {activity}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 4: Food Allergies */}
        {step === 4 && (
          <>
            <h3 className="text-lg font-semibold">Food Allergies or Sensitivity</h3>
            <p className="text-gray-600 mb-4">Select any food allergies your pet may have</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allergies.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                    formData.allergies.includes(item.name) 
                      ? "border-black bg-gray-100" 
                      : "border-gray-300"
                  }`}
                  onClick={() => toggleAllergy(item.name)}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-3xl mb-2">{item.icon}</span>
                    <span className="font-medium text-center">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected allergies: {formData.allergies.length > 0 
                  ? formData.allergies.join(", ") 
                  : "None"}
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 5: Meal Selection */}
        {step === 5 && (
          <>
            <h3 className="text-lg font-semibold">Recommend Meal</h3>
            <p className="text-gray-600 mb-4">You can select up to 2 recipes including your DIY meal</p>

            {loading ? (
              <div className="text-center py-4">Loading meals...</div>
            ) : menuData.length === 0 ? (
              <div className="text-center py-4">No meals available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuData.map((menu, index) => (
                  <div
                    key={menu.menu_id || index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                      formData.selectedMeals.includes(menu.name) 
                        ? "border-black bg-gray-100" 
                        : "border-gray-300"
                    }`}
                    onClick={() => {
                      let newSelection = [...formData.selectedMeals];
                      if (newSelection.includes(menu.name)) {
                        newSelection = newSelection.filter((item) => item !== menu.name);
                      } else if (newSelection.length < 2) {
                        newSelection.push(menu.name);
                      }
                      setFormData({ ...formData, selectedMeals: newSelection });
                    }}
                  >
                    <div className="relative w-full h-48">
                      <Image 
                        src={menu.image_url}
                        alt={menu.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-semibold mb-2 mt-4">{menu.name}</h4>
                    <p className="text-gray-600 text-sm">{menu.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 6: Plan Selection */}
        {step === 6 && (
          <>
            <h3 className="text-lg font-semibold">Choose your Plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                { days: "7 Days", price: "399 THB" },
                { days: "14 Days", price: "699 THB" },
                { days: "28 Days", price: "899 THB" },
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                    formData.plan === plan.days 
                      ? "border-black bg-gray-100" 
                      : "border-gray-300"
                  }`}
                  onClick={() => setFormData({ ...formData, plan: plan.days })}
                >
                  <h4 className="font-semibold text-lg mb-2">{plan.days}</h4>
                  <p className="text-xl font-bold mb-2">{plan.price}</p>
                  <p className="text-green-600">Free shipping</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 7: Order Summary */}
        {step === 7 && (
          <>
            <h3 className="text-lg font-semibold">Order Summary</h3>

            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan:</span>
                <span>{formData.plan}</span>
              </div>

              <div className="border-t pt-4">
                <span className="font-medium">Selected Meals:</span>
                {formData.selectedMeals.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {formData.selectedMeals.map((meal, index) => (
                      <li key={index} className="flex items-center">
                        <span>• {meal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mt-2">No meals selected</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-green-600">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    {formData.plan === "7 Days" 
                      ? "399 THB" 
                      : formData.plan === "14 Days" 
                        ? "699 THB" 
                        : "899 THB"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Next →</button>
            </div>
          </>
        )}

        {/* Step 8: Address Form */}
        {step === 8 && (
          <>
            <h3 className="text-lg font-semibold">Delivery Address</h3>

            <div className="space-y-4">
              <div>
                <label className="font-medium">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter zip code"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full p-3 border border-gray-300 rounded-lg mt-1"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-6 py-3 bg-gray-300 rounded-lg font-semibold">← Back</button>
              <button onClick={handleSubmit} className="px-6 py-3 bg-black text-white rounded-lg font-semibold">
                Confirm →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupAndOrder;