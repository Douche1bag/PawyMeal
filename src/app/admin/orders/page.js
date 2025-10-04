'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  ArrowBack as BackIcon,
  ShoppingCart as OrderIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  TrendingUp as StatsIcon
} from '@mui/icons-material';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cooking: 0,
    completed: 0,
    totalRevenue: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/order');
      const data = await response.json();
      
      if (data.success) {
        const orderList = data.data || [];
        setOrders(orderList);
        
        // Calculate statistics
        const stats = {
          total: orderList.length,
          pending: orderList.filter(o => o.order_status === 'pending').length,
          cooking: orderList.filter(o => o.order_status === 'cooking').length,
          completed: orderList.filter(o => o.order_status === 'completed').length,
          totalRevenue: orderList.reduce((sum, order) => sum + (order.price || 0), 0)
        };
        setStats(stats);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ids: [orderId], 
          updateData: { order_status: newStatus }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, order_status: newStatus }
            : order
        ));
        setStatusDialogOpen(false);
        setSelectedOrder(null);
        
        // Recalculate stats
        const updatedOrders = orders.map(order => 
          order._id === orderId 
            ? { ...order, order_status: newStatus }
            : order
        );
        const newStats = {
          total: updatedOrders.length,
          pending: updatedOrders.filter(o => o.order_status === 'pending').length,
          cooking: updatedOrders.filter(o => o.order_status === 'cooking').length,
          completed: updatedOrders.filter(o => o.order_status === 'completed').length,
          totalRevenue: updatedOrders.reduce((sum, order) => sum + (order.price || 0), 0)
        };
        setStats(newStats);
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'cooking': return 'primary';
      case 'completed': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
  };

  const openDetailDialog = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const StatCard = ({ title, value, color, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {title === 'Total Revenue' ? `฿${value.toLocaleString()}` : value}
            </Typography>
          </Box>
          <Box sx={{ color: color, fontSize: 40 }}>
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
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/admin/dashboard')}>
            <BackIcon />
          </IconButton>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order Management - PawyMeal Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Orders"
              value={stats.total}
              color="#2196f3"
              icon={<OrderIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Pending"
              value={stats.pending}
              color="#ff9800"
              icon={<OrderIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Cooking"
              value={stats.cooking}
              color="#2196f3"
              icon={<OrderIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Completed"
              value={stats.completed}
              color="#4caf50"
              icon={<OrderIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue}
              color="#9c27b0"
              icon={<StatsIcon />}
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              All Orders
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchOrders}
            >
              Refresh Orders
            </Button>
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Menu Item</TableCell>
                  <TableCell>Pet</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>#{order._id?.slice(-6)}</TableCell>
                    <TableCell>{order.customer_email}</TableCell>
                    <TableCell>{order.menuName || 'Menu Item'}</TableCell>
                    <TableCell>
                      {order.petName ? `${order.petName} (${order.petBreed})` : 'Pet Info'}
                    </TableCell>
                    <TableCell>{order.plan}</TableCell>
                    <TableCell>฿{order.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.order_status}
                        color={getStatusColor(order.order_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => openDetailDialog(order)}
                        sx={{ mr: 1 }}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => openStatusDialog(order)}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {orders.length === 0 && (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
              No orders found
            </Typography>
          )}
        </Paper>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Order #{selectedOrder._id?.slice(-6)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Customer: {selectedOrder.customer_email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Menu: {selectedOrder.menuName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Pet: {selectedOrder.petName} ({selectedOrder.petBreed})
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Current Status: <Chip label={selectedOrder.order_status} size="small" />
                </Typography>
                
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    defaultValue={selectedOrder.order_status}
                    label="New Status"
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="cooking">Cooking</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Order Information</Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Order ID:</strong> #{selectedOrder._id?.slice(-6)}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Customer Email:</strong> {selectedOrder.customer_email}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Plan:</strong> {selectedOrder.plan}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Quantity:</strong> {selectedOrder.quantity}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Price:</strong> ฿{selectedOrder.price}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={selectedOrder.order_status}
                      color={getStatusColor(selectedOrder.order_status)}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Menu & Pet Information</Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Menu Item:</strong> {selectedOrder.menuName || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Menu Description:</strong> {selectedOrder.menuDescription || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Pet Name:</strong> {selectedOrder.petName || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Pet Breed:</strong> {selectedOrder.petBreed || 'N/A'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Pet Age:</strong> {selectedOrder.petAge || 'N/A'} years
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Pet Weight:</strong> {selectedOrder.petWeight || 'N/A'} kg
                  </Typography>
                  {selectedOrder.petAllergies && selectedOrder.petAllergies.length > 0 && (
                    <Typography variant="body1" paragraph>
                      <strong>Pet Allergies:</strong> {selectedOrder.petAllergies.join(', ')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedOrder && (
              <Button
                variant="contained"
                onClick={() => {
                  setDetailDialogOpen(false);
                  openStatusDialog(selectedOrder);
                }}
              >
                Update Status
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}