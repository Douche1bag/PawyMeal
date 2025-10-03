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
    allergies TEXT,
    age INT,
    active VARCHAR(255),
    breed VARCHAR(255),
    body_conditions TEXT,
    neutered BOOLEAN,
    customer_id INT REFERENCES Customer(customer_id) ON DELETE CASCADE
);
ALTER TABLE Pet ADD COLUMN allergies TEXT[];

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
CREATE TABLE Menu_Ingredient (
    menu_id INT REFERENCES Menu(menu_id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES Ingredient(ingredient_id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, ingredient_id)
);

-- 6. Create Stock Reports table (Only Cook can report, Only Admin can solve)
CREATE TABLE Stock_Reports (
    report_id SERIAL PRIMARY KEY,
    reported_date DATE NOT NULL,
    employee_reporter_id INT REFERENCES Employee(employee_id) ON DELETE SET NULL,
    status VARCHAR(255) NOT NULL,
    employee_solver_id INT REFERENCES Employee(employee_id) ON DELETE SET NULL
);

-- 7. Create Order_Item table (Only Cook and Admin allowed for their respective fields)
CREATE TABLE Order_Item (
    order_id SERIAL PRIMARY KEY,
    plan VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_order DATE NOT NULL,
    customer_id INT REFERENCES Customer(customer_id) ON DELETE CASCADE,
    cook_employee_id INT REFERENCES Employee(employee_id) ON DELETE SET NULL,
    order_status VARCHAR(255) NOT NULL,
    admin_employee_id INT REFERENCES Employee(employee_id) ON DELETE SET NULL
);

-- 8. Junction Table to store multiple menu items per order (Ensures Foreign Key Constraint)
CREATE TABLE Order_Menu (
    order_id INT REFERENCES Order_Item(order_id) ON DELETE CASCADE,
    menu_id INT REFERENCES Menu(menu_id) ON DELETE CASCADE,
    PRIMARY KEY (order_id, menu_id)
);


INSERT INTO Employee (name, mobile_no, email, password, role) VALUES
('John Doe', '1234567890', 'john@example.com', 'pass123', 'Cook'),
('Jane Smith', '0987654321', 'jane@example.com', 'pass456', 'Admin'),
('Emily Davis', '1122334455', 'emily@example.com', 'pass789', 'Cook');

SELECT * FROM Employee;

INSERT INTO Customer (name, mobile_no, password, email, address, zipcode, city) 
VALUES 
('Inchy', '0612655268', '12345', 'inchy@gamil.com', '123 Main St', '10001', 'Bangkok'),
('Bob', '6677889900', '54321', 'bob@gamil.com', '456 Elm St', '10002', 'Chiang Mai');

SELECT * FROM Customer;

INSERT INTO Pet (name, weight, gender, allergies, age, active, breed, body_conditions, neutered, customer_id) 
VALUES 
('Coffee', 2, 'Female', ARRAY['Salmon','Dairy'], 1, 'False', 'Chihuahua', 'Moderate', FALSE, 1),
('Milo', 8.2, 'Female', 'Chicken', 2, TRUE, 'Poodle', 'Skinny', TRUE, 2);

SELECT * FROM Pet

INSERT INTO Ingredient (name, amount, description) 
VALUES 
('Chicken', 50,'Chicken breast is a great source of low-fat protein for weight management and is easily digestible.'), 
('Red Rice', 30,'Red Jasminee rice is high in dietary fiber and Vitamin A, support heart system and healthy in digestion.'), 
('Broccoli', 20,'Broccoli has multiple potent antioxidants help support healthy cells and tissues throughout the body.'),
('Sweet Potato',50,'Sweet potato has high dietary fiber vitamin B6, vitamin C, and manganese with Anthocyanin that acts as an antioxidant, anti-aging, and helps repair cells.'),
('Carrot',100,'Carrot is known for being high in Vitamin A, K and C that support eye health and powerful antioxidants that support the immune system.'),
('Salmon',30,'Salmon is able to promote a healthy brain, good skin, shiny hair and better immune system.'),
('Wagame',40,'Wagame is able to lower cholesterol levels, decreases blood pressure, enhances weight loss and reduces blood sugar.'),
('Pumpkin',30,'Pumpkin is high in vitamins, minerals, and fiber. It can be a healthy addition to your dogs diet. It may also help ease digestive problems like constipation and diarrhea'),
('Beef',40,'Beef is high in essential amino acids and plenty of vitamin and minerals that support muscle development and encourage optimum skin health.'),
('Red Bell Pepper',45,'Red bell pepper is rich in carotenoids, antioxidants, and vitamin A, C and E.'),
('Gogi Berry', 30,'Goji berry contains high amounts of vitamin A, B, C, and E, improving bone structure, muscle, and nerve health.'),
('Quinoa',25,'Support metabolism, brain function and good sources of energy for daily activities.'),
('Lamb',25,'Lamb is high in essential amino acids, natural L-carnitine, creatine, and plenty of vitamin and minerals that support muscle development and encourage optimum skin health.'),
('Pea',12,'Peas are rich in iron and other vitamins and minerals that can help support your dogs immune system, digestion, and overall health. Peas also contain antioxidants that can help reduce inflammation and help keep your dog healthy as they age');
SELECT * FROM Ingredient
SELECT ingredient_id,name FROM Ingredient

INSERT INTO Menu (name, description, image_url) 
VALUES 
('Lamb Meal', 'Lamb is naturally rich in protein which helps muscle growth and supports muscle mass include fiber sources.', 
 'https://drive.google.com/uc?export=view&id=1wgkJ9lKsskbVgPvTJmtUnTxEptZbRrXA'),

('Carb Meal', 'A healthy mix of sweet potato and quinoa.', 
 'https://drive.google.com/uc?export=view&id=1h3Y2r6XPzPWjtG9AJSSfv0f4HiPpoFvz'),

('Vegy Meal', 'A healthy mix of vegetables.', 
 'https://drive.google.com/uc?export=view&id=1efdH73ju-Y0UFVtG_cS2QRoOFTvIH_kn'),

('Beef Meal', 'Beef is a great source of healthy protein, fats, high calories, and great taste include some great source of fiber.', 
 'https://drive.google.com/uc?export=view&id=1YZImG6-1eijGSRIJPE4gJR-BTsHATkOZ'),

('Salmon Meal', 'Salmon contains high protein, omega-3 fatty acids, and a wide range of minerals and B vitamins along with vegetables.', 
 'https://drive.google.com/uc?export=view&id=1okilSKxgxXKau2g1nSHxuJ5KtJMy2Y9m'),

('Chicken Meal', 'Chicken breast is a great source of lean protein include with vegetable for fiber.', 
 'https://drive.google.com/uc?export=view&id=1qmolH79xMji-BoP6ufiCnLMa4SeSZqja');
SELECT * FROM Menu

INSERT INTO Menu_Ingredient (menu_id, ingredient_id) 
VALUES 
(6, 1), 
(6, 5), 
(6, 4), 
(6, 3),
(5, 6), 
(5, 7), 
(5, 5), 
(5, 8), 
(4, 9), 
(4, 10), 
(4, 5), 
(4, 2), 
(3, 5), 
(3, 4), 
(3, 11), 
(3, 7), 
(2, 4), 
(2, 12), 
(2, 3), 
(2, 5), 
(1, 13),
(1, 2),
(1, 3),
(1, 14);


SELECT m.name AS menu_name, i.name AS ingredient_name 
FROM Menu_Ingredient mi
JOIN Menu m ON mi.menu_id = m.menu_id
JOIN Ingredient i ON mi.ingredient_id = i.ingredient_id;


INSERT INTO Stock_Reports (reported_date, employee_reporter_id, status, employee_solver_id) 
VALUES 
('2025-02-23', 1, 'Pending', NULL),  -- Reported by Cook (Employee ID 1), not solved yet
('2025-02-24', 2, 'Resolved', 3);   -- Reported by Cook (Employee ID 2), solved by Admin (Employee ID 3)

SELECT s.report_id, s.reported_date, e1.name AS reported_by, s.status, e2.name AS solved_by
FROM Stock_Reports s
LEFT JOIN Employee e1 ON s.employee_reporter_id = e1.employee_id
LEFT JOIN Employee e2 ON s.employee_solver_id = e2.employee_id;

INSERT INTO Order_Item (plan, quantity, price, date_order, customer_id, cook_employee_id, order_status, admin_employee_id) 
VALUES 
('7 Days', 2, 399.00, '2025-02-23', 1, 1, 'Cooking', 3),
('14 Days', 1, 699.00, '2025-02-24', 2, 2, 'Completed', 3);

SELECT o.order_id, o.plan, o.quantity, o.price, o.date_order, c.name AS customer_name, 
       e1.name AS cook_name, o.order_status, e2.name AS admin_name
FROM Order_Item o
JOIN Customer c ON o.customer_id = c.customer_id
LEFT JOIN Employee e1 ON o.cook_employee_id = e1.employee_id
LEFT JOIN Employee e2 ON o.admin_employee_id = e2.employee_id;

INSERT INTO Order_Menu (order_id, menu_id) 
VALUES 
(1, 1), -- Order 1 contains Chicken Meal
(1, 2), -- Order 1 contains Salmon Meal
(2, 3); -- Order 2 contains Beef Meal

SELECT o.order_id, o.plan, c.name AS customer_name, m.name AS menu_name 
FROM Order_Menu om
JOIN Order_Item o ON om.order_id = o.order_id
JOIN Customer c ON o.customer_id = c.customer_id
JOIN Menu m ON om.menu_id = m.menu_id;