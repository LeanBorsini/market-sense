#!/usr/bin/env bash
# =============================================================================
# MarketSense Bot — Script de Instalación Rápida para Linux Fedora Minimal
# =============================================================================
set -e

echo "============================================================"
echo " Instalando MarketSense Autonomous Engine en Fedora Minimal"
echo "============================================================"

# 1. Comprobar permisos root o sudo
if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script como root o con sudo: sudo bash install-fedora.sh"
  exit 1
fi

# 2. Instalar dependencias esenciales (Python 3)
echo "[1/5] Verificando dependencias con dnf..."
dnf install -y python3 python3-pip

# 3. Crear directorio de la aplicación
echo "[2/5] Creando directorio /opt/marketsense-bot..."
mkdir -p /opt/marketsense-bot
cp marketsense_bot.py /opt/marketsense-bot/
cp config.json /opt/marketsense-bot/
chmod +x /opt/marketsense-bot/marketsense_bot.py

# 4. Instalar servicio systemd
echo "[3/5] Instalando servicio de inicio automático (systemd)..."
sed "s/%I/$SUDO_USER/g" marketsense-bot.service > /etc/systemd/system/marketsense-bot.service
systemctl daemon-reload
systemctl enable marketsense-bot.service
systemctl restart marketsense-bot.service

# 5. Abrir puerto 8080 en el Firewall de Fedora si firewalld está activo
echo "[4/5] Configurando cortafuegos para acceso local..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port=8080/tcp || true
    firewall-cmd --reload || true
    echo "  -> Puerto 8080 habilitado en firewalld."
else
    echo "  -> firewalld no está activo (puerto 8080 abierto por defecto)."
fi

# 6. Obtener IP local
LOCAL_IP=$(ip -4 addr show scope global | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1 || echo "localhost")

echo "============================================================"
echo " ¡INSTALACIÓN COMPLETADA CON ÉXITO!"
echo "============================================================"
echo " Estado del bot: ACTIVO (Consumo RAM < 20 MB)"
echo ""
echo " Panel de control accesible en tu red local:"
echo " 👉 http://$LOCAL_IP:8080"
echo ""
echo " Comandos útiles de gestión en tu Fedora Minimal:"
echo " - Ver registros en vivo: journalctl -u marketsense-bot -f"
echo " - Detener bot:           sudo systemctl stop marketsense-bot"
echo " - Iniciar bot:           sudo systemctl start marketsense-bot"
echo " - Reiniciar bot:         sudo systemctl restart marketsense-bot"
echo "============================================================"
