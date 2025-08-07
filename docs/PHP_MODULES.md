# PHP-Module für Raspberry Pi Slideshow

## 📋 Benötigte PHP-Module

### 🔧 **Kern-Module (automatisch installiert)**
- **`php`** - PHP-Core
- **`php-cli`** - Command Line Interface
- **`php-common`** - Gemeinsame PHP-Dateien

### 🖼️ **Bildverarbeitung**
- **`php-gd`** - **WICHTIG** für Bildverarbeitung und MIME-Type-Validierung
  - Wird für `getimagesize()`, `imagecreatefrom*()` verwendet
  - Prüft ob Dateien wirklich Bilder sind
  - Unterstützt: JPEG, PNG, GIF, BMP, WebP

### 📝 **Zeichenketten-Verarbeitung**
- **`php-mbstring`** - Multi-Byte String-Funktionen
  - Für sichere Dateinamen-Verarbeitung
  - Unterstützt UTF-8 und andere Zeichenkodierungen

### 📄 **XML-Verarbeitung**
- **`php-xml`** - XML-Parser und DOM-Funktionen
  - Für JSON-API-Responses
  - Hilft bei der Datenverarbeitung

### 🌐 **Netzwerk-Funktionen**
- **`php-curl`** - cURL-Funktionen
  - Für externe API-Calls (falls benötigt)
  - HTTP-Request-Handling

### 📦 **Datei-Komprimierung**
- **`php-zip`** - ZIP-Funktionen
  - Für Upload-Handling
  - Datei-Komprimierung (Performance)

### 🔍 **Datei-Informationen**
- **`php-fileinfo`** - **WICHTIG** für MIME-Type-Erkennung
  - `finfo_open()` für sichere Dateityp-Validierung
  - Verhindert Upload von gefälschten Dateien

### 📊 **JSON-Verarbeitung**
- **`php-json`** - JSON-Funktionen
  - Für API-Responses
  - Daten-Serialisierung

## 🚀 **Installation aller Module**

```bash
# Alle benötigten Module auf einmal installieren
sudo apt install php php-gd php-mbstring php-xml php-curl php-zip php-fileinfo php-json -y
```

## 🔍 **Module überprüfen**

```bash
# Alle aktiven PHP-Module anzeigen
php -m

# Spezifische Module prüfen
php -m | grep -E "(gd|mbstring|xml|curl|zip|fileinfo|json)"
```

## ⚙️ **PHP-Konfiguration**

### **Upload-Einstellungen**
```ini
; In /etc/php/*/apache2/php.ini oder 99-slider.ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
file_uploads = On
max_file_uploads = 20
```

### **Sicherheitseinstellungen**
```ini
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
allow_url_fopen = On
```

## 🧪 **Test der Module**

### **GD-Modul testen**
```php
<?php
if (extension_loaded('gd')) {
    echo "✓ GD-Modul ist aktiv\n";
    echo "Unterstützte Formate: " . implode(', ', gd_info()['JPG Support'] ? ['JPEG'] : []) . "\n";
} else {
    echo "✗ GD-Modul fehlt!\n";
}
?>
```

### **Fileinfo-Modul testen**
```php
<?php
if (extension_loaded('fileinfo')) {
    echo "✓ Fileinfo-Modul ist aktiv\n";
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    echo "MIME-Type-Erkennung funktioniert\n";
    finfo_close($finfo);
} else {
    echo "✗ Fileinfo-Modul fehlt!\n";
}
?>
```

### **Upload-Funktionalität testen**
```php
<?php
echo "Upload-Einstellungen:\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "file_uploads: " . (ini_get('file_uploads') ? 'On' : 'Off') . "\n";
?>
```

## 🔧 **Troubleshooting**

### **Modul nicht gefunden**
```bash
# Modul installieren
sudo apt install php-[modulname] -y

# Apache2 neu starten
sudo systemctl restart apache2

# PHP-Module neu laden
sudo systemctl reload apache2
```

### **Upload funktioniert nicht**
```bash
# PHP-Upload-Einstellungen prüfen
php -i | grep -i upload

# Apache2-Logs prüfen
sudo tail -f /var/log/apache2/slider_error.log

# PHP-Logs prüfen
sudo tail -f /var/log/php_errors.log
```

### **Berechtigungsprobleme**
```bash
# Berechtigungen setzen
sudo chown -R www-data:www-data /var/www/html/slider/
sudo chmod -R 755 /var/www/html/slider/
sudo chmod -R 777 /var/www/html/slider/uploads/

# Apache2-User prüfen
ps aux | grep apache
```

## 📊 **Performance-Optimierung**

### **PHP-OpCache aktivieren**
```bash
sudo apt install php-opcache -y
```

### **PHP-Konfiguration für Performance**
```ini
; In 99-slider.ini
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 2
opcache.fast_shutdown = 1
```

## 🎯 **Zusammenfassung**

Für das Slider-Projekt sind **7 wichtige PHP-Module** erforderlich:

1. **`php-gd`** - Bildverarbeitung ✅
2. **`php-fileinfo`** - MIME-Type-Validierung ✅
3. **`php-mbstring`** - String-Verarbeitung ✅
4. **`php-json`** - JSON-API ✅
5. **`php-xml`** - XML/DOM-Verarbeitung ✅
6. **`php-curl`** - HTTP-Requests ✅
7. **`php-zip`** - Datei-Komprimierung ✅

Alle Module werden durch das `install.sh` Skript automatisch installiert und konfiguriert. 