#!/bin/bash

echo "🚀 Raspberry Pi Slideshow - Vollständige Installation"
echo "=================================================="

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion zum Anzeigen von Status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. System-Update
echo "📦 System-Update..."
sudo apt update && sudo apt upgrade -y
print_status "System-Update abgeschlossen"

# 2. Apache2 installieren/aktualisieren
echo "🌐 Apache2 installieren..."
sudo apt install apache2 -y
print_status "Apache2 installiert"

# 3. PHP installieren mit allen benötigten Modulen
echo "🐘 PHP mit allen Modulen installieren..."
sudo apt install php php-gd php-mbstring php-xml php-curl php-zip php-fileinfo php-json -y
print_status "PHP mit Modulen installiert"

# 4. Apache2-Module aktivieren
echo "🔧 Apache2-Module aktivieren..."
sudo a2enmod php
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod expires
print_status "Apache2-Module aktiviert"

# 5. PHP-Konfiguration optimieren
echo "⚙️ PHP-Konfiguration optimieren..."
sudo tee /etc/php/*/apache2/conf.d/99-slider.ini > /dev/null <<EOF
; Slider-Projekt PHP-Konfiguration
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
max_input_time = 300
memory_limit = 256M
file_uploads = On
max_file_uploads = 20
allow_url_fopen = On
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
EOF
print_status "PHP-Konfiguration optimiert"

# 6. Apache2-Konfiguration erstellen
echo "📝 Apache2-Konfiguration erstellen..."
sudo tee /etc/apache2/sites-available/slider.conf > /dev/null <<EOF
<VirtualHost *:80>
    ServerName 172.23.4.114
    DocumentRoot /var/www/html/slider
    
    <Directory /var/www/html/slider>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # PHP-Einstellungen für Uploads
        php_value upload_max_filesize 10M
        php_value post_max_size 10M
        php_value max_execution_time 300
        php_value max_input_time 300
        php_value memory_limit 256M
    </Directory>
    
    # Logs
    ErrorLog \${APACHE_LOG_DIR}/slider_error.log
    CustomLog \${APACHE_LOG_DIR}/slider_access.log combined
    
    # Log-Level für Debugging
    LogLevel warn
</VirtualHost>
EOF
print_status "Apache2-Konfiguration erstellt"

# 7. Projektdateien kopieren
echo "📁 Projektdateien kopieren..."
sudo mkdir -p /var/www/html/slider
sudo cp -r * /var/www/html/slider/
print_status "Projektdateien kopiert"

# 8. Berechtigungen setzen
echo "🔐 Berechtigungen setzen..."
sudo chown -R www-data:www-data /var/www/html/slider/
sudo chmod -R 755 /var/www/html/slider/
sudo chmod -R 777 /var/www/html/slider/uploads/
print_status "Berechtigungen gesetzt"

# 9. Apache2-Site aktivieren
echo "🌐 Apache2-Site aktivieren..."
sudo a2ensite slider.conf
sudo a2dissite 000-default.conf 2>/dev/null || true
print_status "Apache2-Site aktiviert"

# 10. Apache2-Konfiguration testen
echo "🔍 Apache2-Konfiguration testen..."
if sudo apache2ctl configtest; then
    print_status "Apache2-Konfiguration ist gültig"
else
    print_error "Apache2-Konfiguration hat Fehler!"
    exit 1
fi

# 11. Apache2 neu starten
echo "🔄 Apache2 neu starten..."
sudo systemctl restart apache2
print_status "Apache2 neu gestartet"

# 12. PHP-Module überprüfen
echo "🔍 PHP-Module überprüfen..."
REQUIRED_MODULES=("gd" "mbstring" "xml" "curl" "zip" "fileinfo" "json")
MISSING_MODULES=()

for module in "${REQUIRED_MODULES[@]}"; do
    if php -m | grep -q "^$module$"; then
        print_status "PHP-Modul '$module' ist aktiv"
    else
        MISSING_MODULES+=("$module")
        print_warning "PHP-Modul '$module' fehlt"
    fi
done

if [ ${#MISSING_MODULES[@]} -gt 0 ]; then
    echo "📦 Fehlende PHP-Module installieren..."
    sudo apt install php-${MISSING_MODULES[@]} -y
    sudo systemctl restart apache2
    print_status "Fehlende PHP-Module installiert"
fi

# 13. Firewall konfigurieren (falls aktiv)
if command -v ufw &> /dev/null; then
    echo "🔥 Firewall konfigurieren..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    print_status "Firewall konfiguriert"
fi

# 14. Systemd-Service für automatischen Start
echo "🚀 Systemd-Service konfigurieren..."
sudo systemctl enable apache2
print_status "Apache2 wird automatisch gestartet"

# 15. Finale Überprüfung
echo "✅ Finale Überprüfung..."
if curl -s http://localhost/slider/ > /dev/null; then
    print_status "Slideshow ist erreichbar"
else
    print_warning "Slideshow ist nicht erreichbar - prüfe Logs"
fi

# 16. Informationen anzeigen
echo ""
echo "🎉 Installation abgeschlossen!"
echo "================================"
echo ""
echo "📺 Slideshow: http://172.23.4.114/slider/"
echo "📤 Upload: http://172.23.4.114/slider/upload.html"
echo ""
echo "📁 Projektordner: /var/www/html/slider/"
echo "📁 Uploads: /var/www/html/slider/uploads/"
echo ""
echo "📋 Nützliche Befehle:"
echo "  - Apache2-Status: sudo systemctl status apache2"
echo "  - Apache2-Logs: sudo tail -f /var/log/apache2/slider_error.log"
echo "  - PHP-Logs: sudo tail -f /var/log/php_errors.log"
echo "  - Apache2 neu starten: sudo systemctl restart apache2"
echo ""
echo "🔧 Troubleshooting:"
echo "  - Prüfe Berechtigungen: ls -la /var/www/html/slider/"
echo "  - Prüfe PHP-Module: php -m"
echo "  - Prüfe Apache2-Konfiguration: sudo apache2ctl configtest"
echo "" 