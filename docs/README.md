# Raspberry Pi Slideshow

Eine vollständige Slideshow-Anwendung für den Raspberry Pi mit Upload-Funktionalität, optimiert für Apache2.

## Features

- **Fullscreen Slideshow** mit automatischem Wechsel
- **Drag & Drop Upload** für Bilder
- **Automatische Bildaktualisierung** - neue Bilder werden automatisch hinzugefügt
- **Responsive Design** für verschiedene Bildschirmgrößen
- **Touch/Swipe Support** für mobile Geräte
- **Keyboard Navigation** (Pfeiltasten, Leertaste, F für Vollbild)
- **Sichere Dateiverarbeitung** mit PHP-Validierung

## Installation

### 1. Apache2 & PHP einrichten

```bash
# Apache2 installieren (falls noch nicht geschehen)
sudo apt update
sudo apt install apache2 php php-gd

# Apache2 starten und aktivieren
sudo systemctl start apache2
sudo systemctl enable apache2

# PHP-Module aktivieren
sudo a2enmod php
sudo systemctl restart apache2
```

### 2. Projektdateien kopieren

```bash
# Kopiere alle Dateien in das Apache2 Verzeichnis
sudo cp -r * /var/www/html/slider/

# Setze korrekte Berechtigungen
sudo chown -R www-data:www-data /var/www/html/slider/
sudo chmod -R 755 /var/www/html/slider/
sudo chmod -R 777 /var/www/html/slider/uploads/
```

### 3. Apache2 Konfiguration

Erstelle eine neue Apache2-Site-Konfiguration:

```bash
sudo nano /etc/apache2/sites-available/slider.conf
```

Füge folgende Konfiguration hinzu:

```apache
<VirtualHost *:80>
    ServerName 172.23.4.114
    DocumentRoot /var/www/html/slider
    
    <Directory /var/www/html/slider>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Erhöhe Upload-Limits
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/slider_error.log
    CustomLog ${APACHE_LOG_DIR}/slider_access.log combined
</VirtualHost>
```

Aktiviere die neue Konfiguration:

```bash
sudo a2ensite slider.conf
sudo systemctl reload apache2
```

### 4. Zugriff

Öffnen Sie in Ihrem Browser:
- **Slideshow**: `http://172.23.4.114/slider/`
- **Upload**: `http://172.23.4.114/slider/upload.html`

## Sicherheitshinweise

⚠️ **Wichtige Sicherheitsmaßnahmen:**

1. **Dateivalidierung**: Nur Bilddateien werden akzeptiert (MIME-Type + Extension)
2. **Dateigrößenlimit**: Maximal 10MB pro Datei
3. **Dateinamen-Sanitization**: Gefährliche Zeichen werden entfernt
4. **Timestamp-basierte Namen**: Verhindert Namenskonflikte
5. **PHP-Sicherheit**: Fehler werden nicht angezeigt, Upload-Validierung
6. **Apache2-Sicherheit**: Versteckte Dateien, Indexes deaktiviert

## Verwendung

### Slideshow (index.html)
- **Automatischer Wechsel**: Alle 5 Sekunden
- **Navigation**: Pfeiltasten oder Buttons
- **Vollbild**: F-Taste oder Button
- **Play/Pause**: Leertaste oder Button
- **Touch/Swipe**: Auf mobilen Geräten

### Upload (upload.html)
- **Drag & Drop**: Bilder direkt in den Upload-Bereich ziehen
- **Dateiauswahl**: Klick auf "Dateien auswählen"
- **Fortschrittsanzeige**: Zeigt Upload-Status
- **Validierung**: Nur Bilddateien werden akzeptiert

## Ordnerstruktur

```
/var/www/html/slider/
├── index.html          # Hauptslideshow
├── upload.html         # Upload-Seite
├── uploads/            # Bildordner (777 Berechtigungen)
├── api/
│   ├── images.php      # API für Bildauflistung
│   └── upload.php      # API für Bildupload
├── assets/
│   ├── slideshow.css   # Slideshow-Styles
│   ├── slideshow.js    # Slideshow-Logik
│   ├── upload.css      # Upload-Styles
│   └── upload.js       # Upload-Logik
├── .htaccess           # Apache2 Sicherheitseinstellungen
└── README.md           # Diese Datei
```

## Troubleshooting

### Häufige Probleme:

1. **"Keine Bilder gefunden"**
   ```bash
   # Prüfe Berechtigungen
   sudo chmod -R 777 /var/www/html/slider/uploads/
   sudo chown -R www-data:www-data /var/www/html/slider/
   ```

2. **Upload funktioniert nicht**
   ```bash
   # Prüfe Apache2-Logs
   sudo tail -f /var/log/apache2/slider_error.log
   
   # Prüfe PHP-Upload-Einstellungen
   php -i | grep upload
   ```

3. **Bilder werden nicht angezeigt**
   ```bash
   # Prüfe Dateiberechtigungen
   ls -la /var/www/html/slider/uploads/
   
   # Prüfe Apache2-Konfiguration
   sudo apache2ctl configtest
   ```

4. **PHP-Fehler**
   ```bash
   # Aktiviere PHP-Fehleranzeige temporär
   sudo nano /var/www/html/slider/api/images.php
   # Ändere error_reporting(0) zu error_reporting(E_ALL)
   ```

### Logs überprüfen:
```bash
# Apache2-Logs
sudo tail -f /var/log/apache2/slider_error.log
sudo tail -f /var/log/apache2/slider_access.log

# PHP-Logs
sudo tail -f /var/log/php_errors.log
```

### Apache2-Module prüfen:
```bash
# Liste alle aktiven Module
sudo apache2ctl -M

# Wichtige Module sollten aktiv sein:
# - php_module
# - headers_module
# - rewrite_module
```

## Performance-Optimierung

### Apache2-Optimierung:
```bash
# Erhöhe Worker-Processes
sudo nano /etc/apache2/mods-available/mpm_prefork.conf
# Ändere: StartServers 5, MinSpareServers 5, MaxSpareServers 10

# Aktiviere Komprimierung
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl reload apache2
```

### PHP-Optimierung:
```bash
# Erhöhe Memory-Limit für große Uploads
sudo nano /etc/php/7.4/apache2/php.ini
# Ändere: memory_limit = 256M
sudo systemctl reload apache2
```

## Lizenz

Diese Anwendung ist für private und kommerzielle Nutzung freigegeben. 