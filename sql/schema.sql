-- Akash Library Management System
CREATE DATABASE IF NOT EXISTS akash_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE akash_library;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  enrollment_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150),
  isbn VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  publication_year INT,
  status ENUM('available', 'unavailable') DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  returned_at DATETIME NULL,
  fine DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_book (book_id)
);

-- Sample data
INSERT INTO students (name, email, phone, enrollment_id, department) VALUES
('Raj Kumar', 'raj@example.com', '9876543210', 'ENG001', 'Engineering'),
('Priya Singh', 'priya@example.com', '9876543211', 'COM001', 'Commerce'),
('Amit Patel', 'amit@example.com', '9876543212', 'SCI001', 'Science');

INSERT INTO books (title, author, isbn, category, total_copies, available_copies, publication_year) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 3, 2, 1925),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 2, 1, 1960),
('1984', 'George Orwell', '9780451524935', 'Science Fiction', 4, 3, 1949);
