# Akash Library Management System

A professional, fully-functional library management system built with HTML, CSS, JavaScript, PHP, and MySQL.

## Features

✨ **Core Features:**
- 📚 **Student Management** - Create, read, update, delete student records
- 📖 **Book Management** - Create, read, update, delete book inventory
- 🔄 **Book Allocation** - Allocate books to students with tracking
- 📊 **Status Dashboard** - View all allocations and returns
- 🔍 **Search & Filter** - Quick search across all records
- 🎯 **Dashboard** - Statistics and recent activity overview

🎨 **Design Features:**
- **Professional UI** - Red and White color theme
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Modern Navigation** - Sticky navbar with quick access
- **Modal Dialogs** - View detailed information
- **Toast Notifications** - User feedback on actions
- **Data Tables** - Sortable and searchable records

## Setup Instructions

### 1. Create Database

Run the SQL schema to set up your MySQL database:

```sql
-- Execute sql/schema.sql in phpMyAdmin or MySQL CLI
mysql -u root -p < sql/schema.sql
```

Or manually import `sql/schema.sql` via phpMyAdmin.

### 2. Configure Database Connection

Edit `api/db.php` and update these credentials:

```php
$DB_HOST = '127.0.0.1';   // Your MySQL host
$DB_NAME = 'akash_library'; // Database name
$DB_USER = 'root';          // MySQL username
$DB_PASS = '';              // MySQL password
```

### 3. Deploy to Web Server

Copy the entire `ccweb` folder to your web server:

**For XAMPP:**
```
C:\xampp\htdocs\ccweb\
```

**For Linux/Apache:**
```
/var/www/html/ccweb/
```

### 4. Access the Application

Open your web browser and navigate to:

```
http://localhost/ccweb/public/index.html        (XAMPP)
http://yourdomain.com/ccweb/public/index.html   (Live Server)
```

## Project Structure

```
ccweb/
├── api/
│   ├── db.php              # Database connection
│   ├── students.php        # Student CRUD API
│   ├── books.php           # Book CRUD API
│   └── allocations.php     # Book allocation API
├── public/
│   ├── index.html          # Dashboard page
│   ├── students.html       # Student management page
│   ├── books.html          # Book management page
│   ├── status.html         # Allocation status page
│   └── assets/
│       ├── css/style.css   # Professional styling
│       └── js/app.js       # JavaScript functionality
└── sql/
    └── schema.sql          # Database schema & sample data
```

## Pages Overview

### 📊 Dashboard (index.html)
- Overview statistics
- Quick action buttons
- Recent activity feed

### 👥 Students (students.html)
- Create new student records
- View all students
- Edit student information
- Delete student records
- See which books each student has issued

### 📚 Books (books.html)
- Create new book entries
- View all books
- Edit book information
- Delete book records
- Allocate books to students

### 📋 Status (status.html)
- View all book allocations
- Filter by status (all, active, returned)
- See overdue books
- Return books to library

## Key Technologies

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** PHP 7+
- **Database:** MySQL 5.7+
- **Icons:** FontAwesome 6.4
- **Fonts:** Poppins (Google Fonts)

## Database Schema

### Students Table
- id, name, email, phone, enrollment_id, department, status
- created_at, updated_at

### Books Table
- id, title, author, isbn, category, total_copies, available_copies
- publication_year, status, created_at, updated_at

### Allocations Table
- id, student_id, book_id, issued_at, due_date, returned_at, fine
- Tracks which student has which book

## API Endpoints

### Students
- `GET  /api/students.php` - List all students
- `GET  /api/students.php?id=1` - Get specific student
- `POST /api/students.php` - Create new student
- `PUT  /api/students.php?id=1` - Update student
- `DELETE /api/students.php?id=1` - Delete student

### Books
- `GET  /api/books.php` - List all books
- `GET  /api/books.php?id=1` - Get specific book
- `POST /api/books.php` - Create new book
- `PUT  /api/books.php?id=1` - Update book
- `DELETE /api/books.php?id=1` - Delete book

### Allocations
- `GET  /api/allocations.php` - List all allocations
- `POST /api/allocations.php` - Allocate book to student
- `POST /api/allocations.php` - Return book (action=return)

## Features in Detail

### 🎨 Professional Design
- Modern, clean interface
- Red (#c62828) and White color scheme
- Smooth animations and transitions
- Responsive grid layouts
- Card-based design system

### 🔐 Data Management
- CRUD operations on all entities
- Foreign key relationships
- Transaction support for allocations
- Automatic availability updates

### 📱 Responsive Design
- Mobile-friendly navigation
- Adaptive table layouts
- Touch-friendly buttons
- Flexible grid system

### 🔍 Search & Filter
- Real-time search across records
- Filter allocations by status
- Quick-access navigation

## Tips for Usage

1. **Add Sample Data** - The database comes with sample students and books
2. **Allocate Books** - Go to Books page and use the allocation form
3. **Track Returns** - View Status page to see and return books
4. **View Student Books** - Click "View" in Students page to see what they have
5. **Dashboard Stats** - Check dashboard for quick overview

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Troubleshooting

### Database Connection Issues
- Ensure MySQL service is running
- Check credentials in `api/db.php`
- Verify database `akash_library` exists

### API Not Found (404)
- Ensure `api/` folder is in the same directory as `public/`
- Check PHP is enabled on server
- Verify file paths in JavaScript

### Styles Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure `public/assets/css/style.css` exists
- Check file permissions

## Future Enhancements

- 🔐 User authentication & roles
- 📧 Email notifications
- 💰 Fine/dues management
- 📈 Advanced reporting
- 📊 Data export (PDF, Excel)
- 🔔 SMS notifications
- 📱 Mobile app
- 🌙 Dark mode

## Support

For issues or questions, refer to the code documentation or check browser console for errors.

## License

This project is open source and available for educational purposes.

---

**Created:** March 2024  
**Tech Stack:** HTML5, CSS3, JavaScript, PHP, MySQL  
**Designed for:** Library Management and Book Tracking
