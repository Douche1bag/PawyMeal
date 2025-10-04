const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Import your models
const Employee = require('../src/models/Employee.js');

// MongoDB connection string - adjust if different
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawymeals';

async function resetEmployeePasswords() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Reset passwords for existing employees
    const employees = [
      {
        email: 'inchy.chef@example.com',
        newPassword: 'chef123',
        role: 'Cook'
      },
      {
        email: 'admin@example.com', 
        newPassword: 'admin123',
        role: 'Admin'
      }
    ];

    console.log('\n🔐 Resetting employee passwords...');
    
    for (const emp of employees) {
      const hashedPassword = await bcrypt.hash(emp.newPassword, 12);
      
      const result = await Employee.updateOne(
        { email: emp.email },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ ${emp.role} (${emp.email}): Password reset to "${emp.newPassword}"`);
      } else {
        console.log(`❌ ${emp.role} (${emp.email}): Employee not found`);
      }
    }

    console.log('\n📋 Updated Login Credentials:');
    console.log('Cook: inchy.chef@example.com / chef123');
    console.log('Admin: admin@example.com / admin123');
    
    console.log('\n✅ Password reset completed!');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetEmployeePasswords();