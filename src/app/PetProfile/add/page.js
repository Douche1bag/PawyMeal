"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const AddPetProfile = () => {
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
    console.log('Starting to load dog breeds...');
    fetch("/data/dogs.json")
      .then((response) => {
        console.log('Fetch response status:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('Dog breeds data received:', data);
        console.log('Number of breeds:', data.dogs?.length);
        const breeds = data.dogs || [];
        if (breeds.length > 0) {
          setDogBreeds(breeds);
          console.log('✅ Loaded', breeds.length, 'dog breeds from JSON');
        } else {
          console.log('⚠️ No breeds in JSON, using fallback');
          setDogBreeds([
            'Labrador', 'Golden Retriever', 'German Shepherd',
            'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
            'Yorkshire Terrier', 'Dachshund', 'Siberian Husky', 'Other'
          ]);
        }
      })
      .catch((error) => {
        console.error("❌ Error loading dog breeds:", error);
        console.log('🔄 Using fallback breeds');
        // Fallback breeds if fetch fails
        setDogBreeds([
          'Labrador', 'Golden Retriever', 'German Shepherd',
          'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
          'Yorkshire Terrier', 'Dachshund', 'Siberian Husky', 'Other'
        ]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || "" // Ensure value is never undefined/null
    }));
  };

  const toggleAllergy = (allergyName) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergyName)
        ? prev.allergies.filter(allergy => allergy !== allergyName)
        : [...prev.allergies, allergyName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Debug: Log form data to see what's missing
      console.log('Form data:', formData);
      
      // Validate required fields
      const missingFields = [];
      if (!formData.name) missingFields.push('name');
      if (!formData.breed) missingFields.push('breed');
      if (!formData.age) missingFields.push('age');
      if (!formData.weight) missingFields.push('weight');
      if (!formData.gender) missingFields.push('gender');
      if (!formData.neutered) missingFields.push('neutered status');
      if (!formData.bodyCondition) missingFields.push('body condition');
      if (!formData.activeness) missingFields.push('activity level');
      
      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Customer identification removed for simplicity

      // Calculate size based on weight
      let size = 'medium';
      const weightValue = parseFloat(formData.weight);
      if (weightValue < 25) {
        size = 'small';
      } else if (weightValue > 60) {
        size = 'large';
      }

      const petData = {
        name: formData.name,
        breed: formData.breed,
        age: parseInt(formData.age),
        weight: weightValue,
        size: size,
        gender: formData.gender,
        neutered: formData.neutered === 'yes',
        allergies: formData.allergies,
        bodyCondition: formData.bodyCondition,
        activityLevel: formData.activeness // API expects activityLevel, not activeness
      };

      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Pet added successfully!');
        setTimeout(() => {
          router.push('/PetProfile'); // Redirect back to pet list
        }, 2000);
      } else {
        setError(data.error || 'Failed to add pet');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#4caf50' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Add New Pet
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            🐾 Add Your Pet
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
            Tell us about your furry friend so we can create the perfect meal plan!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Pet Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pet Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Breed */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Breed *</InputLabel>
                  <Select
                    name="breed"
                    value={formData.breed || ""}
                    onChange={handleChange}
                    label="Breed *"
                    displayEmpty
                    sx={{
                      '& .MuiSelect-select': {
                        color: 'black',
                      },
                      '& .MuiMenuItem-root': {
                        color: 'black',
                      }
                    }}
                  >
                    {dogBreeds.length === 0 ? (
                      <MenuItem disabled>Loading breeds...</MenuItem>
                    ) : (
                      dogBreeds.map((breed, index) => (
                        <MenuItem 
                          key={index} 
                          value={breed}
                          sx={{ 
                            color: 'black !important',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        >
                          {breed}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                {/* Debug info */}
                <Typography variant="caption" color="textSecondary">
                  {dogBreeds.length} breeds loaded
                </Typography>
              </Grid>

              {/* Age */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age (years) *"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, max: 25 }}
                />
              </Grid>

              {/* Weight */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Weight (kg) *"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0.1, step: 0.1 }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    Gender
                  </Typography>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Neutered */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    Neutered/Spayed
                  </Typography>
                  <RadioGroup
                    row
                    name="neutered"
                    value={formData.neutered}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Body Condition */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Body Condition</InputLabel>
                  <Select
                    name="bodyCondition"
                    value={formData.bodyCondition || ""}
                    onChange={handleChange}
                    label="Body Condition"
                    displayEmpty
                  >
                    <MenuItem value="underweight">Underweight</MenuItem>
                    <MenuItem value="ideal">Ideal</MenuItem>
                    <MenuItem value="overweight">Overweight</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Activity Level */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity Level</InputLabel>
                  <Select
                    name="activeness"
                    value={formData.activeness || ""}
                    onChange={handleChange}
                    label="Activity Level"
                    displayEmpty
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Allergies */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Food Allergies & Sensitivities
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Select any foods your pet is allergic to or sensitive to:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allergies.map((allergy) => (
                    <Chip
                      key={allergy.name}
                      label={allergy.name}
                      onClick={() => toggleAllergy(allergy.name)}
                      color={formData.allergies.includes(allergy.name) ? 'primary' : 'default'}
                      variant={formData.allergies.includes(allergy.name) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      bgcolor: '#4caf50',
                      '&:hover': {
                        bgcolor: '#388e3c'
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Add Pet 🐾'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default AddPetProfile;