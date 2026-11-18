-- Student Management System : MySQL schema + sample data
CREATE DATABASE IF NOT EXISTS student_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE student_db;

CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    age         TINYINT UNSIGNED NOT NULL,
    email       VARCHAR(120)  NOT NULL UNIQUE,
    phone       VARCHAR(15)   NULL,
    course      VARCHAR(50)   NOT NULL,
    marks       DECIMAL(5,2)  NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course (course),
    INDEX idx_name (name)
);

INSERT IGNORE INTO students (name, age, email, phone, course, marks) VALUES
('Arun Kumar',    20, 'arun@mail.com',    '9876543210', 'CSE',  92.50),
('Priya Devi',    21, 'priya@mail.com',   '9876543211', 'ECE',  78.00),
('Karthik Raj',   22, 'karthik@mail.com', '9876543212', 'MECH', 66.25),
('Divya Lakshmi', 20, 'divya@mail.com',   '9876543213', 'CSE',  88.75),
('Mohammed Ali',  23, 'ali@mail.com',     '9876543214', 'IT',   71.00),
('Sneha Reddy',   21, 'sneha@mail.com',   '9876543215', 'IT',   95.00),
('Vignesh S',     22, 'vignesh@mail.com', '9876543216', 'ECE',  54.50),
('Anitha M',      20, 'anitha@mail.com',  '9876543217', 'CSE',  83.00),
('Rahul Verma',   24, 'rahul@mail.com',   '9876543218', 'MECH', 45.00),
('Meena Kumari',  21, 'meena@mail.com',   '9876543219', 'IT',   61.50);
