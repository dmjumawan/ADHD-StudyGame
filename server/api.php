<?php
// ADHD Study Game - API Server
// Hostinger Backend API for studyshroom database

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'u448967149_shroom_api');
define('DB_PASS', 'Hagi1961!');
define('DB_NAME', 'u448967149_studyshroom');

// Connect to database
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'details' => $conn->connect_error]);
    exit;
}

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];

// Try PATH_INFO first (standard), then fall back to parsing the URL
$action = '';
if (!empty($_SERVER['PATH_INFO'])) {
    $endpoint = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    $action = $endpoint[0] ?? '';
} else {
    // Fallback: parse REQUEST_URI
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $parts = explode('/', trim($uri, '/'));
    // Find 'api.php' and get the next part
    foreach ($parts as $i => $part) {
        if ($part === 'api.php' && isset($parts[$i + 1])) {
            $action = $parts[$i + 1];
            break;
        }
    }
}

// Route requests
switch ($action) {
    case 'test':
        handleTestRequest($conn);
        break;
    case 'player':
        handlePlayerRequest($conn, $method);
        break;
    case 'session':
        handleSessionRequest($conn, $method);
        break;
    case 'leaderboard':
        handleLeaderboardRequest($conn, $method);
        break;
    case 'stats':
        handleStatsRequest($conn, $method);
        break;
    case 'presence':
        handlePresenceRequest($conn, $method);
        break;
    case 'online-players':
        handleOnlinePlayersRequest($conn, $method);
        break;
    case 'chat':
        handleChatRequest($conn, $method);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}

$conn->close();

// ==================== TEST HANDLER ====================
function handleTestRequest($conn) {
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Database connection failed',
            'details' => $conn->connect_error
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'API is working',
            'database' => 'Connected',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}

// ==================== PLAYER HANDLERS ====================
function handlePlayerRequest($conn, $method) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($method === 'POST') {
        // Save/Update player data
        $userId = $input['userId'] ?? null;
        $playerData = $input['playerData'] ?? null;
        
        if (!$userId || !$playerData) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId or playerData']);
            return;
        }
        
        $name = $conn->real_escape_string($playerData['name'] ?? 'Player');
        $currency = intval($playerData['currency'] ?? 0);
        $characterId = $conn->real_escape_string($playerData['characterId'] ?? 'girl1');
        $items = json_encode($playerData['items'] ?? []);
        $totalMinutesStudied = intval($playerData['totalMinutesStudied'] ?? 0);
        $completedSessions = intval($playerData['completedSessions'] ?? 0);
        $petType = $playerData['petType'] ?? null;
        $petHunger = intval($playerData['petHunger'] ?? 0);
        $petFood = intval($playerData['petFood'] ?? 0);
        
        $sql = "INSERT INTO players (user_id, name, currency, character_id, items, total_minutes_studied, completed_sessions, pet_type, pet_hunger, pet_food, updated_at)
                VALUES ('$userId', '$name', $currency, '$characterId', '$items', $totalMinutesStudied, $completedSessions, " . ($petType ? "'$petType'" : "NULL") . ", $petHunger, $petFood, NOW())
                ON DUPLICATE KEY UPDATE
                name='$name', currency=$currency, character_id='$characterId', items='$items', 
                total_minutes_studied=$totalMinutesStudied, completed_sessions=$completedSessions,
                pet_type=" . ($petType ? "'$petType'" : "NULL") . ", pet_hunger=$petHunger, pet_food=$petFood, updated_at=NOW()";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'message' => 'Player data saved']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
        }
    } elseif ($method === 'GET') {
        // Get player data
        $userId = $_GET['userId'] ?? null;
        $username = $_GET['username'] ?? null;
        
        if (!$userId && !$username) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId or username']);
            return;
        }
        
        $userIdEsc = $userId ? $conn->real_escape_string($userId) : null;
        $usernameEsc = $username ? $conn->real_escape_string($username) : null;

        $row = null;

        if ($userIdEsc) {
            $sql = "SELECT * FROM players WHERE user_id = '$userIdEsc'";
            $result = $conn->query($sql);
            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
            }
        }

        // Fallback: look up by username (last updated) if userId not found
        if (!$row && $usernameEsc) {
            $sql = "SELECT * FROM players WHERE name = '$usernameEsc' ORDER BY updated_at DESC LIMIT 1";
            $result = $conn->query($sql);
            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                // Optionally migrate to provided userId for consistency
                if ($userIdEsc && $row['user_id'] !== $userIdEsc) {
                    $migrateSql = "UPDATE players SET user_id = '$userIdEsc' WHERE id = {$row['id']}";
                    $conn->query($migrateSql);
                    $row['user_id'] = $userIdEsc;
                }
            }
        }

        if ($row) {
            $row['items'] = json_decode($row['items'], true);
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Player not found']);
        }
    }
}

// ==================== SESSION HANDLERS ====================
function handleSessionRequest($conn, $method) {
    if ($method === 'POST') {
        // Record study session
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['userId'] ?? null;
        $keypresses = intval($input['keypresses'] ?? 0);
        $duration = intval($input['duration'] ?? 0);
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId']);
            return;
        }
        
        $userId = $conn->real_escape_string($userId);
        $mushroomsEarned = $keypresses;
        
        $sql = "INSERT INTO study_sessions (user_id, keypresses, duration, mushrooms_earned, created_at)
                VALUES ('$userId', $keypresses, $duration, $mushroomsEarned, NOW())";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'mushrooms_earned' => $mushroomsEarned]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
        }
    } elseif ($method === 'GET') {
        // Get user's sessions
        $userId = $_GET['userId'] ?? null;
        $limit = intval($_GET['limit'] ?? 20);
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId']);
            return;
        }
        
        $userId = $conn->real_escape_string($userId);
        $sql = "SELECT * FROM study_sessions WHERE user_id = '$userId' ORDER BY created_at DESC LIMIT $limit";
        $result = $conn->query($sql);
        
        $sessions = [];
        while ($row = $result->fetch_assoc()) {
            $sessions[] = $row;
        }
        
        echo json_encode($sessions);
    }
}

// ==================== LEADERBOARD HANDLERS ====================
function handleLeaderboardRequest($conn, $method) {
    if ($method === 'GET') {
        $limit = intval($_GET['limit'] ?? 10);
        $sortBy = $_GET['sortBy'] ?? 'currency'; // currency, sessions, minutes
        
        $orderBy = 'currency DESC';
        if ($sortBy === 'sessions') {
            $orderBy = 'completed_sessions DESC';
        } elseif ($sortBy === 'minutes') {
            $orderBy = 'total_minutes_studied DESC';
        }
        
        $sql = "SELECT user_id, name, currency, completed_sessions, total_minutes_studied, character_id FROM players ORDER BY $orderBy LIMIT $limit";
        $result = $conn->query($sql);
        
        $leaderboard = [];
        $rank = 1;
        while ($row = $result->fetch_assoc()) {
            $row['rank'] = $rank++;
            $leaderboard[] = $row;
        }
        
        echo json_encode($leaderboard);
    }
}

// ==================== STATS HANDLERS ====================
function handleStatsRequest($conn, $method) {
    if ($method === 'GET') {
        // Get global stats
        $sql = "SELECT 
                COUNT(DISTINCT user_id) as total_players,
                SUM(currency) as total_mushrooms,
                SUM(completed_sessions) as total_sessions,
                SUM(total_minutes_studied) as total_minutes,
                AVG(currency) as avg_mushrooms
                FROM players";
        
        $result = $conn->query($sql);
        $stats = $result->fetch_assoc();
        
        echo json_encode($stats);
    }
}

// ==================== PRESENCE HANDLERS ====================
function handlePresenceRequest($conn, $method) {
    if ($method === 'POST') {
        // Update or create player presence
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['userId'] ?? null;
        $username = $input['username'] ?? 'Player';
        $characterId = $input['characterId'] ?? 'girl1';
        $petType = $input['petType'] ?? null;
        $location = $input['location'] ?? 'world';
        $x = intval($input['x'] ?? 0);
        $y = intval($input['y'] ?? 0);
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId']);
            return;
        }
        
        $userId = $conn->real_escape_string($userId);
        $username = $conn->real_escape_string($username);
        $characterId = $conn->real_escape_string($characterId);
        $location = $conn->real_escape_string($location);
        
        $sql = "INSERT INTO player_presence (user_id, username, character_id, pet_type, location, x, y, last_heartbeat)
                VALUES ('$userId', '$username', '$characterId', " . ($petType ? "'$petType'" : "NULL") . ", '$location', $x, $y, NOW())
                ON DUPLICATE KEY UPDATE
                username='$username', character_id='$characterId', pet_type=" . ($petType ? "'$petType'" : "NULL") . ", 
                location='$location', x=$x, y=$y, last_heartbeat=NOW()";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
        }
    }
}

// ==================== ONLINE PLAYERS HANDLERS ====================
function handleOnlinePlayersRequest($conn, $method) {
    if ($method === 'GET') {
        // Get all online players (heartbeat within last 30 seconds)
        $location = $_GET['location'] ?? null;
        $userId = $_GET['userId'] ?? null; // Exclude self
        
        $whereClause = "WHERE last_heartbeat > DATE_SUB(NOW(), INTERVAL 30 SECOND)";
        if ($location) {
            $location = $conn->real_escape_string($location);
            $whereClause .= " AND location = '$location'";
        }
        if ($userId) {
            $userId = $conn->real_escape_string($userId);
            $whereClause .= " AND user_id != '$userId'";
        }
        
        $sql = "SELECT user_id, username, character_id, pet_type, location, x, y FROM player_presence $whereClause";
        $result = $conn->query($sql);
        
        $players = [];
        while ($row = $result->fetch_assoc()) {
            $players[] = $row;
        }
        
        echo json_encode($players);
    }
}

// ==================== CHAT HANDLERS ====================
function handleChatRequest($conn, $method) {
    if ($method === 'POST') {
        // Send chat message
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['userId'] ?? null;
        $username = $input['username'] ?? 'Anonymous';
        $message = $input['message'] ?? '';
        $location = $input['location'] ?? 'cafe';
        
        if (!$userId || !$message) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing userId or message']);
            return;
        }
        
        $userId = $conn->real_escape_string($userId);
        $username = $conn->real_escape_string($username);
        $message = $conn->real_escape_string($message);
        $location = $conn->real_escape_string($location);
        
        $sql = "INSERT INTO chat_messages (user_id, username, message, location, created_at)
                VALUES ('$userId', '$username', '$message', '$location', NOW())";
        
        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'message_id' => $conn->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
        }
    } elseif ($method === 'GET') {
        // Get chat messages
        $location = $_GET['location'] ?? 'cafe';
        $limit = intval($_GET['limit'] ?? 50);
        $sinceId = intval($_GET['sinceId'] ?? 0);
        
        $location = $conn->real_escape_string($location);
        $whereClause = "WHERE location = '$location'";
        if ($sinceId > 0) {
            $whereClause .= " AND id > $sinceId";
        }
        
        $sql = "SELECT id, user_id, username, message, created_at FROM chat_messages $whereClause 
                ORDER BY created_at DESC LIMIT $limit";
        $result = $conn->query($sql);
        
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        
        // Return in chronological order (oldest first)
        echo json_encode(array_reverse($messages));
    }
}
?>
