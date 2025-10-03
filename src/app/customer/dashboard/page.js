'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Avatar
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
  AccountCircle as ProfileIcon
} from '@mui/icons-material';

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
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch pets
      let pets = [];
      try {
        const petResponse = await fetch('/api/pet');
        const petData = await petResponse.json();
        pets = petData.success ? petData.data || [] : [];
      } catch (e) {
        console.log('Pets not available yet');
      }

      // Fetch menu items
      const menuResponse = await fetch('/api/menu');
      const menuData = await menuResponse.json();

      // Fetch orders (if exists)
      let orders = [];
      try {
        const orderResponse = await fetch('/api/order');
        const orderData = await orderResponse.json();
        orders = orderData.success ? orderData.data || [] : [];
      } catch (e) {
        console.log('Orders not available yet');
      }

      if (menuData.success) {
        setPets(pets);
        setMenuItems(menuData.data || []);
        setRecentOrders(orders.slice(0, 5)); // Show recent 5 orders
        
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

  const handleLogout = () => {
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
          <IconButton color="inherit" onClick={() => router.push('/setting')}>
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
          <Typography variant="h4" gutterBottom>
            Welcome back! 🐾
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Keep your furry friends happy and healthy with our customized meal plans.
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="My Pets"
              value={stats.totalPets}
              icon={<PetsIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<OrderIcon />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Favorite Items"
              value={stats.favoriteItems}
              icon={<FavoriteIcon />}
              color="#e91e63"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  My Pets
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => router.push('/PetProfile')}
                >
                  Add Pet
                </Button>
              </Box>
              {pets.length > 0 ? (
                <List>
                  {pets.slice(0, 4).map((pet) => (
                    <ListItem key={pet._id} divider>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <PetsIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={pet.name}
                        secondary={`${pet.breed} • ${pet.age} years old • ${pet.weight}kg`}
                      />
                    </ListItem>
                  ))}
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
                    onClick={() => router.push('/PetProfile')}
                  >
                    Add Your First Pet
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Orders Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Recent Orders
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => router.push('/customer/orders')}
                >
                  View All
                </Button>
              </Box>
              {recentOrders.length > 0 ? (
                <List dense>
                  {recentOrders.map((order, index) => (
                    <ListItem key={order._id || index} divider>
                      <ListItemIcon>
                        <OrderIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order._id?.slice(-6) || index + 1}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {order.items?.length || 1} items • 
                            </Typography>
                            <Chip
                              label={order.status || 'pending'}
                              size="small"
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'pending' ? 'warning' : 'default'
                              }
                              sx={{ ml: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <OrderIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No orders yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<MenuIcon />}
                    onClick={() => router.push('/menu')}
                  >
                    Browse Menu
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Popular Menu Items */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Popular Menu Items
          </Typography>
          <Grid container spacing={2}>
            {menuItems.slice(0, 4).map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.meal_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {item.description?.slice(0, 80)}...
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" color="primary">
                        ${item.price}
                      </Typography>
                      <Button size="small" variant="outlined">
                        Order Now
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {menuItems.length === 0 && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              No menu items available at the moment
            </Typography>
          )}
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<MenuIcon />}
                onClick={() => router.push('/menu')}
              >
                Browse Menu
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<PetsIcon />}
                onClick={() => router.push('/PetProfile')}
              >
                Manage Pets
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<OrderIcon />}
                onClick={() => router.push('/customer/orders')}
              >
                Order History
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => router.push('/setting')}
              >
                Account Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}