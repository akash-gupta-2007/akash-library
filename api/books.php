<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];
parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);

if ($method === 'GET') {
    if (!empty($qs['id'])) {
        $stmt = $pdo->prepare('SELECT * FROM books WHERE id = ?');
        $stmt->execute([$qs['id']]);
        json_response($stmt->fetch() ?: []);
    }
    $stmt = $pdo->query('SELECT * FROM books ORDER BY created_at DESC');
    json_response($stmt->fetchAll());
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if ($method === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO books (title, author, isbn, category, total_copies, available_copies, publication_year) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$input['title'] ?? '', $input['author'] ?? null, $input['isbn'] ?? null, $input['category'] ?? null, $input['total_copies'] ?? 1, $input['available_copies'] ?? 1, $input['publication_year'] ?? null]);
    json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    $id = $qs['id'] ?? ($input['id'] ?? null);
    if (!$id) { http_response_code(400); json_response(['error' => 'Missing id']); }
    $stmt = $pdo->prepare('UPDATE books SET title=?, author=?, isbn=?, category=?, total_copies=?, available_copies=?, publication_year=? WHERE id=?');
    $stmt->execute([$input['title'] ?? '', $input['author'] ?? null, $input['isbn'] ?? null, $input['category'] ?? null, $input['total_copies'] ?? 1, $input['available_copies'] ?? 1, $input['publication_year'] ?? null, $id]);
    json_response(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $qs['id'] ?? ($input['id'] ?? null);
    if (!$id) { http_response_code(400); json_response(['error' => 'Missing id']); }
    $stmt = $pdo->prepare('DELETE FROM books WHERE id=?');
    $stmt->execute([$id]);
    json_response(['success' => true]);
}

http_response_code(405);
json_response(['error' => 'Method not allowed']);
?>
