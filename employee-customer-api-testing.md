# Employee and Customer API Testing Commands

## Employee API Testing

### 1. Create a Cook Employee
```bash
curl -X POST http://localhost:3000/api/employee \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Chef",
    "mobile_no": "1234567890",
    "email": "john.chef@example.com", 
    "password": "password123",
    "role": "Cook",
    "hire_date": "2024-01-15",
    "salary": 45000
  }'
```

### 2. Create an Admin Employee
```bash
curl -X POST http://localhost:3000/api/employee \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Manager",
    "mobile_no": "0987654321",
    "email": "jane.manager@example.com",
    "password": "admin456",
    "role": "Admin",
    "hire_date": "2023-06-10",
    "salary": 65000
  }'
```

### 3. Get All Employees (with pagination)
```bash
curl http://localhost:3000/api/employee?page=1&limit=10
```

### 4. Get Employees by Role (Cooks only)
```bash
curl http://localhost:3000/api/employee?role=Cook
```

### 5. Get Employee by Email
```bash
curl http://localhost:3000/api/employee?email=john.chef@example.com
```

### 6. Update Employee Salary
```bash
curl -X PUT http://localhost:3000/api/employee \
  -H "Content-Type: application/json" \
  -d '{
    "id": "EMPLOYEE_ID_HERE",
    "salary": 50000,
    "role": "Cook"
  }'
```

### 7. Delete Employee (soft delete)
```bash
curl -X DELETE "http://localhost:3000/api/employee?id=EMPLOYEE_ID_HERE"
```

---

## Customer API Testing

### 1. Create a Customer
```bash
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "mobile_no": "5551234567",
    "email": "alice@example.com",
    "password": "password123",
    "address": "123 Main St, City, State 12345"
  }'
```

### 2. Create Another Customer
```bash
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson",
    "mobile_no": "5559876543",
    "email": "bob@example.com",
    "password": "secure456",
    "address": "456 Oak Ave, Town, State 54321"
  }'
```

### 3. Get All Customers (with pagination)
```bash
curl http://localhost:3000/api/customer?page=1&limit=10
```

### 4. Get Customer by Email
```bash
curl http://localhost:3000/api/customer?email=alice@example.com
```

### 5. Update Customer Information
```bash
curl -X PUT http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CUSTOMER_ID_HERE",
    "name": "Alice Johnson",
    "address": "789 Pine St, New City, State 98765",
    "mobile_no": "5551234567"
  }'
```

### 6. Delete Customer (soft delete)
```bash
curl -X DELETE "http://localhost:3000/api/customer?id=CUSTOMER_ID_HERE"
```

---

## Testing Workflow

### Step 1: Start your development server
```bash
cd /Users/aum/Desktop/Web_Project/pavymeal
npm run dev
```

### Step 2: Test Employee Creation
Run the employee creation commands above. Save the returned `_id` values for update/delete operations.

### Step 3: Test Customer Creation  
Run the customer creation commands above. Save the returned `_id` values for update/delete operations.

### Step 4: Test Retrieval Operations
Use the GET commands to verify data was created correctly.

### Step 5: Test Updates
Replace `EMPLOYEE_ID_HERE` and `CUSTOMER_ID_HERE` with actual IDs from step 2&3, then run update commands.

### Step 6: Test Deletions
Use the delete commands with actual IDs to test soft delete functionality.

---

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* object data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of objects */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## Notes
- All passwords are excluded from GET responses for security
- Both APIs support soft delete (sets `isActive: false`)
- Employee API filters by role (Cook/Admin) and email
- Customer API filters by email with pagination support
- All APIs include comprehensive error handling and validation
- Field names match your SQL schema (e.g., `mobile_no` not `mobileNumber`)