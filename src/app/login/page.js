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
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Restaurant as ChefIcon,
  AdminPanelSettings as AdminIcon,
  DeliveryDining as DeliveryIcon
} from '@mui/icons-material';

const userRoles = [
  { value: 'customer', label: 'Customer', icon: <PersonIcon />, color: '#2196f3' },
  { value: 'chef', label: 'Chef', icon: <ChefIcon />, color: '#ff9800' },
  { value: 'admin', label: 'Admin', icon: <AdminIcon />, color: '#f44336' },
];

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          accountType: loginData.role // <-- add this line
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Do NOT store user in localStorage
        // Redirect based on role
        if (data.data.role !== loginData.role) {
          setError(`You selected ${loginData.role} but your account is registered as ${data.data.role}`);
          setLoading(false);
          return;
        }
        switch (data.data.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'chef':
            router.push('/chef/dashboard');
            break;
          default:
            router.push('/customer/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = userRoles.find(role => role.value === loginData.role);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Pawy Meals Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to manage your pet's nutrition
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box mb={3}>
            <FormControl fullWidth>
              <InputLabel>I am a...</InputLabel>
              <Select
                value={loginData.role}
                name="role"
                onChange={handleInputChange}
                label="I am a..."
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: role.color }}>{role.icon}</Box>
                      {role.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={loginData.email}
            onChange={handleInputChange}
            required
            margin="normal"
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={loginData.password}
            onChange={handleInputChange}
            required
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: selectedRole?.color,
              '&:hover': {
                bgcolor: selectedRole?.color,
                filter: 'brightness(0.9)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                {selectedRole?.icon}
                <Box ml={1}>
                  Sign in as {selectedRole?.label}
                </Box>
              </>
            )}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/register" underline="hover">
                Sign up here
              </Link>
            </Typography>
          </Box>
        </form>

        <Box mt={4} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Secure login with role-based access control
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}