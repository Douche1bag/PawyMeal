'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  ArrowBack as BackIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/order`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
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
      const response = await fetch(`${API_BASE}/order`, {
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
      default: return 'default';
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
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
      <AppBar position="static" sx={{ bgcolor: '#ff9800' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/chef/dashboard')}>
            <BackIcon />
          </IconButton>
          <KitchenIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kitchen Orders - PawyMeal
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

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
      </Container>
    </>
  );
}