'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Link,
  Grid,
  CircularProgress
} from '@mui/material';

const userRoles = [
  { value: 'customer', label: 'Customer' },
  { value: 'chef', label: 'Chef' },
  { value: 'admin', label: 'Admin' },
  { value: 'delivery', label: 'Delivery Driver' }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, role, firstName, lastName, phone, address, ...otherData } = formData;
      
      // Map form data to new Customer model fields
      const submitData = {
        username: formData.username,
        email: formData.email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phone,
        password: formData.password,
        accountType: 'Customer', // Default to Customer
        streetAddress: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      };

      const response = await fetch('/api/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please login with your credentials.');
        router.push('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Join Pawy Meals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account to start managing pet nutrition
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                helperText="Unique username for your account"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                helperText="We'll use this for login and notifications"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                helperText="For delivery notifications"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.role}
                  name="role"
                  onChange={handleInputChange}
                  label="Account Type"
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                helperText="Minimum 6 characters"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}