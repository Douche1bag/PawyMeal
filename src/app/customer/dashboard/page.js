'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Helper function to get user session - moved outside component for global access
const getUserSession = () => {
  try {
    return JSON.parse(localStorage.getItem('userSession') || '{}');
  } catch (error) {
    console.error('Error parsing user session:', error);
    return {};
  }
};
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Pets as PetsIcon,
  ShoppingCart as OrderIcon,
  Restaurant as MenuIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  AccountCircle as ProfileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Quick Order Modal Component
const QuickOrderModal = ({ open, onClose, onSubmit, loading, pets }) => {
  const [orderData, setOrderData] = useState({
    plan: '7 Days',
    selectedMenu: '',
    selectedPet: ''
  });
  const [menus, setMenus] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const plans = [
    { name: '7 Days', price: 399 },
    { name: '14 Days', price: 699 },
    { name: '30 Days', price: 999 }
  ];

  // Fetch menus when modal opens
  useEffect(() => {
    if (open) {
      fetchMenus();
    }
  }, [open]);

  const fetchMenus = async () => {
    try {
      setMenuLoading(true);
      const response = await fetch(`${API_BASE}/menu`);
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
    
    // Validate required selections
    if (!orderData.selectedMenu) {
      alert('Please select a menu item before placing your order.');
      return;
    }
    
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
    
    const userSession = getUserSession();
    const orderPayload = {
      plan: orderData.plan,
      quantity: 1, // Fixed quantity of 1
      price: selectedPlan.price,
      date_order: new Date(),
      customer_email: userSession.email || '', // Use email as unique identifier
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

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setOrderData({
        plan: '7 Days',
        selectedMenu: '',
        selectedPet: ''
      });
    }
  }, [open]);

  const selectedPlan = plans.find(p => p.name === orderData.plan);
  const totalPrice = selectedPlan ? selectedPlan.price : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Quick Order</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} key="quickorder-plan">
              <FormControl fullWidth>
                <InputLabel>Meal Plan</InputLabel>
                <Select
                  name="plan"
                  value={orderData.plan}
                  onChange={handleChange}
                  label="Meal Plan"
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.name} value={plan.name}>
                      {plan.name} - ฿{plan.price}
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

            {pets.length > 0 && (
              <Grid item xs={12} key="quickorder-pet">
                <FormControl fullWidth>
                  <InputLabel>Select Pet (Optional)</InputLabel>
                  <Select
                    name="selectedPet"
                    value={orderData.selectedPet}
                    onChange={handleChange}
                    label="Select Pet (Optional)"
                  >
                    <MenuItem value="">
                      <em>No specific pet</em>
                    </MenuItem>
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
            )}

            {/* Allergy Warning */}
            {orderData.selectedPet && (() => {
              const selectedPetObj = pets.find(p => p._id === orderData.selectedPet);
              return selectedPetObj && selectedPetObj.allergies && selectedPetObj.allergies.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>🐕 {selectedPetObj.name} has allergies:</strong> {selectedPetObj.allergies.join(', ')}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Menu items containing these ingredients will be disabled and cannot be ordered.
                    </Typography>
                  </Alert>
                </Grid>
              );
            })()}

            <Grid item xs={12} key="quickorder-total">
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="h6">
                  Total: ฿{totalPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {orderData.plan} Plan
                  {orderData.selectedMenu && menus.find(m => m.id === orderData.selectedMenu) && (
                    <> • {menus.find(m => m.id === orderData.selectedMenu).name}</>
                  )}
                  {orderData.selectedPet && pets.find(p => p._id === orderData.selectedPet) && (
                    <> • For {pets.find(p => p._id === orderData.selectedPet).name}</>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !orderData.selectedMenu}
            startIcon={loading ? <CircularProgress size={20} /> : <OrderIcon />}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    totalPets: 0,
    totalOrders: 0,
    favoriteItems: 0,
    recentOrders: 0
  });
  

  const [pets, setPets] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to update order names
  const updateOrderNames = async () => {
    try {
      const response = await fetch(`${API_BASE}/order/update-names`, { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        console.log(`Updated ${result.updatedOrders.length} orders`);
        // Refresh data after update
        await fetchDashboardData();
        return true;
      }
    } catch (error) {
      console.error('Error updating order names:', error);
    }
    return false;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user session for authenticated requests
      const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
      const userId = userSession.id || '68dfbb788fde55825fda2506'; // Bob Johnson's ID as fallback
      console.log('Fetching dashboard data for user:', userSession);
      
      // Fetch pets for the specific user
      let pets = [];
      try {
        // Fetch pets using email
      const userEmail = userSession.email;
      const petResponse = await fetch(`${API_BASE}/pet?customer_email=${encodeURIComponent(userEmail)}`);
        const petData = await petResponse.json();
        pets = petData.success ? petData.data || [] : [];
        console.log('Loaded pets for user:', pets);
      } catch (e) {
        console.log('Pets not available yet');
      }

      // Fetch menu items (this can remain global)
      const menuResponse = await fetch(`${API_BASE}/menu`);
      const menuData = await menuResponse.json();

      // Fetch orders for the specific user using email
      let orders = [];
      try {
        const userSession = getUserSession();
        const userEmail = userSession.email;
        if (userEmail) {
          // First, try to migrate any orders/pets without customer_email
          await Promise.all([
            fetch(`${API_BASE}/pet/migrate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customer_email: userEmail })
            }).catch(console.error),
            fetch(`${API_BASE}/order/migrate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customer_email: userEmail })
            }).catch(console.error)
          ]);
          
          const orderResponse = await fetch(`${API_BASE}/order?customer_email=${encodeURIComponent(userEmail)}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            orders = orderData.success ? orderData.data || [] : [];
            console.log('Loaded orders for user:', orders);
          } else {
            console.log('Orders API returned error:', orderResponse.status);
          }
        }
      } catch (e) {
        console.log('Orders not available yet:', e.message);
      }

      if (menuData.success) {
        setPets(pets);
        setMenuItems(menuData.data || []);
        setRecentOrders(orders.slice(0, 5)); // Show recent 5 orders
        
        // Auto-update order names if any orders are missing names
        const needsUpdate = orders.some(order => 
          (!order.menuName && order.selectedMenu) || 
          (!order.petName && order.selectedPet)
        );
        
        if (needsUpdate) {
          console.log('Some orders need name updates, running auto-update...');
          setTimeout(() => updateOrderNames(), 1000); // Delay to let state settle
        }
        
        setStats({
          totalPets: pets.length,
          totalOrders: orders.length,
          favoriteItems: Math.min(menuData.data?.length || 0, 3), // Mock favorite items
          recentOrders: orders.filter(order => {
            // Recent orders from last 30 days
            const orderDate = new Date(order.createdAt || order.orderDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
          }).length
        });
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard data');
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

  const handleDeleteConfirm = async () => {
    if (!petToDelete) return;

    try {
      const response = await fetch(`${API_BASE}/pet/${petToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove pet from local state
        setPets(prevPets => prevPets.filter(pet => pet._id !== petToDelete._id));
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          totalPets: prevStats.totalPets - 1
        }));
        setDeleteDialogOpen(false);
        setPetToDelete(null);
      } else {
        console.error('Failed to delete pet');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPetToDelete(null);
  };

  const handleQuickOrder = async (orderData) => {
    setOrderLoading(true);
    try {
      // Get the actual customer email from session
      const userSession = getUserSession();
      const orderWithCustomerEmail = {
        ...orderData,
        customer_email: userSession?.email || ''
      };



      const response = await fetch(`${API_BASE}/order/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderWithCustomerEmail),
      });

      if (response.ok) {
        const result = await response.json();
        setOrderSuccess('Order placed successfully!');
        setQuickOrderOpen(false);
        
        // Add the new order to the recent orders list locally for immediate feedback
        if (result.data) {
          setRecentOrders(prev => [result.data, ...prev].slice(0, 5));
          // Update stats
          setStats(prevStats => ({
            ...prevStats,
            totalOrders: prevStats.totalOrders + 1,
            recentOrders: prevStats.recentOrders + 1
          }));
        }
        
        // Also refresh the dashboard data to ensure consistency
        setTimeout(() => fetchDashboardData(), 1000);
        
        // Clear success message after 3 seconds
        setTimeout(() => setOrderSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to place order:', errorData);
        setError('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('userSession');
    localStorage.removeItem('user'); // Clear old user data too
    console.log('User logged out, session cleared');
    router.push('/login');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2">
              {title}
            </Typography>
          </Box>
          <Box sx={{ fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      {/* Customer Header */}
      <AppBar position="static" sx={{ bgcolor: '#4caf50' }}>
        <Toolbar>
          <PetsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My PawyMeal Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {JSON.parse(localStorage.getItem('userSession') || '{}').name || 'User'}!
          </Typography>
          <IconButton color="inherit" onClick={() => {
            const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
            const email = userSession.email || 'bob@example.com';
            router.push(`/setting?email=${email}`);
          }}>
            <ProfileIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome back! 🐾
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Keep your furry friends happy and healthy with our customized meal plans.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/')}
              sx={{ minWidth: '120px' }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3} key="stats-pets">
            <StatCard
              title="My Pets"
              value={stats.totalPets}
              icon={<PetsIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} key="stats-orders">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<OrderIcon />}
              color="#2196f3"
            />
          </Grid>
          {/* <Grid item xs={12} sm={6} md={3} key="stats-favorites">
            <StatCard
              title="Favorite Items"
              value={stats.favoriteItems}
              icon={<FavoriteIcon />}
              color="#e91e63"
            />
          </Grid> */}
          <Grid item xs={12} sm={6} md={3} key="stats-recent">
            <StatCard
              title="Recent Orders"
              value={stats.recentOrders}
              icon={<HistoryIcon />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* My Pets Section */}
          <Grid item xs={12} md={6} key="pets-section">
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  My Pets
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => router.push('/PetProfile/add')}
                >
                  Add Pet
                </Button>
              </Box>
              {Array.isArray(pets) && pets.length > 0 ? (
                <List>
                  {pets.slice(0, 4).map((pet, index) => {
                    // Ensure pet is an object and has required properties
                    if (!pet || typeof pet !== 'object') return null;
                    
                    // Safe property access with fallbacks
                    const petName = pet?.name ? String(pet.name) : 'Unknown Pet';
                    const petBreed = pet?.breed ? String(pet.breed) : 'Unknown';
                    const petAge = pet?.age ? String(pet.age) : '0';
                    const petWeight = pet?.weight ? String(pet.weight) : '0';
                    
                    return (
                      <ListItem key={`pet-${pet._id || index}-${Date.now()}`} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#ff9800' }}>
                            <PetsIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={petName}
                          secondary={`${petBreed} • ${petAge} years old • ${petWeight}kg`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditPet(pet._id)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteClick(pet)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  }).filter(Boolean)}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <PetsIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No pets added yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/PetProfile/add')}
                  >
                    Add Your First Pet
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Orders Section */}
          <Grid item xs={12} md={6} key="orders-section">
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Recent Orders
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setQuickOrderOpen(true)}
                  >
                    Quick Order
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => router.push('/customer/order-history')}
                  >
                    View All
                  </Button>
                </Box>
              </Box>
              {recentOrders.length > 0 ? (
                <List dense>
                  {recentOrders.map((order, index) => {
                    const orderDate = new Date(order.date_order || order.createdAt);
                    const isRecent = (Date.now() - orderDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Within 7 days
                    
                    // Use the menu and pet information directly from the order (now includes full details)
                    let petName = order.petName;
                    let menuName = order.menuName;
                    
                    // If names aren't in the order, try to resolve from IDs as fallback
                    if (!petName && order.selectedPet && Array.isArray(pets) && pets.length > 0) {
                      const foundPet = pets.find(p => p && p._id === order.selectedPet);
                      petName = foundPet?.name || 'Unknown Pet';
                    }
                    
                    if (!menuName && order.selectedMenu && Array.isArray(menuItems) && menuItems.length > 0) {
                      const foundMenu = menuItems.find(m => m && (m.id === order.selectedMenu || m._id === order.selectedMenu));
                      menuName = foundMenu?.name || foundMenu?.meal_name || 'Unknown Menu';
                    }
                    
                    // Final fallback to ensure we always show something
                    petName = petName || 'Pet';
                    menuName = menuName || 'Menu Item';
                    
                    return (
                      <ListItem 
                        key={`order-${order._id || index}-${Date.now()}`} 
                        divider
                        sx={{ 
                          borderLeft: isRecent ? '4px solid #4caf50' : 'none',
                          pl: isRecent ? 2 : 1,
                          flexDirection: 'column',
                          alignItems: 'stretch'
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: order.order_status === 'completed' ? '#4caf50' : 
                                      order.order_status === 'preparing' ? '#ff9800' : 
                                      order.order_status === 'delivered' ? '#2196f3' : '#9e9e9e',
                              width: 40, 
                              height: 40 
                            }}
                          >
                            <OrderIcon />
                          </Avatar>
                        </ListItemIcon>
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {order.plan} Plan
                              </Typography>
                              <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                                📋 {menuName || "Lamb Meal"}
                              </Typography>
                              <Typography variant="body2" color="secondary" sx={{ mt: 0.25 }}>
                                🐕 For {petName || "INchy"}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              ฿{order.price}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              📅 {orderDate.toLocaleDateString()}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={order.order_status || 'pending'}
                                size="small"
                                color={
                                  order.order_status === 'completed' || order.order_status === 'delivered' ? 'success' :
                                  order.order_status === 'preparing' ? 'warning' :
                                  order.order_status === 'pending' ? 'info' : 'default'
                                }
                              />
                              {isRecent && (
                                <Chip 
                                  label="Recent" 
                                  size="small" 
                                  variant="outlined"
                                  color="success"
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <OrderIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No orders yet
                  </Typography>
                  <Box display="flex" gap={1} justifyContent="center">
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setQuickOrderOpen(true)}
                    >
                      Place First Order
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MenuIcon />}
                      onClick={() => router.push('/menu')}
                    >
                      Browse Menu
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item key="action-browse-menu">
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={() => router.push('/recipe')}
              >
                Browse Menu
              </Button>
            </Grid>
            <Grid item key="action-quick-order">
              <Button
                variant="outlined"
                startIcon={<PetsIcon />}
                onClick={() => router.push('/customer/pets')}
              >
                Manage Pets
              </Button>
            </Grid>
            <Grid item key="action-order-history">
              <Button
                variant="outlined"
                startIcon={<OrderIcon />}
                onClick={() => router.push('/customer/order-history')}
              >
                Order History
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Success Message */}
      {orderSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 1300 
          }}
        >
          {orderSuccess}
        </Alert>
      )}

      {/* Quick Order Modal */}
      <QuickOrderModal 
        open={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        onSubmit={handleQuickOrder}
        loading={orderLoading}
        pets={pets}
      />

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