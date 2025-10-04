'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const EditPetProfileContent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [allergies, setAllergies] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
    activityLevel: "",
  });

  useEffect(() => {
    loadFormData();
    fetchPetData();
  }, [id]);

  const loadFormData = async () => {
    try {
      // Load allergies
      const allergyResponse = await fetch("/data/sensitivity.json");
      const allergyData = await allergyResponse.json();
      setAllergies(allergyData.foodAllergies || []);

      // Load dog breeds
      const breedResponse = await fetch("/data/dogs.json");
      const breedData = await breedResponse.json();
      const breeds = breedData.dogs || [];
      if (breeds.length > 0) {
        setDogBreeds(breeds);
      } else {
        setDogBreeds([
          'Labrador', 'Golden Retriever', 'German Shepherd',
          'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
          'Yorkshire Terrier', 'Dachshund', 'Siberian Husky', 'Other'
        ]);
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      setDogBreeds([
        'Labrador', 'Golden Retriever', 'German Shepherd',
        'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
        'Yorkshire Terrier', 'Dachshund', 'Siberian Husky', 'Other'
      ]);
    }
  };

  const fetchPetData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/pet/${id}`);
      const data = await response.json();

      if (data.success) {
        const pet = data.data;
        console.log('Pet data received:', pet); // Debug log
        
        setFormData({
          name: String(pet.name || ""),
          breed: String(pet.breed || ""),
          age: pet.age ? String(pet.age) : "",
          weight: pet.weight ? String(pet.weight) : "",
          gender: String(pet.gender || ""),
          neutered: pet.neutered === true ? "yes" : (pet.neutered === false ? "no" : ""),
          allergies: Array.isArray(pet.allergies) ? pet.allergies : [],
          bodyCondition: String(pet.bodyCondition || ""),
          activityLevel: String(pet.activityLevel || ""),
        });
      } else {
        setError('Pet not found');
      }
    } catch (error) {
      console.error('Error fetching pet:', error);
      setError('Failed to load pet data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value || ""
    }));
  };

  const toggleAllergy = (allergyName) => {
    setFormData(prev => {
      const currentAllergies = Array.isArray(prev.allergies) ? prev.allergies : [];
      return {
        ...prev,
        allergies: currentAllergies.includes(allergyName)
          ? currentAllergies.filter(allergy => allergy !== allergyName)
          : [...currentAllergies, allergyName]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      const missingFields = [];
      if (!formData.name) missingFields.push('name');
      if (!formData.breed) missingFields.push('breed');
      if (!formData.age) missingFields.push('age');
      if (!formData.weight) missingFields.push('weight');
      if (!formData.gender) missingFields.push('gender');
      if (!formData.neutered) missingFields.push('neutered status');
      if (!formData.bodyCondition) missingFields.push('body condition');
      if (!formData.activityLevel) missingFields.push('activity level');
      
      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

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
        activityLevel: formData.activityLevel
      };

      const response = await fetch(`/api/pet/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Pet updated successfully!');
        setTimeout(() => {
          router.push('/PetProfile');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update pet');
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#4caf50' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/PetProfile')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Edit Pet Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <PetsIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Your Pet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your furry friend's information for the perfect meal plan!
            </Typography>
          </Box>

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
                  label="Pet Name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Breed */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Breed</InputLabel>
                  <Select
                    name="breed"
                    value={String(formData.breed || "")}
                    onChange={handleChange}
                    label="Breed"
                    displayEmpty
                    sx={{
                      '& .MuiSelect-select': {
                        color: 'black',
                      },
                    }}
                  >
                    {dogBreeds.map((breed, index) => (
                      <MenuItem key={`breed-${index}-${breed}`} value={breed}>
                        {breed}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary">
                    {dogBreeds.length} breeds loaded
                  </Typography>
                </FormControl>
              </Grid>

              {/* Age */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age (years)"
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ min: 0, max: 30 }}
                />
              </Grid>

              {/* Weight */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight || ""}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  inputProps={{ min: 0.1, step: 0.1 }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Gender</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender || ""}
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
                  <FormLabel component="legend">Neutered/Spayed</FormLabel>
                  <RadioGroup
                    row
                    name="neutered"
                    value={formData.neutered || ""}
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
                    name="activityLevel"
                    value={formData.activityLevel || ""}
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
                  {Array.isArray(allergies) && allergies.map((allergy, index) => {
                    // Ensure allergy is an object with name property
                    if (!allergy || typeof allergy !== 'object' || !allergy.name) return null;
                    
                    return (
                      <Chip
                        key={`allergy-${index}-${allergy.name}`}
                        label={allergy.name}
                        onClick={() => toggleAllergy(allergy.name)}
                        color={Array.isArray(formData.allergies) && formData.allergies.includes(allergy.name) ? 'primary' : 'default'}
                        variant={Array.isArray(formData.allergies) && formData.allergies.includes(allergy.name) ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  }).filter(Boolean)}
                </Box>
                {Array.isArray(formData.allergies) && formData.allergies.length > 0 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Selected: {formData.allergies.join(', ')}
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/PetProfile')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PetsIcon />}
                    sx={{ 
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#388e3c' }
                    }}
                  >
                    {loading ? 'Updating Pet...' : 'Update Pet'}
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

const EditPetProfile = () => {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </div>
        </Paper>
      </Container>
    }>
      <EditPetProfileContent />
    </Suspense>
  );
};

export default EditPetProfile;