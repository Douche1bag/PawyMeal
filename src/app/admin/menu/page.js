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
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  ArrowBack as BackIcon,
  Restaurant as RestaurantIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    status: 'available',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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

  const openDetailDialog = (item) => {
    setSelectedMenuItem(item);
    setDetailDialogOpen(true);
  };

    const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

    const handleAddMenuItem = async () => {
    try {
      let imageUrl = null;

      // First, upload the image if one was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.data.url;
        } else {
          console.error('Failed to upload image');
          // Continue without image or show error
        }
      }

      // Then create the menu item with the image URL
      const menuData = {
        ...newMenuItem,
        image_url: imageUrl
      };

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      });

      if (response.ok) {
        fetchMenuItems(); // Refresh the list
        setAddDialogOpen(false);
        resetAddForm();
        alert('Menu item added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to add menu item:', errorData.error);
        alert(`Failed to add menu item: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding menu item. Please try again.');
    }
  };

  const resetAddForm = () => {
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      status: 'available',
      image_url: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleFormChange = (field, value) => {
    setNewMenuItem(prev => ({ ...prev, [field]: value }));
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
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/admin/dashboard')}>
            <BackIcon />
          </IconButton>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Menu Management - PawyMeal Admin
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
              Menu Items Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Add Menu
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                sx={{ mr: 1 }}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                sx={{ mr: 2 }}
              >
                Table View
              </Button>
              <Button
                variant="outlined"
                onClick={fetchMenuItems}
              >
                Refresh Menu
              </Button>
            </Box>
          </Box>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <Grid container spacing={3}>
              {menuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image_url || '/images/default-meal.svg'}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {item.description?.substring(0, 80)}...
                      </Typography>
                      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={item.isActive ? 'Available' : 'Unavailable'}
                          color={item.isActive ? 'success' : 'error'}
                          size="small"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => openDetailDialog(item)}
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
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <TableContainer sx={{ overflowX: 'auto' }}>
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
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <img
                            src={item.image_url || '/images/default-meal.svg'}
                            alt={item.name}
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 16, borderRadius: 4 }}
                          />
                          {item.name}
                        </Box>
                      </TableCell>
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
                          startIcon={<ViewIcon />}
                          onClick={() => openDetailDialog(item)}
                          sx={{ mr: 1 }}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
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
          )}

          {menuItems.length === 0 && (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
              No menu items found
            </Typography>
          )}
        </Paper>

        {/* Menu Details Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={() => setDetailDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          {selectedMenuItem && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center">
                  <RestaurantIcon sx={{ mr: 1 }} />
                  {selectedMenuItem.name}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <img
                      src={selectedMenuItem.image_url || '/images/default-meal.svg'}
                      alt={selectedMenuItem.name}
                      style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Menu Details</Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Name:</strong> {selectedMenuItem.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Description:</strong> {selectedMenuItem.description}
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" component="span">
                        <strong>Status:</strong>
                      </Typography>
                      <Chip
                        label={selectedMenuItem.isActive ? 'Available' : 'Unavailable'}
                        color={selectedMenuItem.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" paragraph>
                      <strong>Created:</strong> {new Date(selectedMenuItem.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      <strong>Last Updated:</strong> {new Date(selectedMenuItem.updatedAt).toLocaleDateString()}
                    </Typography>
                    {selectedMenuItem.ingredients && selectedMenuItem.ingredients.length > 0 && (
                      <Typography variant="body1" paragraph>
                        <strong>Ingredients:</strong> {selectedMenuItem.ingredients.join(', ')}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
                <Button
                  variant="contained"
                  color={selectedMenuItem.isActive ? 'error' : 'success'}
                  onClick={() => {
                    toggleMenuStatus(selectedMenuItem.id, selectedMenuItem.isActive);
                    setDetailDialogOpen(false);
                  }}
                >
                  {selectedMenuItem.isActive ? 'Disable Item' : 'Enable Item'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add Menu Item Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Image Upload Section */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Menu Image</Typography>
                  <Box
                    sx={{
                      border: '2px dashed #ccc',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {imagePreview ? (
                      <Box>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 180,
                            objectFit: 'cover',
                            borderRadius: 8
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {imageFile?.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography variant="body1" color="textSecondary">
                          Upload Menu Image
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Recommended: 400x300px, JPG or PNG
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    sx={{ width: '100%' }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    * Upload will save image to server and database automatically
                  </Typography>
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Menu Details</Typography>
                  <TextField
                    fullWidth
                    label="Menu Name"
                    value={newMenuItem.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={newMenuItem.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    margin="normal"
                    multiline
                    rows={3}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Price (฿)"
                    value={newMenuItem.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    margin="normal"
                    type="number"
                    required
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newMenuItem.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Unavailable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddDialogOpen(false);
              resetAddForm();
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddMenuItem}
              disabled={!newMenuItem.name || !newMenuItem.description || !newMenuItem.price}
            >
              Add Menu Item
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}