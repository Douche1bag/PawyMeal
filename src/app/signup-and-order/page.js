"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';

const SignupAndOrder = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [allergies, setAllergies] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Customer Info
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    address: "",
    zipCode: "",
    city: "",
    
    // Pet Info
    dogName: "",
    gender: "",
    age: "",
    breed: "",
    neutered: "",
    weight: "",
    allergies: [],
    bodyCondition: "",
    activeness: "",
    
    // Order Info
    selectedMeals: [],
    plan: "",
  });

  const steps = [
    'Personal Info',
    'Pet Details',
    'Pet Health',
    'Food Allergies', 
    'Activity Level',
    'Meal Selection',
    'Plan Selection',
    'Order Summary',
    'Address & Payment'
  ];

  const plans = [
    { name: '7 Days', price: 399 },
    { name: '14 Days', price: 699 },
    { name: '30 Days', price: 999 }
  ];

  useEffect(() => {
    // Load allergies
    fetch("/data/sensitivity.json")
      .then((response) => response.json())
      .then((data) => {
        setAllergies(data.foodAllergies || []);
      })
      .catch((error) => console.error("Error loading allergies:", error));

    // Load dog breeds
    fetch("/data/dogs.json")
      .then((response) => response.json())
      .then((data) => {
        setDogBreeds(data.dogs || []);
      })
      .catch((error) => console.error("Error loading dog breeds:", error));

    // Load menu
    fetch("/api/menu")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const processedMenus = (data.data || []).map(menu => {
            const fileIdMatch = menu.image_url?.match(/[-\w]{25,}/);
            const fileId = fileIdMatch ? fileIdMatch[0] : null;
            return {
              ...menu,
              image_url: fileId 
                ? `https://lh3.googleusercontent.com/d/${fileId}`
                : menu.image_url || '/images/default_meal.png'
            };
          });
          setMenuData(processedMenus);
        }
      })
      .catch((error) => console.error("Error loading menu:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleAllergy = (allergyName) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergyName)
        ? prev.allergies.filter(a => a !== allergyName)
        : [...prev.allergies, allergyName]
    }));
  };

  const toggleMeal = (mealId) => {
    setFormData(prev => ({
      ...prev,
      selectedMeals: prev.selectedMeals.includes(mealId)
        ? prev.selectedMeals.filter(id => id !== mealId)
        : [...prev.selectedMeals, mealId]
    }));
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.mobileNumber || !formData.password) {
          setError("Please fill in all required fields");
          return false;
        }
        break;
      case 2:
        if (!formData.dogName || !formData.breed || !formData.age || !formData.weight) {
          setError("Please fill in all pet details");
          return false;
        }
        break;
      case 6:
        if (formData.selectedMeals.length === 0) {
          setError("Please select at least one meal");
          return false;
        }
        break;
      case 7:
        if (!formData.plan) {
          setError("Please select a plan");
          return false;
        }
        break;
      case 9:
        if (!formData.address) {
          setError("Please provide your address");
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Step 1: Create customer account
      const customerResponse = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile_no: formData.mobileNumber,
          password: formData.password,
          address: `${formData.address}, ${formData.city}, ${formData.zipCode}`
        })
      });

      const customerData = await customerResponse.json();
      if (!customerData.success) {
        throw new Error(customerData.error || 'Failed to create account');
      }

      // Step 2: Create pet profile
      const petResponse = await fetch('/api/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.dogName,
          breed: formData.breed,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          neutered: formData.neutered === 'yes',
          allergies: formData.allergies,
          bodyCondition: formData.bodyCondition,
          activeness: formData.activeness,
          customer_id: customerData.data._id
        })
      });

      const petData = await petResponse.json();
      if (!petData.success) {
        throw new Error(petData.error || 'Failed to create pet profile');
      }

      // Step 3: Create order
      const selectedPlan = plans.find(p => p.name === formData.plan);
      const orderResponse = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerData.data._id,
          pet_id: petData.data._id,
          plan: formData.plan,
          price: selectedPlan?.price || 0,
          selectedMeals: formData.selectedMeals,
          order_status: 'Pending'
        })
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Success - redirect to login
      alert('Account created and order placed successfully! Please login to continue.');
      router.push('/login');

    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Create Your Account
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number *"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Select Your Pet's Meals
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Choose meals that suit your pet's dietary needs
            </Typography>
            <Grid container spacing={3}>
              {menuData.map((meal) => (
                <Grid item xs={12} md={6} lg={4} key={meal._id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.selectedMeals.includes(meal._id) ? '2px solid #4caf50' : '1px solid #e0e0e0'
                    }}
                    onClick={() => toggleMeal(meal._id)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={meal.image_url}
                      alt={meal.meal_name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {meal.meal_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ฿{meal.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 7:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Choose Your Plan
            </Typography>
            <Grid container spacing={3}>
              {plans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.name}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: formData.plan === plan.name ? '2px solid #4caf50' : '1px solid #e0e0e0'
                    }}
                    onClick={() => setFormData({...formData, plan: plan.name})}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h4" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Typography variant="h5" color="primary">
                        ฿{plan.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      default:
        return (
          <Typography variant="h6">
            Step {step} - Coming Soon
          </Typography>
        );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          🐾 Welcome to PawyMeal
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Create your account, add your pet, and get started with personalized meals!
        </Typography>

        <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={step === 1}
            onClick={prevStep}
            variant="outlined"
          >
            Back
          </Button>
          
          {step === steps.length ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#4caf50' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Order'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              variant="contained"
              sx={{ bgcolor: '#4caf50' }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupAndOrder;