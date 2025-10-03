-- 1. Create Employee table with roles
CREATE TABLE Employee (
    employee_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('Cook', 'Admin'))
);

-- 2. Create Customer table
CREATE TABLE Customer (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    zipcode TEXT,
    city TEXT
);

-- 3. Create Pet table
CREATE TABLE Pet (
    pet_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    weight DECIMAL(5,2),
    gender VARCHAR(10),
    allergies TEXT[],
    age INT,
    active VARCHAR(255),
    breed VARCHAR(255),
    body_conditions TEXT,
    neutered BOOLEAN,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

-- 4. Create Ingredient table
CREATE TABLE Ingredient (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2),
    description TEXT
);

-- 5. Create Menu table
CREATE TABLE Menu (
    menu_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
);

-- Junction Table: Menu_Ingredient (Many-to-Many Relationship between Menu and Ingredients)
CREATE TABLE Menu_Ingredient (
    menu_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    PRIMARY KEY (menu_id, ingredient_id),
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredient(ingredient_id) ON DELETE CASCADE
);

-- 6. Create Stock Reports table (Only Cook can report, Only Admin can solve)
CREATE TABLE Stock_Reports (
    report_id SERIAL PRIMARY KEY,
    reported_date DATE NOT NULL,
    employee_reporter_id INT,
    status VARCHAR(255) NOT NULL,
    employee_solver_id INT,
    FOREIGN KEY (employee_reporter_id) REFERENCES Employee(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (employee_solver_id) REFERENCES Employee(employee_id) ON DELETE SET NULL
);

-- 7. Create Order_Item table (Only Cook and Admin allowed for their respective fields)
CREATE TABLE Order_Item (
    order_id SERIAL PRIMARY KEY,
    plan VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_order DATE NOT NULL,
    customer_id INT NOT NULL,
    cook_employee_id INT,
    order_status VARCHAR(255) NOT NULL,
    admin_employee_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (cook_employee_id) REFERENCES Employee(employee_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_employee_id) REFERENCES Employee(employee_id) ON DELETE SET NULL
);

-- 8. Junction Table to store multiple menu items per order
CREATE TABLE Order_Menu (
    order_id INT NOT NULL,
    menu_id INT NOT NULL,
    PRIMARY KEY (order_id, menu_id),
    FOREIGN KEY (order_id) REFERENCES Order_Item(order_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id) ON DELETE CASCADE
);
