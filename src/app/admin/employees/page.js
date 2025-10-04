'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Component that handles search params (needs Suspense)
function EmployeesWithSearchParams({ setAddDialogOpen }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we should open the add dialog from URL parameter
    const action = searchParams.get('action');
    if (action === 'add') {
      setAddDialogOpen(true);
      // Clean up URL without the parameter
      const url = new URL(window.location);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams, setAddDialogOpen]);

  return null; // This component only handles side effects
}

function AdminEmployeesContent() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_no: '',
    password: '',
    role: 'Cook'
  });
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data || []);
      } else {
        setError('Failed to load employees');
      }
    } catch (error) {
      console.error('Employee fetch error:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const response = await fetch('/api/employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setAddDialogOpen(false);
        setFormData({ name: '', email: '', mobile_no: '', password: '', role: 'Cook' });
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to add employee');
      }
    } catch (error) {
      console.error('Add employee error:', error);
      setError('Failed to add employee');
    }
  };

  const handleEditEmployee = async () => {
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }

      const response = await fetch('/api/employee', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedEmployee._id, ...updateData }),
      });

      const data = await response.json();
      
      if (data.success) {
        setEditDialogOpen(false);
        setSelectedEmployee(null);
        setFormData({ name: '', email: '', mobile_no: '', password: '', role: 'Cook' });
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Update employee error:', error);
      setError('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employee?id=${employeeId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          fetchEmployees();
        } else {
          setError(data.error || 'Failed to delete employee');
        }
      } catch (error) {
        console.error('Delete employee error:', error);
        setError('Failed to delete employee');
      }
    }
  };

  const openAddDialog = () => {
    setFormData({ name: '', email: '', mobile_no: '', password: '', role: 'Cook' });
    setAddDialogOpen(true);
  };

  const openEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      mobile_no: employee.mobile_no,
      password: '',
      role: employee.role
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            Employee Management - PawyMeal Admin
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
              All Employees
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ mr: 2 }}
              >
                Add Employee
              </Button>
              <Button
                variant="outlined"
                onClick={fetchEmployees}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.mobile_no}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        color={employee.role === 'Admin' ? 'error' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.isActive ? 'Active' : 'Inactive'}
                        color={employee.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEditDialog(employee)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEmployee(employee._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {employees.length === 0 && (
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
              No employees found
            </Typography>
          )}
        </Paper>

        {/* Add Employee Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="Cook">Cook</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} variant="contained">Add Employee</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password (leave empty to keep current)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="Cook">Cook</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEmployee} variant="contained">Update Employee</Button>
          </DialogActions>
        </Dialog>

        {/* Suspense wrapper for search params */}
        <Suspense fallback={null}>
          <EmployeesWithSearchParams setAddDialogOpen={setAddDialogOpen} />
        </Suspense>
      </Container>
    </>
  );
}

// Main component with Suspense boundary
export default function AdminEmployees() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    }>
      <AdminEmployeesContent />
    </Suspense>
  );
}