"use client"; // Needed for useState and useEffect in Next.js

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Avatar
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";

// QuickOrderModal component
const QuickOrderModal = ({ open, onClose, onSubmit, loading, pets, menus, setMenus, plans }) => {
  const [orderData, setOrderData] = useState({
    plan: '7 Days',
    selectedMenu: '',
    selectedPet: ''
  });
  const [menuLoading, setMenuLoading] = useState(false);

  // Fetch menus when modal opens
  useEffect(() => {
    if (open) {
      fetchMenus();
    }
  }, [open]);

  const fetchMenus = async () => {
    try {
      setMenuLoading(true);
      const response = await fetch('/api/menu');
      const data = await response.json();
      if (data.success) {
        setMenus(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  // Check if a menu item contains ingredients that conflict with pet allergies
  const checkAllergyConflict = (menu, pet) => {
    if (!pet || !pet.allergies || !Array.isArray(pet.allergies) || pet.allergies.length === 0) {
      return { hasConflict: false, conflictingIngredients: [] };
    }
    
    if (!menu || !menu.ingredients || !Array.isArray(menu.ingredients)) {
      return { hasConflict: false, conflictingIngredients: [] };
    }
    
    const petAllergies = pet.allergies.map(allergy => allergy.toLowerCase().trim());
    const menuIngredients = menu.ingredients.map(ingredient => ingredient.toLowerCase().trim());
    
    const conflictingIngredients = menuIngredients.filter(ingredient => 
      petAllergies.some(allergy => 
        ingredient.includes(allergy) || allergy.includes(ingredient)
      )
    );
    
    return {
      hasConflict: conflictingIngredients.length > 0,
      conflictingIngredients
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedPlan = plans.find(p => p.name === orderData.plan);
    const selectedMenuObj = menus.find(m => m.id === orderData.selectedMenu);
    const selectedPetObj = pets.find(p => p._id === orderData.selectedPet);
    
    // Check for allergy conflicts before submitting
    if (selectedPetObj && selectedMenuObj) {
      const allergyCheck = checkAllergyConflict(selectedMenuObj, selectedPetObj);
      if (allergyCheck.hasConflict) {
        alert(`⚠️ Cannot place order: ${selectedPetObj.name} is allergic to ingredients in this meal (${allergyCheck.conflictingIngredients.join(', ')}). Please select a different menu item.`);
        return;
      }
    }
    
    const orderPayload = {
      plan: orderData.plan,
      quantity: 1,
      price: selectedPlan.price,
      date_order: new Date(),
      order_status: 'pending',
      selectedMenu: orderData.selectedMenu,
      menuName: selectedMenuObj?.name || selectedMenuObj?.meal_name || 'Unknown Menu',
      menuDescription: selectedMenuObj?.description || '',
      menuIngredients: selectedMenuObj?.ingredients || [],
      menuPrice: selectedMenuObj?.price || 0,
      selectedPet: orderData.selectedPet,
      petName: selectedPetObj?.name || '',
      petBreed: selectedPetObj?.breed || '',
      petAge: selectedPetObj?.age || 0,
      petWeight: selectedPetObj?.weight || 0,
      petAllergies: selectedPetObj?.allergies || []
    };
    
    onSubmit(orderPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Quick Order</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} key="quickorder-plan">
              <FormControl fullWidth required>
                <InputLabel>Meal Plan</InputLabel>
                <Select
                  name="plan"
                  value={orderData.plan}
                  onChange={handleChange}
                  label="Meal Plan"
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.name} value={plan.name}>
                      {plan.name} - ${plan.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} key="quickorder-menu">
              <FormControl fullWidth required>
                <InputLabel>Select Menu</InputLabel>
                <Select
                  name="selectedMenu"
                  value={orderData.selectedMenu}
                  onChange={handleChange}
                  label="Select Menu"
                  disabled={menuLoading}
                >
                  {menuLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading menus...
                    </MenuItem>
                  ) : menus.length > 0 ? (
                    menus.map((menu) => {
                      const selectedPetObj = pets.find(p => p._id === orderData.selectedPet);
                      const allergyCheck = selectedPetObj ? checkAllergyConflict(menu, selectedPetObj) : { hasConflict: false, conflictingIngredients: [] };
                      
                      return (
                        <MenuItem 
                          key={menu.id} 
                          value={menu.id}
                          disabled={allergyCheck.hasConflict}
                          sx={{
                            '&.Mui-disabled': {
                              backgroundColor: '#ffebee',
                              opacity: 0.7
                            }
                          }}
                        >
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body1" sx={{
                                color: allergyCheck.hasConflict ? 'error.main' : 'inherit'
                              }}>
                                {menu.name}
                              </Typography>
                              {allergyCheck.hasConflict && (
                                <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                                  ⚠️ Allergen
                                </Typography>
                              )}
                            </Box>
                            {menu.description && (
                              <Typography variant="caption" color="text.secondary">
                                {menu.description}
                              </Typography>
                            )}
                            {allergyCheck.hasConflict && selectedPetObj && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                Contains: {allergyCheck.conflictingIngredients.join(', ')} (allergic to {selectedPetObj.name})
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem disabled>
                      No menus available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} key="quickorder-pet">
              <FormControl fullWidth required>
                <InputLabel>Select Pet</InputLabel>
                <Select
                  name="selectedPet"
                  value={orderData.selectedPet}
                  onChange={handleChange}
                  label="Select Pet"
                >
                  {Array.isArray(pets) && pets.length > 0 && pets.map((pet) => {
                    if (!pet || typeof pet !== 'object') return null;
                    
                    return (
                      <MenuItem key={pet._id} value={pet._id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ bgcolor: '#ff9800', width: 24, height: 24 }}>
                            <PetsIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{pet?.name || 'Unknown Pet'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pet?.breed || 'Unknown'} • {pet?.age || '0'} years • {pet?.weight || '0'}kg
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} key="quickorder-total">
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6">
                  Total: ${plans.find(p => p.name === orderData.plan)?.price || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {orderData.plan} plan for 1 pet
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !orderData.selectedMenu || !orderData.selectedPet}
        >
          {loading ? <CircularProgress size={20} /> : 'Place Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const HomePage = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [menus, setMenus] = useState([]);

  const plans = [
    { name: '7 Days', price: 399 },
    { name: '14 Days', price: 699 },
    { name: '30 Days', price: 999 }
  ];

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
          const session = JSON.parse(userSession);
          setIsLoggedIn(true);
          setUserInfo(session);
          fetchPets(session.email); // Fetch pets for logged-in user using email
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchPets = async (customerEmail) => {
    try {
      const response = await fetch(`/api/pet?customer_email=${encodeURIComponent(customerEmail)}`);
      const data = await response.json();
      if (data.success) {
        const fetchedPets = data.data || [];
        setPets(fetchedPets);
        
        // If no pets found with email, try to migrate pets without customer_email
        if (fetchedPets.length === 0) {
          await migratePetsToEmail(customerEmail);
        }
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const migratePetsToEmail = async (customerEmail) => {
    try {
      // Call a simple migration endpoint
      const response = await fetch('/api/pet/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: customerEmail })
      });
      
      if (response.ok) {
        // Refetch pets after migration
        const newResponse = await fetch(`/api/pet?customer_email=${encodeURIComponent(customerEmail)}`);
        const newData = await newResponse.json();
        if (newData.success) {
          setPets(newData.data || []);
        }
      }
    } catch (error) {
      console.error('Error migrating pets:', error);
    }
  };

  const handleOrderMealClick = () => {
    if (isLoggedIn) {
      if (pets.length === 0) {
        alert('Please add a pet profile first before ordering meals.');
        router.push('/PetProfile');
        return;
      }
      setQuickOrderOpen(true);
    } else {
      router.push('/register');
    }
  };

  const handleQuickOrderSubmit = async (orderData) => {
    setOrderLoading(true);
    try {
      // Get selected menu and pet objects for detailed information
      const selectedMenuObj = menus.find(menu => menu._id === orderData.selectedMenu);
      const selectedPetObj = pets.find(pet => pet._id === orderData.selectedPet);
      const selectedPlan = plans.find(p => p.name === orderData.plan);

      // Create comprehensive order payload similar to dashboard
      const orderPayload = {
        plan: orderData.plan,
        quantity: 1,
        price: selectedPlan.price,
        date_order: new Date(),
        customer_email: userInfo.email,
        order_status: 'pending',
        selectedMenu: orderData.selectedMenu,
        menuName: selectedMenuObj?.name || selectedMenuObj?.meal_name || 'Unknown Menu',
        menuDescription: selectedMenuObj?.description || '',
        menuIngredients: selectedMenuObj?.ingredients || [],
        menuPrice: selectedMenuObj?.price || 0,
        selectedPet: orderData.selectedPet,
        petName: selectedPetObj?.name || '',
        petBreed: selectedPetObj?.breed || '',
        petAge: selectedPetObj?.age || 0,
        petWeight: selectedPetObj?.weight || 0,
        petAllergies: selectedPetObj?.allergies || []
      };

      const response = await fetch('/api/order/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Order placed successfully!');
        setQuickOrderOpen(false);
        router.push('/customer/dashboard');
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

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

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button 
              onClick={handleOrderMealClick}
              className="px-6 py-3 text-white bg-gray-800 hover:bg-gray-600 rounded-md transition"
            >
              {isLoggedIn ? "Order Meal" : "Sign Up & Order"}
            </button>
            
            {isLoggedIn && (
              <button 
                onClick={() => router.push('/customer/dashboard')}
                className="px-6 py-3 text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-md transition border border-gray-300"
              >
                Go to Dashboard
              </button>
            )}
          </div>
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

      {/* Quick Order Modal */}
      <QuickOrderModal 
        open={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        onSubmit={handleQuickOrderSubmit}
        loading={orderLoading}
        pets={pets}
        menus={menus}
        setMenus={setMenus}
        plans={plans}
      />
    </div>
  );
};

export default HomePage;
