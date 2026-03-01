// Compute API base path
const computeApiBase = () => {
    const segments = window.location.pathname.split('/');
    const pubIdx = segments.indexOf('public');
    if (pubIdx !== -1) {
        segments.splice(pubIdx);
    }
    const root = segments.join('/') || '';
    return (root === '' ? '' : root) + '/api/';
};

const API_BASE = computeApiBase();

// API Wrapper
async function apiCall(endpoint, options = {}) {
    const url = API_BASE + endpoint;
    try {
        const response = await fetch(url, options);
        if (!response.ok) console.error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return {};
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== MODAL MANAGEMENT =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

document.querySelectorAll('.modal-close').forEach(el => {
    el.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) closeModal(modal.id);
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
    });
});

// ===== STUDENTS PAGE =====
if (document.getElementById('studentForm')) {
    const studentForm = document.getElementById('studentForm');
    const studentTable = document.getElementById('studentTableBody');
    const searchStudent = document.getElementById('searchStudent');
    let allStudents = [];

    // Load Students
    async function loadStudents() {
        allStudents = await apiCall('students.php');
        renderStudents(allStudents);
    }

    function renderStudents(students) {
        studentTable.innerHTML = '';
        if (students.length === 0) {
            studentTable.innerHTML = '<tr><td colspan="8" class="text-center">No students found</td></tr>';
            return;
        }
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email || '-'}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.enrollment_id || '-'}</td>
                <td>${student.department || '-'}</td>
                <td><button class="btn btn-primary" onclick="viewStudentBooks(${student.id}, '${student.name}')">View</button></td>
                <td>
                    <button class="btn btn-primary" onclick="editStudent(${student.id})" style="background: #2196f3">Edit</button>
                    <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    }

    // Submit Form
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('studentId').value;
        const data = {
            name: document.getElementById('studentName').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            enrollment_id: document.getElementById('studentEnroll').value,
            department: document.getElementById('studentDept').value
        };

        const options = {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        const endpoint = id ? `students.php?id=${id}` : 'students.php';
        const result = await apiCall(endpoint, options);

        if (result.success || result.id) {
            showToast(id ? 'Student updated successfully' : 'Student added successfully');
            studentForm.reset();
            loadStudents();
        } else {
            showToast('Error saving student', 'error');
        }
    });

    // Edit Student
    window.editStudent = async (id) => {
        const student = allStudents.find(s => s.id == id);
        if (!student) return;
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentEmail').value = student.email || '';
        document.getElementById('studentPhone').value = student.phone || '';
        document.getElementById('studentEnroll').value = student.enrollment_id || '';
        document.getElementById('studentDept').value = student.department || '';
        window.scrollTo(0, 0);
    };

    // Delete Student
    window.deleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        const result = await apiCall(`students.php?id=${id}`, { method: 'DELETE' });
        if (result.success) {
            showToast('Student deleted successfully');
            loadStudents();
        } else {
            showToast('Error deleting student', 'error');
        }
    };

    // View Student Books
    window.viewStudentBooks = async (studentId, studentName) => {
        const allocations = await apiCall('allocations.php');
        const studentAllocations = allocations.filter(a => a.student_id == studentId);
        
        const tbody = document.getElementById('studentBooksBody');
        tbody.innerHTML = '';
        if (studentAllocations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No books issued</td></tr>';
        } else {
            studentAllocations.forEach(alloc => {
                const row = document.createElement('tr');
                const status = alloc.returned_at ? 'Returned' : 'Active';
                row.innerHTML = `
                    <td>${alloc.book_title}</td>
                    <td>${new Date(alloc.issued_at).toLocaleDateString()}</td>
                    <td>${new Date(alloc.due_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${alloc.returned_at ? 'status-returned' : 'status-active'}">${status}</span></td>
                `;
                tbody.appendChild(row);
            });
        }
        document.getElementById('studentNameModal').textContent = studentName;
        openModal('booksModal');
    };

    // Search Filter
    searchStudent.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allStudents.filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.email && s.email.toLowerCase().includes(term)) ||
            (s.enrollment_id && s.enrollment_id.toLowerCase().includes(term))
        );
        renderStudents(filtered);
    });

    loadStudents();
}

// ===== BOOKS PAGE =====
if (document.getElementById('bookForm')) {
    const bookForm = document.getElementById('bookForm');
    const bookTable = document.getElementById('bookTableBody');
    const searchBook = document.getElementById('searchBook');
    const allocateForm = document.getElementById('allocateForm');
    const allocStudent = document.getElementById('allocStudent');
    const allocBook = document.getElementById('allocBook');
    let allBooks = [];
    let allStudents = [];

    // Load Books
    async function loadBooks() {
        allBooks = await apiCall('books.php');
        renderBooks(allBooks);
    }

    function renderBooks(books) {
        bookTable.innerHTML = '';
        if (books.length === 0) {
            bookTable.innerHTML = '<tr><td colspan="9" class="text-center">No books found</td></tr>';
            return;
        }
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author || '-'}</td>
                <td>${book.isbn || '-'}</td>
                <td>${book.category || '-'}</td>
                <td>${book.total_copies || 0}</td>
                <td>${book.available_copies || 0}</td>
                <td>${book.publication_year || '-'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editBook(${book.id})" style="background: #2196f3">Edit</button>
                    <button class="btn btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                </td>
            `;
            bookTable.appendChild(row);
        });
        updateAllocateSelects();
    }

    // Submit Form
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('bookId').value;
        const data = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            isbn: document.getElementById('bookISBN').value,
            category: document.getElementById('bookCategory').value,
            total_copies: document.getElementById('bookTotal').value,
            available_copies: document.getElementById('bookAvailable').value,
            publication_year: document.getElementById('bookYear').value
        };

        const options = {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        const endpoint = id ? `books.php?id=${id}` : 'books.php';
        const result = await apiCall(endpoint, options);

        if (result.success || result.id) {
            showToast(id ? 'Book updated successfully' : 'Book added successfully');
            bookForm.reset();
            loadBooks();
        } else {
            showToast('Error saving book', 'error');
        }
    });

    // Edit Book
    window.editBook = async (id) => {
        const book = allBooks.find(b => b.id == id);
        if (!book) return;
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author || '';
        document.getElementById('bookISBN').value = book.isbn || '';
        document.getElementById('bookCategory').value = book.category || '';
        document.getElementById('bookTotal').value = book.total_copies || 1;
        document.getElementById('bookAvailable').value = book.available_copies || 0;
        document.getElementById('bookYear').value = book.publication_year || '';
        window.scrollTo(0, 0);
    };

    // Delete Book
    window.deleteBook = async (id) => {
        if (!confirm('Are you sure you want to delete this book?')) return;
        const result = await apiCall(`books.php?id=${id}`, { method: 'DELETE' });
        if (result.success) {
            showToast('Book deleted successfully');
            loadBooks();
        } else {
            showToast('Error deleting book', 'error');
        }
    };

    // Update Allocate Selects
    async function updateAllocateSelects() {
        allStudents = await apiCall('students.php');
        allocStudent.innerHTML = '<option value="">Choose a student...</option>';
        allocBook.innerHTML = '<option value="">Choose a book...</option>';
        
        allStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            allocStudent.appendChild(option);
        });

        allBooks.filter(b => b.available_copies > 0).forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (${book.available_copies} available)`;
            allocBook.appendChild(option);
        });
    }

    // Allocate Book
    allocateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = allocStudent.value;
        const bookId = allocBook.value;

        if (!studentId || !bookId) {
            showToast('Please select both student and book', 'error');
            return;
        }

        const result = await apiCall('allocations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, book_id: bookId })
        });

        if (result.success) {
            showToast('Book allocated successfully');
            allocateForm.reset();
            loadBooks();
        } else {
            showToast(result.error || 'Error allocating book', 'error');
        }
    });

    // Search Filter
    searchBook.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b =>
            b.title.toLowerCase().includes(term) ||
            (b.author && b.author.toLowerCase().includes(term)) ||
            (b.isbn && b.isbn.toLowerCase().includes(term))
        );
        renderBooks(filtered);
    });

    loadBooks();
}

// ===== STATUS PAGE =====
if (document.getElementById('statusTable')) {
    const statusTable = document.getElementById('statusTableBody');
    const searchStatus = document.getElementById('searchStatus');
    const filterTabs = document.querySelectorAll('.tab-btn');
    let allAllocations = [];
    let currentFilter = 'all';

    // Load Allocations
    async function loadAllocations() {
        allAllocations = await apiCall('allocations.php');
        renderAllocations(allAllocations);
        updateStats();
    }

    function renderAllocations(allocations) {
        statusTable.innerHTML = '';
        if (allocations.length === 0) {
            statusTable.innerHTML = '<tr><td colspan="9" class="text-center">No allocations found</td></tr>';
            return;
        }

        allocations.forEach(alloc => {
            const row = document.createElement('tr');
            const isActive = !alloc.returned_at;
            const isDue = isActive && new Date(alloc.due_date) < new Date();
            const status = alloc.returned_at ? 'Returned' : (isDue ? 'Overdue' : 'Active');
            const statusClass = alloc.returned_at ? 'status-returned' : (isDue ? 'status-overdue' : 'status-active');

            row.innerHTML = `
                <td>${alloc.student_name}</td>
                <td>${alloc.enrollment_id || '-'}</td>
                <td>${alloc.book_title}</td>
                <td>${alloc.isbn || '-'}</td>
                <td>${new Date(alloc.issued_at).toLocaleDateString()}</td>
                <td>${new Date(alloc.due_date).toLocaleDateString()}</td>
                <td>${alloc.returned_at ? new Date(alloc.returned_at).toLocaleDateString() : '-'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    ${isActive ? `<button class="btn btn-success" onclick="returnBook(${alloc.id})">Return</button>` : '-'}
                </td>
            `;
            statusTable.appendChild(row);
        });
    }

    // Filter Handler
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            filterAndRender();
        });
    });

    function filterAndRender() {
        let filtered = allAllocations;

        if (currentFilter === 'active') {
            filtered = allAllocations.filter(a => !a.returned_at);
        } else if (currentFilter === 'returned') {
            filtered = allAllocations.filter(a => a.returned_at);
        }

        renderAllocations(filtered);
    }

    // Return Book
    window.returnBook = async (allocId) => {
        if (!confirm('Are you sure you want to return this book?')) return;
        const result = await apiCall('allocations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'return', alloc_id: allocId })
        });

        if (result.success) {
            showToast('Book returned successfully');
            loadAllocations();
        } else {
            showToast('Error returning book', 'error');
        }
    };

    // Update Stats
    function updateStats() {
        const active = allAllocations.filter(a => !a.returned_at).length;
        const returned = allAllocations.filter(a => a.returned_at).length;
        const overdue = allAllocations.filter(a => !a.returned_at && new Date(a.due_date) < new Date()).length;

        document.getElementById('activeStat').textContent = active;
        document.getElementById('returnedStat').textContent = returned;
        document.getElementById('overdueStat').textContent = overdue;
    }

    // Search Filter
    searchStatus.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allAllocations.filter(a =>
            a.student_name.toLowerCase().includes(term) ||
            (a.enrollment_id && a.enrollment_id.toLowerCase().includes(term)) ||
            a.book_title.toLowerCase().includes(term)
        );
        renderAllocations(filtered);
    });

    loadAllocations();
}

// ===== DASHBOARD PAGE =====
if (document.getElementById('recentActivityBody')) {
    async function loadDashboard() {
        const students = await apiCall('students.php');
        const books = await apiCall('books.php');
        const allocations = await apiCall('allocations.php');

        // Update Stats
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalBooks').textContent = books.length;
        document.getElementById('activeAllocations').textContent = allocations.filter(a => !a.returned_at).length;
        document.getElementById('availableBooks').textContent = books.reduce((sum, b) => sum + (b.available_copies || 0), 0);

        // Recent Activity
        const recent = allocations.slice(0, 10);
        const tbody = document.getElementById('recentActivityBody');
        tbody.innerHTML = '';
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No activity yet</td></tr>';
        } else {
            recent.forEach(alloc => {
                const status = alloc.returned_at ? 'Returned' : 'Active';
                const statusClass = alloc.returned_at ? 'status-returned' : 'status-active';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${alloc.student_name}</td>
                    <td>${alloc.book_title}</td>
                    <td>${new Date(alloc.issued_at).toLocaleDateString()}</td>
                    <td>${new Date(alloc.due_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    loadDashboard();
}

// Update nav active state
function updateNavActive() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

updateNavActive();
