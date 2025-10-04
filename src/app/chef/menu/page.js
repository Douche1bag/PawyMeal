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
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

export default function ChefMenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (data.success) {
        setMenuItems(data.data || []);
      } else {
        setError('Failed to load menu items');
      }
    } catch (error) {
      console.error('Menu fetch error:', error);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuStatus = async (menuId, currentStatus) => {
    try {
      const response = await fetch(`/api/menu/${menuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setMenuItems(menuItems.map(item => 
          item.id === menuId 
            ? { ...item, isActive: !currentStatus }
            : item
        ));
      } else {
        setError('Failed to update menu status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update menu status');
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
      <AppBar position="static" sx={{ bgcolor: '#ff9800' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/chef/dashboard')}>
            <BackIcon />
          </IconButton>
          <KitchenIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Menu Management - PawyMeal Kitchen
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              Menu Items Management
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchMenuItems}
            >
              Refresh Menu
            </Button>
          </Box>

          {/* Grid Layout for Menu Items */}
          <Grid container spacing={3}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image_url || '/images/default-meal.png'}
                    alt={item.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {item.description}
                    </Typography>
                    <Box mt={2}>
                      <Chip
                        label={item.isActive ? 'Available' : 'Unavailable'}
                        color={item.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => {
                        alert(`Menu Details:\n\nName: ${item.name}\nDescription: ${item.description}\nStatus: ${item.isActive ? 'Available' : 'Unavailable'}\nCreated: ${new Date(item.createdAt).toLocaleDateString()}`);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color={item.isActive ? 'error' : 'success'}
                      onClick={() => toggleMenuStatus(item.id, item.isActive)}
                    >
                      {item.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Table View Alternative */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Menu Summary Table
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description?.substring(0, 50)}...</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isActive ? 'Available' : 'Unavailable'}
                          color={item.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color={item.isActive ? 'error' : 'success'}
                          onClick={() => toggleMenuStatus(item.id, item.isActive)}
                        >
                          {item.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {menuItems.length === 0 && (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
              No menu items found
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
}