CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    salt VARCHAR(100) NOT NULL,
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

-- Create Employee table
CREATE TABLE IF NOT EXISTS employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(255),
    designation VARCHAR(255),
    phone_number VARCHAR(15),
    address TEXT,
    company VARCHAR(100),
    email VARCHAR(255)
);

-- Create Salary table
CREATE TABLE IF NOT EXISTS salary (
    id SERIAL PRIMARY KEY,
    employee_id INT,
    salary_amount DECIMAL(10, 2),
    from_date DATE,
    to_date DATE,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- Create Leave table
CREATE TABLE IF NOT EXISTS leave (
    id SERIAL PRIMARY KEY,
    employee_id INT,
    leave_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

INSERT INTO employee (name, department, designation, phone_number, address, email, company) VALUES
('John Smith', 'Engineering', 'Associate Engineer', '1234567890', '123 Main St, New York, NY', 'john.smith@example.com', 'TSS'),
('Emma Johnson', 'Quality Assurance', 'Engineer', '2345678901', '456 Elm St, Los Angeles, CA', 'emma.johnson@example.com', 'REZ'),
('Michael Williams', 'Human Resource', 'Senior Engineer', '3456789012', '789 Oak St, Chicago, IL', 'michael.williams@example.com', 'ERC'),
('Olivia Brown', 'Marketing', 'Lead Engineering', '4567890123', '101 Pine St, San Francisco, CA', 'olivia.brown@example.com', 'TSS'),
('William Jones', 'Sales', 'Solution Architect', '5678901234', '202 Cedar St, Houston, TX', 'william.jones@example.com', 'REZ'),
('Sophia Garcia', 'Engineering', 'Associate Engineer', '6789012345', '303 Maple St, Philadelphia, PA', 'sophia.garcia@example.com', 'ERC'),
('James Martinez', 'Quality Assurance', 'Engineer', '7890123456', '404 Birch St, Phoenix, AZ', 'james.martinez@example.com', 'TSS'),
('Ava Rodriguez', 'Human Resource', 'Senior Engineer', '8901234567', '505 Oak St, San Antonio, TX', 'ava.rodriguez@example.com', 'REZ'),
('Alexander Wilson', 'Marketing', 'Lead Engineering', '9012345678', '606 Pine St, San Diego, CA', 'alexander.wilson@example.com', 'ERC'),
('Mia Lopez', 'Sales', 'Solution Architect', '0123456789', '707 Cedar St, Dallas, TX', 'mia.lopez@example.com', 'TSS'),
('Ethan Lee', 'Engineering', 'Associate Engineer', '1234567890', '808 Maple St, San Jose, CA', 'ethan.lee@example.com', 'REZ'),
('Charlotte Gonzales', 'Quality Assurance', 'Engineer', '2345678901', '909 Birch St, Austin, TX', 'charlotte.gonzales@example.com', 'ERC'),
('Daniel Perez', 'Human Resource', 'Senior Engineer', '3456789012', '1010 Oak St, Jacksonville, FL', 'daniel.perez@example.com', 'TSS'),
('Amelia Taylor', 'Marketing', 'Lead Engineering', '4567890123', '1111 Pine St, Fort Worth, TX', 'amelia.taylor@example.com', 'REZ'),
('Matthew Moore', 'Sales', 'Solution Architect', '5678901234', '1212 Cedar St, Columbus, OH', 'matthew.moore@example.com', 'ERC'),
('Ella King', 'Engineering', 'Associate Engineer', '6789012345', '1313 Maple St, Charlotte, NC', 'ella.king@example.com', 'TSS'),
('David Hernandez', 'Quality Assurance', 'Engineer', '7890123456', '1414 Birch St, Indianapolis, IN', 'david.hernandez@example.com', 'REZ'),
('Madison Nelson', 'Human Resource', 'Senior Engineer', '8901234567', '1515 Oak St, San Francisco, CA', 'madison.nelson@example.com', 'ERC'),
('Carter Walker', 'Marketing', 'Lead Engineering', '9012345678', '1616 Pine St, Seattle, WA', 'carter.walker@example.com', 'TSS'),
('Penelope Reed', 'Sales', 'Solution Architect', '0123456789', '1717 Cedar St, Denver, CO', 'penelope.reed@example.com', 'REZ'),
('Aiden Hill', 'Engineering', 'Associate Engineer', '1234567890', '1818 Maple St, Boston, MA', 'aiden.hill@example.com', 'ERC'),
('Sofia Green', 'Quality Assurance', 'Engineer', '2345678901', '1919 Birch St, Detroit, MI', 'sofia.green@example.com', 'TSS'),
('Owen Adams', 'Human Resource', 'Senior Engineer', '3456789012', '2020 Oak St, Memphis, TN', 'owen.adams@example.com', 'REZ'),
('Grace Baker', 'Marketing', 'Lead Engineering', '4567890123', '2121 Pine St, Nashville, TN', 'grace.baker@example.com', 'ERC'),
('Jack Nelson', 'Sales', 'Solution Architect', '5678901234', '2222 Cedar St, Baltimore, MD', 'jack.nelson@example.com', 'TSS'),
('Lily Carter', 'Engineering', 'Associate Engineer', '6789012345', '2323 Maple St, Oklahoma City, OK', 'lily.carter@example.com', 'REZ'),
('Luke Collins', 'Quality Assurance', 'Engineer', '7890123456', '2424 Birch St, Louisville, KY', 'luke.collins@example.com', 'ERC'),
('Chloe Hall', 'Human Resource', 'Senior Engineer', '8901234567', '2525 Oak St, Milwaukee, WI', 'chloe.hall@example.com', 'TSS'),
('Jackson Ward', 'Marketing', 'Lead Engineering', '9012345678', '2626 Pine St, Portland, OR', 'jackson.ward@example.com', 'REZ'),
('Zoe Ramirez', 'Sales', 'Solution Architect', '0123456789', '2727 Cedar St, Las Vegas, NV', 'zoe.ramirez@example.com', 'ERC'),
('Madelyn Ramirez', 'Engineering', 'Associate Engineer', '1234567890', '2828 Maple St, Albuquerque, NM', 'madelyn.ramirez@example.com', 'TSS'),
('Henry Long', 'Quality Assurance', 'Engineer', '2345678901', '2929 Birch St, Tucson, AZ', 'henry.long@example.com', 'REZ'),
('Levi Morgan', 'Human Resource', 'Senior Engineer', '3456789012', '3030 Oak St, Fresno, CA', 'levi.morgan@example.com', 'ERC'),
('Ellie Cooper', 'Marketing', 'Lead Engineering', '4567890123', '3131 Pine St, Sacramento, CA', 'ellie.cooper@example.com', 'TSS'),
('Sebastian Rodriguez', 'Sales', 'Solution Architect', '5678901234', '3232 Cedar St, Long Beach, CA', 'sebastian.rodriguez@example.com', 'REZ'),
('Harper Perez', 'Engineering', 'Associate Engineer', '6789012345', '3333 Maple St, Kansas City, MO', 'harper.perez@example.com', 'ERC'),
('Nora Hughes', 'Quality Assurance', 'Engineer', '7890123456', '3434 Birch St, Mesa, AZ', 'nora.hughes@example.com', 'TSS'),
('Mateo Flores', 'Human Resource', 'Senior Engineer', '8901234567', '3535 Oak St, Atlanta, GA', 'mateo.flores@example.com', 'REZ'),
('Hazel Diaz', 'Marketing', 'Lead Engineering', '9012345678', '3636 Pine St, Virginia Beach, VA', 'hazel.diaz@example.com', 'ERC'),
('Eleanor Richardson', 'Sales', 'Solution Architect', '0123456789', '3737 Cedar St, Omaha, NE', 'eleanor.richardson@example.com', 'TSS'),
('Miles Cruz', 'Engineering', 'Associate Engineer', '1234567890', '3838 Maple St, Oakland, CA', 'miles.cruz@example.com', 'REZ'),
('Liam Edwards', 'Quality Assurance', 'Engineer', '2345678901', '3939 Birch St, Minneapolis, MN', 'liam.edwards@example.com', 'ERC'),
('Avery Wood', 'Human Resource', 'Senior Engineer', '3456789012', '4040 Oak St, Tulsa, OK', 'avery.wood@example.com', 'TSS'),
('Scarlett Reyes', 'Marketing', 'Lead Engineering', '4567890123', '4141 Pine St, Arlington, TX', 'scarlett.reyes@example.com', 'REZ'),
('Grace Richardson', 'Sales', 'Solution Architect', '5678901234', '4242 Cedar St, New Orleans, LA', 'grace.richardson@example.com', 'ERC'),
('Riley Brooks', 'Engineering', 'Associate Engineer', '6789012345', '4343 Maple St, Wichita, KS', 'riley.brooks@example.com', 'TSS'),
('Julian Stewart', 'Quality Assurance', 'Engineer', '7890123456', '4444 Birch St, Cleveland, OH', 'julian.stewart@example.com', 'REZ'),
('Luna Sanchez', 'Human Resource', 'Senior Engineer', '8901234567', '4545 Oak St, Honolulu, HI', 'luna.sanchez@example.com', 'ERC'),
('Audrey Rogers', 'Marketing', 'Lead Engineering', '9012345678', '4646 Pine St, Tampa, FL', 'audrey.rogers@example.com', 'TSS'),
('Max Bennett', 'Sales', 'Solution Architect', '0123456789', '4747 Cedar St, Pittsburgh, PA', 'max.bennett@example.com', 'REZ');

-- Insert Salary data for 50 Employees
INSERT INTO salary (employee_id, salary_amount, from_date, to_date) 
SELECT employee_id, 50000 + (employee_id * 500), '2023-01-01', '2023-12-31'
FROM employee;

-- Insert Leave Management data for 50 Employees with diverse leave types and statuses
INSERT INTO leave (employee_id, leave_type, start_date, end_date, status)
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
FROM employee;