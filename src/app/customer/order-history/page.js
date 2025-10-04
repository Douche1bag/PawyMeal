'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon
} from '@mui/icons-material';

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [pets, setPets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchData(userSession.email);
  }, [router]);

  const fetchData = async (customerEmail) => {
    try {
      setLoading(true);
      
      // First, try to migrate any pets/orders without customer_email
      await Promise.all([
        fetch('/api/pet/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_email: customerEmail })
        }).catch(console.error),
        fetch('/api/order/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_email: customerEmail })
        }).catch(console.error)
      ]);
      
      // Fetch orders, pets, and menu items in parallel
      const [orderResponse, petResponse, menuResponse] = await Promise.all([
        fetch(`/api/order?customer_email=${encodeURIComponent(customerEmail)}`),
        fetch(`/api/pet?customer_email=${encodeURIComponent(customerEmail)}`),
        fetch('/api/menu')
      ]);

      const orderData = await orderResponse.json();
      const petData = await petResponse.json();
      const menuData = await menuResponse.json();

      if (orderData.success) {
        setOrders(orderData.data || []);
      }
      if (petData.success) {
        setPets(petData.data || []);
      }
      if (menuData.success) {
        setMenuItems(menuData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getOrderDetails = (order) => {
    // Find pet and menu names
    let petName = order.petName;
    let menuName = order.menuName;

    console.log('Order details:', {
      order: order,
      petName: petName,
      menuName: menuName,
      selectedPet: order.selectedPet,
      selectedMenu: order.selectedMenu,
      petsAvailable: pets.length,
      menuItemsAvailable: menuItems.length
    });

    if (!petName && order.selectedPet && pets.length > 0) {
      const foundPet = pets.find(p => p && p._id === order.selectedPet);
      petName = foundPet?.name || 'Unknown Pet';
      console.log('Found pet:', foundPet, 'Pet name:', petName);
    }

    if (!menuName && order.selectedMenu && menuItems.length > 0) {
      const foundMenu = menuItems.find(m => m && (m.id === order.selectedMenu || m._id === order.selectedMenu));
      menuName = foundMenu?.name || foundMenu?.meal_name || 'Unknown Menu';
      console.log('Found menu:', foundMenu, 'Menu name:', menuName);
    }

    return { petName, menuName };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'preparing':
      case 'processing':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
          <OrderIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order History
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
                Order History 📋
              </Typography>
              <Typography variant="body1" color="textSecondary">
                View all your past meal orders and their status.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/customer/dashboard')}
            >
              New Order
            </Button>
          </Box>
        </Paper>

        {/* Orders List */}
        {orders.length > 0 ? (
          <Grid container spacing={3}>
            {orders.map((order, index) => {
              const orderDate = new Date(order.date_order || order.createdAt);
              const { petName, menuName } = getOrderDetails(order);
              const isRecent = (Date.now() - orderDate.getTime()) < (7 * 24 * 60 * 60 * 1000);

              return (
                <Grid item xs={12} key={`order-${order._id || index}`}>
                  <Card sx={{ 
                    borderLeft: isRecent ? '4px solid #4caf50' : 'none',
                    '&:hover': { boxShadow: 3 }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        {/* Order Icon */}
                        <Avatar 
                          sx={{ 
                            bgcolor: order.order_status === 'completed' || order.order_status === 'delivered' ? '#4caf50' : 
                                    order.order_status === 'preparing' || order.order_status === 'processing' ? '#ff9800' : 
                                    order.order_status === 'pending' ? '#2196f3' : 
                                    order.order_status === 'cancelled' ? '#f44336' : '#9e9e9e',
                            width: 56, 
                            height: 56 
                          }}
                        >
                          <ReceiptIcon sx={{ fontSize: 28 }} />
                        </Avatar>

                        {/* Order Details */}
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {order.plan} Plan
                              </Typography>
                              <Typography variant="body1" color="primary" sx={{ mt: 0.5 }}>
                                📋 {menuName || "Menu Item"}
                              </Typography>
                              <Typography variant="body1" color="secondary" sx={{ mt: 0.25 }}>
                                🐕 For {petName || "Pet"}
                              </Typography>
                            </Box>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              ${order.price}
                            </Typography>
                          </Box>

                          {/* Order Date and Status */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            <Typography variant="body2" color="text.secondary">
                              📅 {orderDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={order.order_status || 'pending'}
                                size="small"
                                color={getStatusColor(order.order_status)}
                                variant="filled"
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

                          {/* Additional Order Info */}
                          {order.quantity && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Quantity: {order.quantity}
                            </Typography>
                          )}
                          
                          {order.order_id && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Order ID: #{order.order_id}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <OrderIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No orders yet
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              You haven't placed any orders yet. Start by creating your first meal plan!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/customer/dashboard')}
              sx={{ mt: 2 }}
            >
              Place Your First Order
            </Button>
          </Paper>
        )}

        {/* Order Summary */}
        {orders.length > 0 && (
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {orders.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Orders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {orders.filter(o => o.order_status === 'completed' || o.order_status === 'delivered').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {orders.filter(o => o.order_status === 'pending' || o.order_status === 'preparing').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    ${orders.reduce((total, order) => total + (parseFloat(order.price) || 0), 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Spent
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </>
  );
}