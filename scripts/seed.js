import connectDB from '../src/lib/db.js';
import Employee from '../src/models/Employee.js';
import Customer from '../src/models/Customer.js';
import Pet from '../src/models/Pet.js';
import Menu from '../src/models/Menu.js';
import Ingredient from '../src/models/Ingredient.js';
import Order from '../src/models/Order.js';
import StockReport from '../src/models/StockReport.js';
import readline from 'readline';

// Sample Employees
const sampleEmployees = [
  {
    name: 'John Doe',
    mobile_no: '1234567890',
    email: 'john@example.com',
    password: 'pass123',
    role: 'Cook'
  },
  {
    name: 'Jane Smith',
    mobile_no: '0987654321',
    email: 'jane@example.com',
    password: 'pass456',
    role: 'Admin'
  },
  {
    name: 'Emily Davis',
    mobile_no: '1122334455',
    email: 'emily@example.com',
    password: 'pass789',
    role: 'Cook'
  }
];

// Sample Customers
const sampleCustomers = [
  {
    name: 'Inchy',
    mobile_no: '0612655268',
    password: '12345',
    email: 'inchy@gmail.com',
    address: '123 Main St',
    zipcode: '10001',
    city: 'Bangkok'
  },
  {
    name: 'Bob',
    mobile_no: '6677889900',
    password: '54321',
    email: 'bob@gmail.com',
    address: '456 Elm St',
    zipcode: '10002',
    city: 'Chiang Mai'
  }
];

// Sample Ingredients
const sampleIngredients = [
  {
    name: 'Chicken',
    amount: 50,
    description: 'Chicken breast is a great source of low-fat protein for weight management and is easily digestible.'
  },
  {
    name: 'Red Rice',
    amount: 30,
    description: 'Red Jasmine rice is high in dietary fiber and Vitamin A, support heart system and healthy in digestion.'
  },
  {
    name: 'Broccoli',
    amount: 20,
    description: 'Broccoli has multiple potent antioxidants help support healthy cells and tissues throughout the body.'
  },
  {
    name: 'Sweet Potato',
    amount: 50,
    description: 'Sweet potato has high dietary fiber vitamin B6, vitamin C, and manganese with Anthocyanin that acts as an antioxidant, anti-aging, and helps repair cells.'
  },
  {
    name: 'Carrot',
    amount: 100,
    description: 'Carrot is known for being high in Vitamin A, K and C that support eye health and powerful antioxidants that support the immune system.'
  },
  {
    name: 'Salmon',
    amount: 30,
    description: 'Salmon is able to promote a healthy brain, good skin, shiny hair and better immune system.'
  }
];

// Sample Pets
const samplePets = [
  {
    name: 'Coffee',
    weight: 2,
    gender: 'Female',
    allergies: ['Salmon', 'Dairy'],
    age: 1,
    active: 'False',
    breed: 'Chihuahua',
    body_conditions: 'Moderate',
    neutered: false,
    customer_id: null // Will be replaced with actual customer ID
  },
  {
    name: 'Milo',
    weight: 8.2,
    gender: 'Female',
    allergies: ['Chicken'],
    age: 2,
    active: 'True',
    breed: 'Poodle',
    body_conditions: 'Skinny',
    neutered: true,
    customer_id: null // Will be replaced with actual customer ID
  }
];

// Sample Menus
const sampleMenus = [
  {
    name: 'Lamb Meal',
    description: 'Lamb is naturally rich in protein which helps muscle growth and supports muscle mass include fiber sources.',
    image_url: 'https://drive.google.com/uc?export=view&id=1wgkJ9lKsskbVgPvTJmtUnTxEptZbRrXA',
    ingredients: [] // Will be populated with ingredient IDs
  },
  {
    name: 'Carb Meal',
    description: 'A healthy mix of sweet potato and quinoa.',
    image_url: 'https://drive.google.com/uc?export=view&id=1h3Y2r6XPzPWjtG9AJSSfv0f4HiPpoFvz',
    ingredients: []
  },
  {
    name: 'Vegy Meal',
    description: 'A healthy mix of vegetables.',
    image_url: 'https://drive.google.com/uc?export=view&id=1efdH73ju-Y0UFVtG_cS2QRoOFTvIH_kn',
    ingredients: []
  },
  {
    name: 'Beef Meal',
    description: 'Beef is a great source of healthy protein, fats, high calories, and great taste include some great source of fiber.',
    image_url: 'https://drive.google.com/uc?export=view&id=1YZImG6-1eijGSRIJPE4gJR-BTsHATkOZ',
    ingredients: []
  },
  {
    name: 'Salmon Meal',
    description: 'Salmon contains high protein, omega-3 fatty acids, and a wide range of minerals and B vitamins along with vegetables.',
    image_url: 'https://drive.google.com/uc?export=view&id=1okilSKxgxXKau2g1nSHxuJ5KtJMy2Y9m',
    ingredients: []
  },
  {
    name: 'Chicken Meal',
    description: 'Chicken breast is a great source of lean protein include with vegetable for fiber.',
    image_url: 'https://drive.google.com/uc?export=view&id=1qmolH79xMji-BoP6ufiCnLMa4SeSZqja',
    ingredients: []
  }
];

// Create readline interface for interactive menu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function seedDatabase() {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Employee.deleteMany({});
    await Customer.deleteMany({});
    await Pet.deleteMany({});
    await Ingredient.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});
    await StockReport.deleteMany({});
    
    console.log('🗑️ Cleared existing data');

    // Create employees
    const createdEmployees = await Employee.insertMany(sampleEmployees);
    console.log(`👥 Created ${createdEmployees.length} employees`);

    // Create customers
    const createdCustomers = await Customer.insertMany(sampleCustomers);
    console.log(`👤 Created ${createdCustomers.length} customers`);

    // Create ingredients
    const createdIngredients = await Ingredient.insertMany(sampleIngredients);
    console.log(`🥕 Created ${createdIngredients.length} ingredients`);
    
    // Update pet customer IDs
    const petsWithOwners = samplePets.map(pet => ({
      ...pet,
      customer_id: createdCustomers[0]._id
    }));

    // Create pets
    const createdPets = await Pet.insertMany(petsWithOwners);
    console.log(`🐾 Created ${createdPets.length} pets`);

    // Create menus with ingredient references
    const menusWithIngredients = sampleMenus.map((menu, index) => {
      // Assign some ingredients to each menu
      const ingredientIds = createdIngredients.slice(0, 3).map(ing => ing._id);
      return {
        ...menu,
        ingredients: ingredientIds
      };
    });

    const createdMenus = await Menu.insertMany(menusWithIngredients);
    console.log(`🍽️ Created ${createdMenus.length} menus`);

    // Create sample stock report
    const sampleStockReport = {
      reported_date: new Date('2025-02-23'),
      employee_reporter_id: createdEmployees.find(emp => emp.role === 'Cook')._id,
      status: 'Pending',
      employee_solver_id: null
    };

    const createdStockReport = await StockReport.create(sampleStockReport);
    console.log(`📊 Created sample stock report`);

    // Create sample order
    const sampleOrder = {
      plan: '7 Days',
      quantity: 2,
      price: 399.00,
      date_order: new Date('2025-02-23'),
      customer_id: createdCustomers[0]._id,
      cook_employee_id: createdEmployees.find(emp => emp.role === 'Cook')._id,
      order_status: 'Cooking',
      admin_employee_id: createdEmployees.find(emp => emp.role === 'Admin')._id,
      menus: [createdMenus[0]._id, createdMenus[1]._id]
    };

    const createdOrder = await Order.create(sampleOrder);
    console.log(`📦 Created sample order`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Employees:');
    createdEmployees.forEach(emp => {
      console.log(`${emp.role}: ${emp.email} / ${emp.password}`);
    });
    console.log('\nCustomers:');
    createdCustomers.forEach(customer => {
      console.log(`Customer: ${customer.email} / ${customer.password}`);
    });

    return { createdEmployees, createdCustomers, createdPets, createdIngredients, createdMenus, createdOrder };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

function displayCurlCommands(data) {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('\n🔧 CURL Testing Commands:');
  console.log('=' .repeat(50));
  
  // Authentication examples
  console.log('\n📝 Authentication:');
  console.log('Login as customer:');
  console.log(`curl -X POST ${baseUrl}/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"customer123"}'`);
  
  console.log('\nLogin as admin:');
  console.log(`curl -X POST ${baseUrl}/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@pawymeals.com","password":"admin123"}'`);

  // Customer endpoints
  console.log('\n👤 Customer Endpoints:');
  console.log('Get all customers:');
  console.log(`curl -X GET ${baseUrl}/customer`);
  
  console.log('\nCreate new customer:');
  console.log(`curl -X POST ${baseUrl}/customer \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Test Customer",
    "mobile_no":"9999999999",
    "password":"testpass",
    "email":"test@example.com",
    "address":"123 Test St",
    "zipcode":"12345",
    "city":"Test City"
  }'`);

  // Employee endpoints  
  console.log('\n👥 Employee Endpoints:');
  console.log('Get all employees:');
  console.log(`curl -X GET ${baseUrl}/employee`);
  
  console.log('\nCreate new employee:');
  console.log(`curl -X POST ${baseUrl}/employee \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Test Employee",
    "mobile_no":"8888888888",
    "email":"employee@test.com",
    "password":"emppass",
    "role":"Cook"
  }'`);

  // Pet endpoints
  console.log('\n🐾 Pet Endpoints:');
  console.log('Get all pets:');
  console.log(`curl -X GET ${baseUrl}/pet`);
  
  console.log('\nCreate new pet:');
  if (data && data.createdCustomers && data.createdCustomers.length > 0) {
    console.log(`curl -X POST ${baseUrl}/pet \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Fluffy",
    "breed":"Labrador",
    "age":2,
    "weight":25,
    "gender":"Male",
    "active":"True",
    "allergies":["Wheat"],
    "body_conditions":"Healthy",
    "neutered":true,
    "customer_id":"${data.createdCustomers[0]._id}"
  }'`);
  } else {
    console.log(`curl -X POST ${baseUrl}/pet \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Fluffy",
    "breed":"Labrador",
    "age":2,
    "weight":25,
    "gender":"Male",
    "active":"True",
    "allergies":["Wheat"],
    "body_conditions":"Healthy",
    "neutered":true,
    "customer_id":"[CUSTOMER_ID]"
  }'`);
  }

  // Menu/Meal endpoints
  console.log('\n🍽️ Menu/Meal Endpoints:');
  console.log('Get all meals:');
  console.log(`curl -X GET ${baseUrl}/menu`);
  
  console.log('\nGet menu by ID:');
  if (data && data.createdMenus && data.createdMenus.length > 0) {
    console.log(`curl -X GET ${baseUrl}/menu/${data.createdMenus[0]._id}`);
  } else {
    console.log(`curl -X GET ${baseUrl}/menu/[MENU_ID]`);
  }

  console.log('\nCreate new menu:');
  console.log(`curl -X POST ${baseUrl}/menu \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Turkey & Rice Bowl",
    "description":"Lean turkey with brown rice and vegetables",
    "image_url":"https://example.com/turkey-bowl.jpg",
    "ingredients":["[INGREDIENT_ID_1]", "[INGREDIENT_ID_2]"]
  }'`);

  // Ingredient endpoints
  console.log('\n🥕 Ingredient Endpoints:');
  console.log('Get all ingredients:');
  console.log(`curl -X GET ${baseUrl}/ingredient`);
  
  console.log('\nCreate new ingredient:');
  console.log(`curl -X POST ${baseUrl}/ingredient \\
  -H "Content-Type: application/json" \\
  -d '{
    "name":"Turkey",
    "amount":25,
    "description":"High-quality lean protein source"
  }'`);

  // Order endpoints
  console.log('\n📦 Order Endpoints:');
  console.log('Get all orders:');
  console.log(`curl -X GET ${baseUrl}/order`);
  
  console.log('\nCreate new order:');
  if (data && data.createdCustomers && data.createdMenus && data.createdEmployees) {
    const cookEmployee = data.createdEmployees.find(emp => emp.role === 'Cook');
    const adminEmployee = data.createdEmployees.find(emp => emp.role === 'Admin');
    console.log(`curl -X POST ${baseUrl}/order \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan":"14 Days",
    "quantity":1,
    "price":699.00,
    "date_order":"${new Date().toISOString()}",
    "customer_id":"${data.createdCustomers[0]._id}",
    "cook_employee_id":"${cookEmployee._id}",
    "order_status":"Pending",
    "admin_employee_id":"${adminEmployee._id}",
    "menus":["${data.createdMenus[0]._id}"]
  }'`);
  } else {
    console.log(`curl -X POST ${baseUrl}/order \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan":"14 Days",
    "quantity":1,
    "price":699.00,
    "date_order":"${new Date().toISOString()}",
    "customer_id":"[CUSTOMER_ID]",
    "cook_employee_id":"[COOK_EMPLOYEE_ID]",
    "order_status":"Pending",
    "admin_employee_id":"[ADMIN_EMPLOYEE_ID]",
    "menus":["[MENU_ID]"]
  }'`);
  }



  // Stock Report endpoints
  console.log('\n� Stock Report Endpoints:');
  console.log('Get all stock reports:');
  console.log(`curl -X GET ${baseUrl}/stock-report`);
  
  console.log('\nCreate new stock report:');
  if (data && data.createdEmployees) {
    const cookEmployee = data.createdEmployees.find(emp => emp.role === 'Cook');
    console.log(`curl -X POST ${baseUrl}/stock-report \\
  -H "Content-Type: application/json" \\
  -d '{
    "reported_date":"${new Date().toISOString()}",
    "employee_reporter_id":"${cookEmployee._id}",
    "status":"Pending"
  }'`);
  } else {
    console.log(`curl -X POST ${baseUrl}/stock-report \\
  -H "Content-Type: application/json" \\
  -d '{
    "reported_date":"${new Date().toISOString()}",
    "employee_reporter_id":"[COOK_EMPLOYEE_ID]",
    "status":"Pending"
  }'`);
  }

  console.log('\n💡 Tips:');
  console.log('- Add -v flag for verbose output: curl -v ...');
  console.log('- Add -i flag to include response headers: curl -i ...');
  console.log('- Use jq to format JSON responses: curl ... | jq');
  console.log('- Save response to file: curl ... -o response.json');
}

async function showMainMenu() {
  console.log('\n🚀 PavyMeal Database & API Testing Tool');
  console.log('=' .repeat(40));
  console.log('1. Seed Database');
  console.log('2. Show CURL Commands');
  console.log('3. Seed Database & Show CURL Commands');
  console.log('4. Exit');
  console.log('=' .repeat(40));
  
  const choice = await question('Please select an option (1-4): ');
  
  switch (choice) {
    case '1':
      try {
        await seedDatabase();
        console.log('\n✅ Database seeded successfully!');
      } catch (error) {
        console.error('❌ Error seeding database:', error);
      }
      break;
      
    case '2':
      displayCurlCommands();
      break;
      
    case '3':
      try {
        const data = await seedDatabase();
        displayCurlCommands(data);
      } catch (error) {
        console.error('❌ Error seeding database:', error);
        displayCurlCommands();
      }
      break;
      
    case '4':
      console.log('👋 Goodbye!');
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log('❌ Invalid option. Please try again.');
      return showMainMenu();
  }
  
  // Ask if user wants to continue
  const continueChoice = await question('\nWould you like to see the menu again? (y/n): ');
  if (continueChoice.toLowerCase() === 'y' || continueChoice.toLowerCase() === 'yes') {
    return showMainMenu();
  } else {
    rl.close();
    process.exit(0);
  }
}

// Check if script is run with command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  switch (args[0]) {
    case 'seed':
      seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'curl':
      displayCurlCommands();
      process.exit(0);
      break;
    case 'both':
      seedDatabase()
        .then(data => {
          displayCurlCommands(data);
          process.exit(0);
        })
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: node seed.js [seed|curl|both]');
      process.exit(1);
  }
} else {
  // Show interactive menu
  showMainMenu();
}