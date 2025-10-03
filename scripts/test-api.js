// API Testing Script for Pawy Meals
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://localhost:3000/api';

// Test data
const testPet = {
  name: 'Test Dog',
  breed: 'Labrador',
  age: 2,
  weight: 25,
  size: 'Large',
  activityLevel: 'High',
  allergies: ['Chicken'],
  ownerId: 'test-owner-123'
};

const testMeal = {
  name: 'Test Meal',
  description: 'A test meal for API testing',
  primaryProtein: 'Beef',
  suitableFor: {
    sizes: ['Large'],
    activityLevels: ['High'],
    ageGroups: ['Adult']
  },
  ingredients: [
    { name: 'Beef', quantity: '200', unit: 'grams' }
  ],
  nutrition: {
    calories: 400,
    protein: 30,
    fat: 15,
    carbohydrates: 20,
    fiber: 3
  },
  price: 15.99,
  servingSize: '200g',
  preparationTime: 20,
  category: 'Dinner'
};

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'test123',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  role: 'customer'
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}:`, response.status, result);
    return result;
  } catch (error) {
    console.error(`Error with ${method} ${endpoint}:`, error);
    return null;
  }
}

// Test functions
async function testPetCRUD() {
  console.log('\n🐾 Testing Pet CRUD Operations...');
  
  // CREATE
  const createResult = await apiCall('/pet', 'POST', testPet);
  if (!createResult?.success) return;
  
  const petId = createResult.data._id;
  
  // READ
  await apiCall(`/pet/${petId}`, 'GET');
  await apiCall('/pet?limit=5', 'GET');
  
  // UPDATE
  await apiCall(`/pet/${petId}`, 'PUT', { age: 3 });
  
  // DELETE
  await apiCall(`/pet/${petId}`, 'DELETE');
}

async function testMealCRUD() {
  console.log('\n🍽️ Testing Meal CRUD Operations...');
  
  // CREATE
  const createResult = await apiCall('/menu', 'POST', testMeal);
  if (!createResult?.success) return;
  
  const mealId = createResult.data._id;
  
  // READ
  await apiCall(`/menu/${mealId}`, 'GET');
  await apiCall('/menu?category=Dinner&limit=5', 'GET');
  
  // UPDATE
  await apiCall(`/menu/${mealId}`, 'PUT', { price: 17.99 });
  
  // DELETE
  await apiCall(`/menu/${mealId}`, 'DELETE');
}

async function testUserCRUD() {
  console.log('\n👥 Testing User CRUD Operations...');
  
  // CREATE
  const createResult = await apiCall('/user', 'POST', testUser);
  if (!createResult?.success) return;
  
  const userId = createResult.data._id;
  
  // READ
  await apiCall(`/user/${userId}`, 'GET');
  await apiCall('/user?role=customer&limit=5', 'GET');
  
  // UPDATE
  await apiCall(`/user/${userId}`, 'PUT', { firstName: 'Updated' });
  
  // DELETE
  await apiCall(`/user/${userId}`, 'DELETE');
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // First create a user
  await apiCall('/user', 'POST', testUser);
  
  // Test login
  await apiCall('/login', 'POST', {
    email: testUser.email,
    password: testUser.password
  });
  
  // Test with wrong credentials
  await apiCall('/login', 'POST', {
    email: testUser.email,
    password: 'wrongpassword'
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests for Pawy Meals...');
  
  try {
    await testUserCRUD();
    await testAuthentication();
    await testPetCRUD();
    await testMealCRUD();
    
    console.log('\n✅ All API tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
} else {
  // Browser environment - attach to window
  window.testPawyMealsAPI = runAllTests;
  console.log('🧪 API tests loaded! Run window.testPawyMealsAPI() to start testing.');
}

// Auto-run if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}