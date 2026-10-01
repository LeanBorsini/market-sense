# 📊 MarketSense AI - Terminal Financiero & Radar Anti-Pánico

> **Diseñado para inversores con horario de Dublín y operativa en Interactive Brokers.**  
> Acceso a mercados de EE.UU. (VOO, S&P 500), Bolsa de Madrid (OHLA, Santander, Iberdrola), Mercados Asiáticos & Emergentes (TSMC, Alibaba, India) y Criptomonedas (Bitcoin, Solana).

---

## 🚀 Acceso Inmediato a la Aplicación (Cero Instalación previa)

Ya puedes usar la aplicación directamente desde cualquier navegador en tu móvil, tableta o PC mediante tu enlace en la nube de Google Cloud:

🔗 **URL de Desarrollo:** `https://ais-dev-ha7czbqgcwdqrtd6wm77nr-928008285049.europe-west2.run.app`  
🔗 **URL Compartible:** `https://ais-pre-ha7czbqgcwdqrtd6wm77nr-928008285049.europe-west2.run.app`

---

## 📱 Cómo Instalarla en tu Móvil como App Nativa (10 Segundos)

Gracias a la tecnología **Progressive Web App (PWA)**, la aplicación se puede instalar sin pasar por la App Store o Google Play:

### En iPhone / iPad (iOS):
1. Abre el enlace en **Safari**.
2. Pulsa el botón **Compartir** (el icono de un cuadrado con una flecha hacia arriba).
3. Selecciona **"Añadir a la pantalla de inicio"** (o pulsa el botón *"Instalar App"* dentro de la web).
4. Tendrás el icono en tu pantalla como una app nativa con apertura en 0.05 segundos y funcionamiento offline.

### En Android:
1. Abre el enlace en **Chrome**.
2. Pulsa en el aviso superior **"Instalar App"** o en los 3 puntos verticales > **"Instalar aplicación"**.

---

## 💬 Configuración de Telegram (100% Gratis)

La aplicación tiene dos formas de enviar las alertas y los informes:

### Opción A: Envío Inmediato con 1 Clic (Sin configurar nada)
1. En la pestaña **Informe Diario** o en **Oportunidades**, pulsa el botón **"Enviar a Telegram"**.
2. Selecciona **"Abrir en Telegram y Enviar Ahora"**.
3. Se abrirá la aplicación de Telegram en tu teléfono o PC con el texto perfectamente redactado. Eliges a qué amigo, chat privado o canal enviarlo y pulsas enviar.

### Opción B: Automatización Silenciosa con Bot Oficial (60 Segundos)
Si quieres que el sistema envíe los mensajes automáticamente en segundo plano a tu canal de colegas:
1. Abre Telegram y busca el usuario oficial **`@BotFather`**.
2. Envíale el comando `/newbot` y sigue las instrucciones para darle un nombre a tu bot (ej. `MiMarketSenseBot`).
3. `@BotFather` te dará un **Token** (algo como `7123456789:AAHk...`).
4. Crea un canal o grupo de Telegram con tus colegas (ej. `@MisColegasInversores`) y agrega a tu bot como **Administrador** para que pueda publicar mensajes.
5. Pega el Token y el `@NombreDeTuCanal` en la pestaña **Perfiles & Canales** o en el modal de Telegram de la app. ¡Listo!

---

## ⏰ Automatización 24/7 con GitHub Actions ($0 USD)

Si deseas clonar o alojar este proyecto en tu cuenta de GitHub, ya dejamos preparado el flujo automático en:
`/.github/workflows/daily_briefing.yml` y `/scripts/telegram_cron_briefing.js`

### Pasos para activarlo en GitHub:
1. Sube este repositorio a tu GitHub personal.
2. En tu repositorio de GitHub, ve a **Settings > Secrets and variables > Actions**.
3. Agrega dos secretos gratuitos:
   * `TELEGRAM_BOT_TOKEN`: El token que te dio `@BotFather`.
   * `TELEGRAM_CHAT_ID`: El ID de tu chat o el alias de tu canal (ej. `@MisColegasInversores`).
4. **¡Listo!** GitHub Actions ejecutará el script de forma gratuita e ininterrumpida a las **08:00 AM** y a las **21:00 PM** (Hora Dublín), enviando el briefing diario a tus colegas sin que tengas que encender tu computadora.

---

## 🛠️ Tecnologías Empleadas

* **Frontend:** React 19 + TypeScript + Vite.
* **Estilos:** Tailwind CSS v4 con sombreado de relieve táctil (*Rim lights*, biseles y displays hundidos).
* **Gráficos Bursátiles:** Widget oficial en tiempo real de **TradingView** (Costo $0).
* **Almacenamiento:** Caché local persistente cifrada en el navegador (`localStorage`) + modo Offline mediante Service Workers PWA.
* **Backend & Servidor:** Google Cloud Run Serverless (99.99% disponibilidad 24/7).
