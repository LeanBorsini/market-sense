# 🐧 MarketSense Autonomous Runner — Guía para Linux Fedora Minimal

Esta solución está diseñada específicamente para correr en **ordenadores antiguos o de bajos recursos** con **Fedora Minimal** (sin entorno gráfico pesado, sin escritorio GNOME/KDE) consumiendo **menos de 20 MB de memoria RAM** y **cero ciclos innecesarios de CPU**.

---

## ⚡ El Factor Luz en Irlanda (0,39 €/kWh)

Con la tarifa eléctrica de Irlanda (~0,39 €/kWh), un PC antiguo de torre (80W) encendido 24/7 cuesta:
$$\text{80W} \times 24\text{h} \times 30\text{d} = 57{,}6\text{ kWh} \times 0{,}39\text{ €} \approx \mathbf{22{,}46\text{ € al mes de luz}}$$

### ¿Cómo lo soluciona el Bot?
El bot incluye el modo **"Ahorro Eléctrico Inteligente"** (`electricity_saver` en `config.json`):
1. Solo opera durante las ventanas de máxima volatilidad y volumen (ej. **Apertura Americana 13:00 - 17:30 UTC** de lunes a viernes).
2. Si apagas el PC fuera de ese horario (o programas el apagado automático con `rtcwake`), el PC solo consume ~4 horas al día:
   $$\text{80W} \times 4\text{h} \times 22\text{días} = 7{,}04\text{ kWh} \times 0{,}39\text{ €} \approx \mathbf{2{,}74\text{ € al mes}}$$
   **¡Ahorras casi 20 € todos los meses solo con esta configuración!**

---

## 🚀 Instalación en 3 Minutos en Fedora Minimal

### Paso 1: Enciende la PC con Fedora Minimal y haz login
Entra con tu usuario en la consola de comandos de Fedora.

### Paso 2: Descarga o clona la carpeta
Si tienes `git`:
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd <REPOSITORIO>/fedora-runner
```
O simplemente crea la carpeta y copia los archivos:
```bash
mkdir -p ~/fedora-runner
cd ~/fedora-runner
```

### Paso 3: Ejecuta el instalador automático
```bash
sudo bash install-fedora.sh
```
El instalador:
1. Instala Python 3 (`dnf install -y python3`).
2. Copia el bot a `/opt/marketsense-bot`.
3. Crea y activa el servicio `systemd` para que arranque solo al encender el PC.
4. Abre el puerto 8080 en el cortafuegos de Fedora (`firewalld`).
5. Te muestra en pantalla la IP local de tu PC (ejemplo: `http://192.168.1.45:8080`).

---

## 📱 ¿Cómo controlarlo desde el Móvil o desde MarketSense?

1. Abre el navegador de tu móvil o la PWA de **MarketSense** conectado al mismo Wi-Fi de tu casa.
2. Ingresa a la IP que te dio el instalador (ejemplo: `http://192.168.1.45:8080`).
3. Verás el **Panel de Control en Vivo**:
   - Estado del Bot (Activo / En espera de horario / Pausado).
   - Memoria RAM real consumida (< 20 MB).
   - Balance actual y P&L del día.
   - Botón para pausar o reactivar operaciones con un toque.
   - Historial de trades ejecutados con Stop Loss y Take Profit.

---

## 🛠️ Comandos útiles en Fedora Minimal

* **Ver qué está haciendo el bot en tiempo real (Logs):**
  ```bash
  journalctl -u marketsense-bot -f
  ```
* **Pausar el servicio:**
  ```bash
  sudo systemctl stop marketsense-bot
  ```
* **Reanudar el servicio:**
  ```bash
  sudo systemctl start marketsense-bot
  ```
* **Ver consumo de memoria y CPU del bot:**
  ```bash
  systemctl status marketsense-bot
  ```

---

## 💡 Consejos Pro para Reducir el Consumo Eléctrico al Mínimo en Fedora

1. **Desconecta la pantalla / cable HDMI:** La tarjeta gráfica de la placa base gasta hasta 5W menos cuando no detecta monitor conectado.
2. **Activa el perfil de ahorro de CPU:**
   ```bash
   sudo dnf install -y kernel-tools
   sudo cpupower frequency-set -g powersave
   ```
3. **Instala PowerTOP para calibrar el hardware antiguo:**
   ```bash
   sudo dnf install -y powertop
   sudo powertop --auto-tune
   ```
   *(Esto apaga los buses PCIe y puertos USB en desuso para ahorrar entre un 15% y 25% de energía)*.
