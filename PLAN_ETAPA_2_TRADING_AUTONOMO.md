# 🤖 Plan de Implementación — Etapa 2: Trading Autónomo 24/7 (Sin Futuros)

> **Documento de Referencia Técnica y Operativa**  
> **Objetivo:** Conectar las estrategias diseñadas y calibradas en **MarketSense** para que operen de forma 100% autónoma en cuentas de fondeo o brokers reales de CFDs/Forex/Acciones (MetaTrader 4 / MetaTrader 5 / cTrader), sin intervención humana, con control de riesgo milimétrico y registro de auditoría para comparar resultados (IA vs. Humano).

---

## 1. Principios y Restricciones del Usuario

1. **Cero Futuros (No MES, No NQ):**
   * Toda la operativa está basada en **CFDs / Spot / Índices en Efectivo** (ej. US500 / SPX500, NAS100, Oro XAUUSD, Acciones). Este es el formato universal de todas las cuentas de fondeo modernas (FTMO, Funding Pips, FundedNext, Alpha Capital, etc.) y brokers tradicionales.
2. **100% Desatendido (Autónomo Real):**
   * El usuario **no** recibe una alerta para meter la orden a mano. La máquina detecta el setup, calcula el lotaje según el riesgo permitido, coloca la orden con Stop Loss y Take Profit fijos al instante y reporta el resultado.
3. **Costo Cero o Mínimo (Opciones Gratuitas vs. VPS Económico):**
   * Se priorizan métodos fiables gratuitos (Oracle Cloud Always Free Tier, Mini-PC/equipo local, Cloudflare Workers / Render) antes de incurrir en costos fijos. Si se requiere VPS dedicado, se documenta la opción mínima de 3-4 €/mes.
4. **Protección Anti-Quiebra de Fondeo (Safety First):**
   * Circuit breaker diario estricto (bloqueo al alcanzar -1.5% o -2% en el día para no rozar nunca el límite del 4-5% de la firma).
   * Lote calculado por matemática de pips, jamás un número estático a ojo.

---

## 2. Infraestructura 24/7: Dónde corre el bot sin pagar (o gastando lo mínimo)

Para que la máquina opere de madrugada o cuando estés desconectado, el software debe estar encendido continuamente. Hay tres alternativas:

### Opción A: 100% GRATIS de por vida — Oracle Cloud "Always Free" (Recomendada)
* **Qué es:** Oracle Cloud Infrastructure (OCI) ofrece instancias virtuales (Compute VM) gratuitas permanentes sin fecha de expiración (24GB RAM en arquitectura Ampere o 1GB en AMD x86).
* **Cómo se usa:** Se levanta una máquina Linux (Ubuntu) gratuita, se instala un entorno headless de Wine/Python o Docker con el daemon del bot conectado a la cuenta de fondeo.
* **Costo:** **0,00 €/mes**.

### Opción B: En casa con PC vieja (Fedora Minimal) — El costo de la luz en Irlanda (0,39 €/kWh)
* **Qué es:** Dejar tu PC modesta con **Fedora Minimal** (sin entorno gráfico pesado, < 20 MB RAM de uso).
* **El cálculo real de la luz en Irlanda:** A una tarifa de **0,39 €/kWh**, una torre de 75-80W encendida 24/7 consume:
  $$\text{80W} \times 24\text{h} \times 30\text{días} \approx 57{,}6\text{ kWh} \times 0{,}39\text{ €} \approx \mathbf{22{,}46\text{ € al mes en tu factura de luz}}$$
* **Solución de Ahorro Inteligente implementada en el Bot (`/fedora-runner`):**
  En lugar de dejarla 24/7 sin parar, el bot cuenta con un programador horario para operar **únicamente durante la sesión de mayor volumen (ej. Wall Street 13:00 a 17:30 UTC)**.
  Operando solo ~4,5 horas al día en días hábiles (22 días/mes), el consumo desciende a solo **7,9 kWh/mes = 3,08 € al mes**. ¡Ahorras casi 20 € mensuales de electricidad!
* **Paquete listo para ejecutar:** La carpeta `/fedora-runner/` del proyecto ya contiene todo el código listo para arrancar en Fedora (`marketsense_bot.py`, `install-fedora.sh`, `marketsense-bot.service`, `config.json` y `README_FEDORA.md`).

### Opción C: La opción de bajo coste profesional (3 € a 4 € / mes)
* **Qué es:** Un VPS económico en **Hetzner Cloud** (CX22 por ~3.80 €/mes) o **Contabo / RackNerd**.
* **Ventaja:** Conexión de fibra óptica con 99.9% de uptime garantizado, latencia de 1ms hacia los servidores de brokers en Londres o Nueva York. Solo se activa si la opción A o B no se desean configurar.

---

## 3. Las Dos Vías de Ejecución Autónoma (Sin tocar botones)

### Vía 1: TradingView Webhooks + Puente Directo a MT4 / MT5 (La más simple)
No necesitas programar la conexión del broker desde cero.

```
┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐
│ MarketSense Lab         │         │ Webhook Gateway         │         │ Cuenta de Fondeo        │
│ Genera Pine Script      │ ──────> │ (TradersPost / MT5 EA / │ ──────> │ MetaTrader 4 / 5        │
│ con reglas de entrada   │         │ Servidor Node/Python)   │         │ Abre Orden con SL y TP  │
└─────────────────────────┘         └─────────────────────────┘         └─────────────────────────┘
```

1. Cargas el script generado en el Laboratorio en TradingView.
2. Creas una alerta automatizada:
   * **Webhook URL:** La dirección de tu servidor o relay.
   * **Payload JSON:**
     ```json
     {
       "secret": "CLAVE_PRIVADA_SEGURA",
       "action": "BUY",
       "symbol": "US500",
       "risk_usd": 15.00,
       "stop_loss_price": 5780.20,
       "take_profit_price": 5890.00
     }
     ```
3. El webhook recibe la señal y un Asesor Experto (EA) ligero dentro de MetaTrader abre la orden en menos de 200 milisegundos con el SL y TP puestos en el servidor del broker.

---

### Vía 2: Bot Nativo en Python (El motor autónomo completo)
Este es el código que el Laboratorio ya estructura en la pestaña Python:

1. El bot corre en segundo plano como servicio del sistema (`systemd` o `cron`).
2. Se conecta a la terminal de MetaTrader 5 mediante la librería oficial:
   ```python
   import MetaTrader5 as mt5
   # mt5.initialize() con login, password y servidor de la cuenta de fondeo
   ```
3. Cada cierre de vela (o cada intervalo configurado):
   * Descarga las últimas cotizaciones.
   * Evalúa las condiciones (Suelo institucional, rebote de 3 días rojos, distancia al soporte).
   * Si se cumple la condición:
     1. Calcula la distancia al Stop Loss.
     2. Resuelve el lotaje exacto: `lotes = riesgo_monetario / (distancia_pips * valor_pip)`.
     3. Envía `mt5.order_send(...)`.
     4. Registra el trade en la base de datos (Firestore o SQLite) para la comparativa.

---

## 4. Módulo de Comparativa: "IA Autómata vs. Humano (Tú)"

Para cumplir con el objetivo de **comparar resultados**, la base de datos y la PWA registrarán dos perfiles de trading:

| Métrica | Cartera IA (Autónoma) | Cartera Humana (Tú) | Objetivo de la Comparativa |
| :--- | :--- | :--- | :--- |
| **P&L Total (€ / $)** | Calculado por trades cerrados | Calculado por trades cerrados | ¿Quién saca más rentabilidad neta? |
| **Win Rate (%)** | Tasa matemática estricta | Tasa con criterio discrecional | Ver si tu intuición supera al algoritmo. |
| **Profit Factor** | Ganancias brutas / Pérdidas | Ganancias brutas / Pérdidas | Medir la calidad del ratio riesgo-beneficio. |
| **Max Drawdown Diario** | Tope garantizado por código (≤ 1.5%) | Medición de caídas humanas | Verificar si el factor emocional te expone a más caída. |
| **Fidelidad al Plan (Drift)** | 100% de cumplimiento | % de veces que cerraste antes o moviste SL | Detectar cuánto dinero cuesta la impaciencia. |

---

## 5. Hoja de Ruta para Cuando Iniciemos la Etapa 2 (Paso a Paso)

Cuando decidamos comenzar la construcción técnica de esta etapa, seguiremos este orden:

- [ ] **Paso 1: Entorno de Broker en Demo**
  * Abrir cuenta demo gratuita en MetaTrader 5 con el activo deseado (ej. CFD de US500 o XAUUSD).
- [ ] **Paso 2: Servidor de Ejecución Gratuito**
  * Configurar la máquina virtual Always-Free de Oracle Cloud (o servicio local en casa).
- [ ] **Paso 3: Bridge de Ejecución MT5**
  * Implementar el script receptor que convierte las señales de MarketSense en órdenes reales de MetaTrader 5.
- [ ] **Paso 4: Conexión con MarketSense PWA**
  * Añadir en la interfaz de usuario una pantalla simple donde configuras:
    * Activo (Ticket).
    * Estrategia activa del Laboratorio.
    * Riesgo máximo por trade (€ o %).
    * Interruptor maestro: **ENCENDER BOT / APAGAR BOT (Kill Switch)**.
- [ ] **Paso 5: Auditoría de 30 Días en Demo**
  * Dejar operar al bot sin tocarlo durante un mes completo mientras tú operas en paralelo tu cuenta habitual para comparar métricas en la tabla de rendimiento.

---
*Documento guardado para reanudar el proyecto en cualquier momento sin perder la visión ni los requerimientos planteados.*
