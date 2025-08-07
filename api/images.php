<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Sicherheitsmaßnahmen
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    
    // Lese alle Dateien im uploads Ordner
    $files = scandir($uploadsDir);
    $imageFiles = [];
    
    // Erlaubte Bildformate (SVG hinzugefügt)
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $filePath = $uploadsDir . $file;
        
        // Prüfe ob es eine Datei ist
        if (!is_file($filePath)) {
            continue;
        }
        
        // Prüfe Dateiendung
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($extension, $allowedExtensions)) {
            $imageFiles[] = $file;
        }
    }
    
    // Sortiere Dateien nach Erstellungsdatum (neueste zuerst)
    usort($imageFiles, function($a, $b) use ($uploadsDir) {
        $timeA = filemtime($uploadsDir . $a);
        $timeB = filemtime($uploadsDir . $b);
        return $timeB - $timeA;
    });
    
    echo json_encode($imageFiles);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Fehler beim Lesen der Bilder: ' . $e->getMessage()]);
}
?> 