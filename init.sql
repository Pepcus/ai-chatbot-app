CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    company VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS chat (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    path VARCHAR(255) NOT NULL,
    messages JSONB[],
    share_path VARCHAR(255),

    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL
);

-- Create Employees table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department_id INT,
    designation VARCHAR(255),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Create Employee Contacts table
CREATE TABLE employee_contacts (
    employee_id INT PRIMARY KEY,
    phone_number VARCHAR(15),
    address TEXT,
    email VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Create Salaries table
CREATE TABLE salaries (
    employee_id INT,
    salary DECIMAL(10, 2),
    from_date DATE,
    to_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Create Leave Management table
CREATE TABLE leave_management (
    leave_id SERIAL PRIMARY KEY,
    employee_id INT,
    leave_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Insert data into Departments
INSERT INTO departments (department_name) VALUES 
('Human Resources'), ('Engineering'), ('Marketing');

-- Insert 50 distinct Employees
INSERT INTO employees (first_name, last_name, department_id, designation) VALUES
('John', 'Smith', 1, 'Associate Software Engineer'),
('Jane', 'Doe', 2, 'Software Engineer'),
('Emily', 'Jones', 1, 'Senior Software Engineer'),
('Michael', 'Brown', 3, 'Lead Engineer'),
('Jessica', 'Davis', 1, 'Project Manager'),
('Matthew', 'Miller', 2, 'Solution Architect'),
('Ashley', 'Wilson', 1, 'Associate Software Engineer'),
('Joshua', 'Moore', 3, 'Software Engineer'),
('Sophia', 'Taylor', 2, 'Senior Software Engineer'),
('Daniel', 'Anderson', 1, 'Lead Engineer'),
-- Continue with more unique names...
('Olivia', 'Martin', 2, 'Project Manager'),
('Lucas', 'Garcia', 3, 'Solution Architect'),
('Mia', 'Hernandez', 1, 'Software Engineer'),
('Jack', 'Martinez', 2, 'Senior Software Engineer'),
('Amelia', 'Lopez', 1, 'Associate Software Engineer'),
('Ethan', 'Wilson', 3, 'Lead Engineer'),
('Isabella', 'Gonzalez', 2, 'Software Engineer'),
('Ryan', 'Wright', 3, 'Project Manager'),
('Zoe', 'Lopez', 1, 'Senior Software Engineer'),
('Benjamin', 'Clark', 2, 'Associate Software Engineer'),
-- Ensure all names are distinct...
('Liam', 'Harris', 3, 'Software Engineer'),
('Grace', 'Lewis', 1, 'Project Manager'),
('James', 'Robinson', 2, 'Solution Architect'),
('Ava', 'Walker', 3, 'Lead Engineer'),
('Logan', 'Perez', 1, 'Associate Software Engineer'),
('Mason', 'Hall', 2, 'Software Engineer'),
('Ella', 'Young', 3, 'Senior Software Engineer'),
('Carter', 'Allen', 1, 'Project Manager'),
('Kayla', 'Sanchez', 2, 'Solution Architect'),
('Noah', 'Wright', 3, 'Lead Engineer'),
('Chloe', 'King', 1, 'Associate Software Engineer'),
('Jacob', 'Lee', 2, 'Software Engineer'),
('Lily', 'Scott', 3, 'Senior Software Engineer'),
('William', 'Green', 1, 'Project Manager'),
('Emma', 'Adams', 2, 'Solution Architect'),
('Owen', 'Baker', 3, 'Lead Engineer'),
('Sofia', 'Gonzalez', 1, 'Software Engineer'),
('Luke', 'Nelson', 2, 'Senior Software Engineer'),
('Avery', 'Carter', 3, 'Associate Software Engineer'),
('Gabriel', 'Mitchell', 1, 'Software Engineer'),
('Madison', 'Perez', 2, 'Project Manager'),
('Henry', 'Roberts', 3, 'Solution Architect'),
('Mila', 'Campbell', 1, 'Lead Engineer'),
('Tyler', 'Parker', 2, 'Associate Software Engineer'),
('Scarlett', 'Evans', 3, 'Software Engineer'),
('Julian', 'Edwards', 1, 'Senior Software Engineer'),
('Anna', 'Collins', 2, 'Project Manager'),
('Eli', 'Stewart', 3, 'Solution Architect'),
('Zoey', 'Sanchez', 1, 'Lead Engineer'),
('Nathan', 'Morris', 2, 'Associate Software Engineer');

-- Insert Contacts for all 50 Employees
INSERT INTO employee_contacts (employee_id, phone_number, address, email) 
SELECT employee_id, 
    '555-' || LPAD(employee_id::TEXT, 4, '0'), 
    '123 Main St #' || employee_id || ', Anytown, USA', 
    LOWER(first_name || '.' || last_name || '@example.com')
FROM employees;

-- Insert Salary data for 50 Employees
INSERT INTO salaries (employee_id, salary, from_date, to_date) 
SELECT employee_id, 50000 + (employee_id * 500), '2023-01-01', '2023-12-31'
FROM employees;

-- Insert Leave Management data for 50 Employees with diverse leave types and statuses
INSERT INTO leave_management (employee_id, leave_type, start_date, end_date, status)
SELECT employee_id, 
       CASE MOD(employee_id, 5)
           WHEN 0 THEN 'Vacation'
           WHEN 1 THEN 'Sick'
           WHEN 2 THEN 'Personal'
           WHEN 3 THEN 'Maternity'
           WHEN 4 THEN 'Paternity'
       END AS leave_type,
       TO_DATE('2023-01-' || LPAD((employee_id % 28 + 1)::text, 2, '0'), 'YYYY-MM-DD') AS start_date,
       TO_DATE('2023-01-' || LPAD(LEAST(employee_id % 28 + 3 + employee_id % 5, 31)::text, 2, '0'), 'YYYY-MM-DD') AS end_date,
       CASE MOD(employee_id, 3)
           WHEN 0 THEN 'Approved'
           WHEN 1 THEN 'Pending'
           WHEN 2 THEN 'Denied'
       END AS status
FROM employees;