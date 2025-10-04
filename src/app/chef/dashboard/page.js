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
  ListItemIcon
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  ShoppingCart as OrderIcon,
  MenuBook as MenuIcon,
  Kitchen as KitchenIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

export default function ChefDashboard() {
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todaysOrders: 0
  });
  const [menuItems, setMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
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
        setMenuItems(menuData.data || []);
        setRecentOrders(orders.slice(0, 10)); // Show recent 10 orders
        
        // Calculate stats
        const pendingOrders = orders.filter(order => 
          order.order_status === 'pending' || order.order_status === 'preparing'
        ).length;
        
        const completedOrders = orders.filter(order => 
          order.order_status === 'completed' || order.order_status === 'delivered'
        ).length;

        // Today's orders (you can adjust this logic based on your date field)
        const today = new Date().toISOString().split('T')[0];
        const todaysOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate).toISOString().split('T')[0];
          return orderDate === today;
        }).length;

        setStats({
          totalMenuItems: menuData.data?.length || 0,
          pendingOrders,
          completedOrders,
          todaysOrders
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
      {/* Chef Header */}
      <AppBar position="static" sx={{ bgcolor: '#ff9800' }}>
        <Toolbar>
          <KitchenIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chef Dashboard - PawyMeal Kitchen
          </Typography>
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Menu Items"
              value={stats.totalMenuItems}
              icon={<MenuIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={<PendingIcon />}
              color="#f44336"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Today"
              value={stats.completedOrders}
              icon={<CompleteIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Orders"
              value={stats.todaysOrders}
              icon={<OrderIcon />}
              color="#2196f3"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Menu Items Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Menu Items
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => router.push('/chef/menu')}
                >
                  Manage Menu
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {menuItems.slice(0, 8).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>Pet Meal</TableCell>
                        <TableCell>฿0</TableCell>
                        <TableCell>
                          <Chip
                            label={item.isActive ? 'Available' : 'Unavailable'}
                            color={item.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {menuItems.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  No menu items found
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Recent Orders Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Recent Orders
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => router.push('/chef/orders')}
                >
                  View All
                </Button>
              </Box>
              <List dense>
                {recentOrders.slice(0, 6).map((order, index) => (
                  <ListItem key={order._id || index} divider>
                    <ListItemIcon>
                      <OrderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Order #${order._id?.slice(-6) || (index + 1).toString().padStart(6, '0')}`}
                      secondary={`${order.menuName || 'Menu Item'} - ${order.petName || 'Pet'} - ${order.order_status || 'pending'}`}
                    />
                  </ListItem>
                ))}
              </List>
              {recentOrders.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  No recent orders
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Kitchen Operations
          </Typography>
          <Grid container spacing={2}>

            <Grid item>
              <Button
                variant="outlined"
                startIcon={<OrderIcon />}
                onClick={() => router.push('/chef/orders')}
              >
                View Orders
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RestaurantIcon />}
                onClick={() => window.location.reload()}
              >
                Refresh Dashboard
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}