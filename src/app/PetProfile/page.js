"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import {
  Pets as PetsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const PetProfile = () => {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pet');
      const data = await response.json();
      
      if (data.success) {
        setPets(data.data || []);
      } else {
        setError('Failed to load pets');
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete ${petName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pet/${petId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the pet from the local state
        setPets(pets.filter(pet => pet._id !== petId));
        // Show success message (you could add a snackbar here)
        console.log('Pet deleted successfully');
      } else {
        setError('Failed to delete pet');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      setError('Failed to delete pet');
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
    <>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#4caf50' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/customer/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Pets
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => router.push('/PetProfile/add')}
          >
            Add Pet
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {pets.length === 0 ? (
          // No pets state
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <PetsIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No pets added yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Add your first furry friend to get started with personalized meal plans!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => router.push('/PetProfile/add')}
              sx={{ 
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#388e3c' }
              }}
            >
              Add Your First Pet
            </Button>
          </Paper>
        ) : (
          // Pets list
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1">
                My Pets ({pets.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/PetProfile/add')}
                sx={{ 
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' }
                }}
              >
                Add Another Pet
              </Button>
            </Box>

            <Grid container spacing={3}>
              {pets.map((pet) => (
                <Grid item xs={12} md={6} lg={4} key={pet._id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                          <PetsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {pet.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {pet.breed}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Age:</strong> {pet.age} years
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Weight:</strong> {pet.weight} kg
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Gender:</strong> {pet.gender || 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">
                            <strong>Neutered:</strong> {pet.neutered ? 'Yes' : 'No'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {pet.bodyCondition && (
                        <Box mb={2}>
                          <Typography variant="body2">
                            <strong>Body Condition:</strong> {pet.bodyCondition}
                          </Typography>
                        </Box>
                      )}

                      {pet.activeness && (
                        <Box mb={2}>
                          <Typography variant="body2">
                            <strong>Activity Level:</strong> {pet.activeness}
                          </Typography>
                        </Box>
                      )}

                      {pet.allergies && pet.allergies.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Allergies:</strong>
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {pet.allergies.map((allergy, index) => (
                              <Chip
                                key={index}
                                label={allergy}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box mt={2} display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          size="small"
                          onClick={() => router.push(`/PetProfile/edit/${pet._id}`)}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          size="small"
                          onClick={() => handleDeletePet(pet._id, pet.name)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default PetProfile;