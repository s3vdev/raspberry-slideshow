<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Sicherheitsmaßnahmen
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prüfe ob es ein POST Request ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Nur POST Requests erlaubt']);
    exit;
}

try {
    // Korrekter Pfad zum uploads-Ordner (relativ zum api-Ordner)
    $uploadsDir = dirname(__DIR__) . '/uploads/';
    
    // Erstelle uploads Ordner falls nicht vorhanden
    if (!is_dir($uploadsDir)) {
        if (!mkdir($uploadsDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['error' => 'Konnte uploads-Ordner nicht erstellen']);
            exit;
        }
    }
    
    // Prüfe Schreibberechtigung
    if (!is_writable($uploadsDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Keine Schreibberechtigung für uploads-Ordner']);
        exit;
    }
    
    // Prüfe ob eine Datei hochgeladen wurde
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $uploadError = isset($_FILES['image']) ? $_FILES['image']['error'] : 'Keine Datei';
        http_response_code(400);
        echo json_encode(['error' => 'Fehler beim Datei-Upload: ' . $uploadError]);
        exit;
    }
    
    $uploadedFile = $_FILES['image'];
    
    // Prüfe Dateigröße (max 10MB)
    $maxFileSize = 10 * 1024 * 1024; // 10MB
    if ($uploadedFile['size'] > $maxFileSize) {
        http_response_code(400);
        echo json_encode(['error' => 'Datei zu groß (max. 10MB)']);
        exit;
    }
    
    // Prüfe Dateityp
    $allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/svg+xml',  // SVG
        'text/plain',     // Fallback für SVG
        'application/octet-stream', // Fallback für verschiedene Formate
        'text/xml',       // Weitere SVG-Variante
        'application/xml' // Weitere SVG-Variante
    ];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);
    
    // Prüfe Dateiendung
    $extension = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    // Spezielle Behandlung für SVG-Dateien
    if ($extension === 'svg') {
        // Für SVG-Dateien sind wir weniger streng mit MIME-Types
        $fileContent = file_get_contents($uploadedFile['tmp_name']);
        if (strpos($fileContent, '<svg') === false && strpos($fileContent, '<?xml') === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Ungültige SVG-Datei - kein SVG-Content gefunden']);
            exit;
        }
        // SVG-Datei ist gültig, weiter mit dem Upload
    } else {
        // Für andere Dateitypen: Prüfe zuerst die Extension, dann den MIME-Type
        if (!in_array($extension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nur Bilddateien sind erlaubt (Extension: ' . $extension . ')']);
            exit;
        }
        
        // Wenn MIME-Type nicht in der erlaubten Liste ist, aber die Extension stimmt,
        // versuchen wir es trotzdem (manche Systeme erkennen MIME-Types anders)
        if (!in_array($mimeType, $allowedMimeTypes)) {
            // Zusätzliche Prüfung für JPG/JPEG-Dateien
            if (in_array($extension, ['jpg', 'jpeg']) && strpos($mimeType, 'image') !== false) {
                // JPG-Datei mit ähnlichem MIME-Type - erlauben
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Nur Bilddateien sind erlaubt (MIME-Type: ' . $mimeType . ', Extension: ' . $extension . ')']);
                exit;
            }
        }
    }
    
    // Sanitize Dateiname
    $originalName = $uploadedFile['name'];
    $sanitizedName = preg_replace('/[^a-zA-Z0-9.-]/', '_', $originalName);
    $timestamp = time();
    $newFileName = $timestamp . '_' . $sanitizedName;
    $targetPath = $uploadsDir . $newFileName;
    
    // Prüfe ob Datei bereits existiert (sehr unwahrscheinlich mit Timestamp)
    if (file_exists($targetPath)) {
        $newFileName = $timestamp . '_' . uniqid() . '_' . $sanitizedName;
        $targetPath = $uploadsDir . $newFileName;
    }
    
    // Verschiebe hochgeladene Datei
    if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        // Setze korrekte Berechtigungen
        chmod($targetPath, 0644);
        
        echo json_encode([
            'success' => true,
            'filename' => $newFileName,
            'message' => 'Bild erfolgreich hochgeladen'
        ]);
    } else {
        // Detailliertere Fehlerbehandlung
        $error = error_get_last();
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Speichern der Datei: ' . ($error['message'] ?? 'Unbekannter Fehler')]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server-Fehler beim Upload: ' . $e->getMessage()]);
}
?> 