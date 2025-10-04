'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemSecondaryAction,
  Card,
  CardContent
} from '@mui/material';
import {
  Pets as PetsIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function PetManagement() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);

  // Get user session
  const getUserSession = () => {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem('userSession');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error parsing user session:', error);
      return null;
    }
  };

  useEffect(() => {
    const userSession = getUserSession();
    if (!userSession) {
      router.push('/login');
      return;
    }
    fetchPets(userSession.id);
  }, [router]);

  const fetchPets = async (customerId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pet?customer_id=${customerId}`);
      const data = await response.json();
      if (data.success) {
        setPets(data.data || []);
      } else {
        setError('Failed to fetch pets');
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = (petId) => {
    router.push(`/PetProfile/edit/${petId}`);
  };

  const handleDeleteClick = (pet) => {
    setPetToDelete(pet);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPetToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!petToDelete) return;

    try {
      const response = await fetch(`/api/pet/${petToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove pet from local state
        setPets(prev => prev.filter(p => p._id !== petToDelete._id));
        setDeleteDialogOpen(false);
        setPetToDelete(null);
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
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/customer/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Manage Pets
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                My Pets 🐾
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage your pet profiles and keep their information up to date.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/PetProfile/add')}
              sx={{ minWidth: '150px' }}
            >
              Add New Pet
            </Button>
          </Box>
        </Paper>

        {/* Pets Grid */}
        {pets.length > 0 ? (
          <Grid container spacing={3}>
            {pets.map((pet, index) => {
              if (!pet || typeof pet !== 'object') return null;
              
              const petName = pet?.name ? String(pet.name) : 'Unknown Pet';
              const petBreed = pet?.breed ? String(pet.breed) : 'Unknown';
              const petAge = pet?.age ? String(pet.age) : '0';
              const petWeight = pet?.weight ? String(pet.weight) : '0';
              
              return (
                <Grid item xs={12} sm={6} md={4} key={`pet-${pet._id || index}`}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: '#ff9800', mr: 2, width: 56, height: 56 }}>
                          <PetsIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {petName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {petBreed}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Age:</strong> {petAge} years old
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Weight:</strong> {petWeight} kg
                        </Typography>
                        {pet.allergies && pet.allergies.length > 0 && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Allergies:</strong> {pet.allergies.join(', ')}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box display="flex" gap={1} mt="auto">
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditPet(pet._id)}
                          size="small"
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(pet)}
                          size="small"
                          fullWidth
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <PetsIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No pets added yet
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Add your first pet to get started with personalized meal plans.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/PetProfile/add')}
              sx={{ mt: 2 }}
            >
              Add Your First Pet
            </Button>
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Pet Profile
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {petToDelete?.name}'s profile? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}