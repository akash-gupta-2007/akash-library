<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];
parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);

if ($method === 'GET') {
    if (!empty($qs['id'])) {
        $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$qs['id']]);
        json_response($stmt->fetch() ?: []);
    }
    $stmt = $pdo->query('SELECT * FROM students ORDER BY created_at DESC');
    json_response($stmt->fetchAll());
}

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if ($method === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO students (name, email, phone, enrollment_id, department) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$input['name'] ?? '', $input['email'] ?? null, $input['phone'] ?? null, $input['enrollment_id'] ?? null, $input['department'] ?? null]);
    json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    $id = $qs['id'] ?? ($input['id'] ?? null);
    if (!$id) { http_response_code(400); json_response(['error' => 'Missing id']); }
    $stmt = $pdo->prepare('UPDATE students SET name=?, email=?, phone=?, enrollment_id=?, department=? WHERE id=?');
    $stmt->execute([$input['name'] ?? '', $input['email'] ?? null, $input['phone'] ?? null, $input['enrollment_id'] ?? null, $input['department'] ?? null, $id]);
    json_response(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $qs['id'] ?? ($input['id'] ?? null);
    if (!$id) { http_response_code(400); json_response(['error' => 'Missing id']); }
    $stmt = $pdo->prepare('DELETE FROM students WHERE id=?');
    $stmt->execute([$id]);
    json_response(['success' => true]);
}

http_response_code(405);
json_response(['error' => 'Method not allowed']);
?>
