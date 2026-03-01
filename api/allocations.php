<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);

if ($method === 'GET') {
    // Get all allocations with student and book info
    $stmt = $pdo->query('
        SELECT a.*, s.name as student_name, s.enrollment_id, b.title as book_title, b.isbn
        FROM allocations a
        JOIN students s ON a.student_id = s.id
        JOIN books b ON a.book_id = b.id
        ORDER BY a.issued_at DESC
    ');
    json_response($stmt->fetchAll());
}

// Allocate book to student
if ($method === 'POST' && !isset($input['action'])) {
    $student_id = $input['student_id'] ?? null;
    $book_id = $input['book_id'] ?? null;
    if (!$student_id || !$book_id) {
        http_response_code(400);
        json_response(['error' => 'Missing student_id or book_id']);
    }
    
    // Check book availability
    $stmt = $pdo->prepare('SELECT available_copies FROM books WHERE id=?');
    $stmt->execute([$book_id]);
    $book = $stmt->fetch();
    if (!$book || $book['available_copies'] <= 0) {
        http_response_code(400);
        json_response(['error' => 'Book not available']);
    }

    $pdo->beginTransaction();
    try {
        $due_date = date('Y-m-d H:i:s', strtotime('+14 days'));
        $allocStmt = $pdo->prepare('INSERT INTO allocations (student_id, book_id, due_date) VALUES (?, ?, ?)');
        $allocStmt->execute([$student_id, $book_id, $due_date]);
        
        $bookStmt = $pdo->prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id=?');
        $bookStmt->execute([$book_id]);
        
        $pdo->commit();
        json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        json_response(['error' => 'Failed to allocate book']);
    }
}

// Return book
if ($method === 'POST' && $input['action'] === 'return') {
    $alloc_id = $input['alloc_id'] ?? null;
    if (!$alloc_id) {
        http_response_code(400);
        json_response(['error' => 'Missing alloc_id']);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT book_id FROM allocations WHERE id=?');
        $stmt->execute([$alloc_id]);
        $alloc = $stmt->fetch();
        
        $returnStmt = $pdo->prepare('UPDATE allocations SET returned_at = NOW() WHERE id=?');
        $returnStmt->execute([$alloc_id]);
        
        $bookStmt = $pdo->prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id=?');
        $bookStmt->execute([$alloc['book_id']]);
        
        $pdo->commit();
        json_response(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        json_response(['error' => 'Failed to return book']);
    }
}

http_response_code(405);
json_response(['error' => 'Method not allowed']);
?>
