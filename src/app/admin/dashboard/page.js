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
  CardActions,
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
  IconButton
} from '@mui/material';
import {
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as OrderIcon,
  TrendingUp as StatsIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalMenuItems: 0
  });
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const employeeResponse = await fetch('/api/employee');
      const employeeData = await employeeResponse.json();
      
      // Fetch customers
      const customerResponse = await fetch('/api/customer');
      const customerData = await customerResponse.json();
      
      // Fetch menu items
      const menuResponse = await fetch('/api/menu');
      const menuData = await menuResponse.json();

      // Fetch orders (if exists)
      let orderCount = 0;
      try {
        const orderResponse = await fetch('/api/order');
        const orderData = await orderResponse.json();
        orderCount = orderData.success ? orderData.data?.length || 0 : 0;
      } catch (e) {
        console.log('Orders not available yet');
      }

      if (employeeData.success && customerData.success && menuData.success) {
        setEmployees(employeeData.data || []);
        setCustomers(customerData.data || []);
        
        setStats({
          totalEmployees: employeeData.data?.length || 0,
          totalCustomers: customerData.data?.length || 0,
          totalOrders: orderCount,
          totalMenuItems: menuData.data?.length || 0
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
      {/* Admin Header */}
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard - PawyMeal
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
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<PeopleIcon />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={<PeopleIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Menu Items"
              value={stats.totalMenuItems}
              icon={<RestaurantIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<OrderIcon />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Employees Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Recent Employees
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => router.push('/admin/employees')}
                >
                  Manage
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.slice(0, 5).map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role}
                            color={employee.role === 'Admin' ? 'error' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {employees.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  No employees found
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Customers Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Recent Customers
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => router.push('/admin/customers')}
                >
                  Manage
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.slice(0, 5).map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.mobile_no}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {customers.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                  No customers found
                </Typography>
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
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => router.push('/admin/employees/new')}
              >
                Add Employee
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RestaurantIcon />}
                onClick={() => router.push('/admin/menu')}
              >
                Manage Menu
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<StatsIcon />}
                onClick={() => window.location.reload()} 
              >
                Refresh Stats
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}