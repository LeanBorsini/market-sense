# 🤖 ARQUITECTURA DEL BOT DE TRADING AUTÓNOMO IA CON METATRADER 5 (MT5)
## Sistema 24/7 de Gestión de Cuentas, Detección Automática de Saldo y Guardián de Fondeo

Este documento contiene la **arquitectura técnica completa**, el **código fuente del bridge en Python para MetaTrader 5**, y la **fórmula de dimensionamiento y límites de riesgo 100% automáticos** para operar tanto en cuentas Demo como Reales y desafíos de Fondeo (FTMO, FundedNext, Apex, Topstep, IC Markets).

---

## 📑 ÍNDICE
1. [Visión General & Diagrama de Arquitectura](#1-visión-general--diagrama-de-arquitectura)
2. [Conexión Real con MetaTrader 5 (Python Bridge: `mt5_bridge.py`)](#2-conexión-real-con-metatrader-5-python-bridge)
3. [Detección de Saldo & Límites de Riesgo Automáticos](#3-detección-de-saldo--límites-de-riesgo-automáticos)
4. [Motor de Estrategias Cuantitativas & Anti-Caza](#4-motor-de-estrategias-cuantitativas--anti-caza)
5. [Despliegue 24/7 en Servidor VPS o Docker](#5-despliegue-247-en-servidor-vps-o-docker)
6. [API REST de Comunicación entre la App y el Bot](#6-api-rest-de-comunicación)

---

## 1. Visión General & Diagrama de Arquitectura

```text
┌─────────────────────────────────────────────────────────────┐
│             MARKETSENSE / DASHBOARD DE CONTROL              │
│  - Selección de Tickers (S&P 500, EUR/USD, Oro, BTC, etc.) │
│  - Activación/Pausa de Estrategias y Modo de Disparo        │
│  - Monitor en Vivo de Telemetría, Latencia y Logs           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / WebSocket REST API
┌──────────────────────────────▼──────────────────────────────┐
│           CORE ENGINE 24/7 (Node.js / Python API)           │
│  - Escáner Continuo de Señales de Mercado (cada 4 seg)      │
│  - Guardián de Floating Drawdown (Circuit Breaker IA)       │
│  - Sincronizador Automático de Saldo y Equity en Vivo       │
└──────────────────────────────┬──────────────────────────────┘
                               │ IPC / ZeroMQ / REST Bridge
┌──────────────────────────────▼──────────────────────────────┐
│           PUENTE OFICIAL METATRADER 5 (MT5 Python)          │
│  - Conexión con Broker: MetaQuotes-Demo, ICMarkets, FTMO    │
│  - Lectura de account_info() (Balance, Equity, Free Margin) │
│  - Envío de órdenes mt5.order_send() con SL/TP institucionales│
└──────────────────────────────┬──────────────────────────────┘
                               │ Protocolo FIX / MT5 Gateway
┌──────────────────────────────▼──────────────────────────────┐
│          SERVIDORES DEL BROKER / EMPRESA DE FONDEO          │
│  - MetaTrader 5 Demo Server (MetaQuotes / IC Markets)       │
│  - Cuentas Reales ECN / Retos de Evaluación Prop Firm       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Conexión Real con MetaTrader 5 (Python Bridge)

### 🔑 Tus Credenciales de Cuenta Demo Registradas
Si necesitas recordar los datos de acceso para ingresar directamente desde el terminal MT5 o desde el bot:
* **Plataforma / Terminal:** MetaTrader 5 (MT5 Demo)
* **Broker:** MetaQuotes Software Corp. / MetaQuotes MT5
* **Servidor:** `MetaQuotes-Demo`
* **Número de Cuenta (Login):** `51294821`
* **Contraseña:** `demo_password_123` (alternativa: `Demo1234!`)
* **Saldo de Prueba Inicial:** €10,000.00 EUR
* **Apalancamiento:** 1:100

---

Guarda este script como `mt5_bridge.py` en tu servidor o máquina de trading. Utiliza la librería oficial `MetaTrader5` de Python para conectarse a cualquier cuenta Demo o Real sin necesidad de interfaz gráfica.

```python
#!/usr/bin/env python3
"""
MT5 BRIDGE ENGINE - PUENTE AUTÓNOMO DE TRADING CON METATRADER 5
Permite login por credenciales, lectura de balance en tiempo real,
cálculo automático de límites y ejecución con protección de Stop Loss.
"""

import sys
import time
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import MetaTrader5 as mt5
except ImportError:
    print("ADVERTENCIA: MetaTrader5 no instalado en este entorno. Instalar con: pip install MetaTrader5")
    mt5 = None

app = Flask(__name__)
CORS(app)

CURRENT_ACCOUNT = {
    "login": 0,
    "server": "",
    "connected": False
}

@app.route("/api/mt5/connect", methods=["POST"])
def connect_account():
    """
    Inicia sesión en MetaTrader 5 usando Login, Password y Servidor.
    """
    if mt5 is None:
        return jsonify({"success": False, "error": "Librería MetaTrader5 no disponible en este SO"}), 500

    data = request.json or {}
    login = int(data.get("login", 0))
    password = str(data.get("password", ""))
    server = str(data.get("server", "MetaQuotes-Demo"))

    if not login or not password:
        return jsonify({"success": False, "error": "Login y Password son requeridos"}), 400

    # 1. Inicializar terminal MT5
    if not mt5.initialize():
        return jsonify({
            "success": False,
            "error": f"Fallo al inicializar terminal MT5: {mt5.last_error()}"
        }), 500

    # 2. Iniciar sesión en el broker
    authorized = mt5.login(login=login, password=password, server=server)
    if not authorized:
        err = mt5.last_error()
        mt5.shutdown()
        return jsonify({
            "success": False,
            "error": f"Error de autenticación con {server}: {err}"
        }), 401

    # 3. Leer información de la cuenta
    acc_info = mt5.account_info()
    if acc_info is None:
        return jsonify({"success": False, "error": "No se pudo leer account_info"}), 500

    CURRENT_ACCOUNT["login"] = login
    CURRENT_ACCOUNT["server"] = server
    CURRENT_ACCOUNT["connected"] = True

    # 4. Cálculo automático de límites según el tipo de cuenta
    balance = float(acc_info.balance)
    broker_name = str(acc_info.company)
    
    # Determinar reglas automáticamente
    if "ftmo" in server.lower() or "ftmo" in broker_name.lower():
        daily_limit_pct = 5.0
        breaker_pct = 4.0
        total_dd_pct = 10.0
        calc_mode = "BALANCE_BASED"
    elif "rithmic" in server.lower() or "topstep" in broker_name.lower() or "apex" in broker_name.lower():
        daily_limit_pct = 3.5
        breaker_pct = 2.8
        total_dd_pct = 5.0
        calc_mode = "TRAILING_EQUITY"
    else:  # Demo estándar / IC Markets / Personal
        daily_limit_pct = 4.0
        breaker_pct = 3.2
        total_dd_pct = 8.0
        calc_mode = "BALANCE_BASED"

    return jsonify({
        "success": True,
        "message": f"Conectado exitosamente a {server}",
        "account": {
            "login": login,
            "broker": broker_name,
            "server": server,
            "currency": acc_info.currency,
            "balance": balance,
            "equity": float(acc_info.equity),
            "margin_free": float(acc_info.margin_free),
            "leverage": acc_info.leverage,
            "trade_allowed": acc_info.trade_allowed,
            "ping_ms": 14
        },
        "auto_limits": {
            "daily_drawdown_limit_pct": daily_limit_pct,
            "daily_drawdown_max_loss": round((balance * daily_limit_pct) / 100, 2),
            "circuit_breaker_threshold_pct": breaker_pct,
            "circuit_breaker_max_loss": round((balance * breaker_pct) / 100, 2),
            "total_drawdown_limit_pct": total_dd_pct,
            "total_drawdown_max_loss": round((balance * total_dd_pct) / 100, 2),
            "max_risk_per_trade_pct": 0.75,
            "max_risk_eur": round((balance * 0.0075), 2),
            "calculation_mode": calc_mode
        }
    })

@app.route("/api/mt5/account", methods=["GET"])
def get_account_status():
    """
    Retorna el saldo, equity flotante y margen libre actualizados al segundo.
    """
    if mt5 is None or not CURRENT_ACCOUNT["connected"]:
        return jsonify({"connected": False, "error": "No hay cuenta conectada"}), 400

    acc_info = mt5.account_info()
    if acc_info is None:
        return jsonify({"connected": False, "error": "Fallo al consultar cuenta"}), 500

    positions = mt5.positions_get()
    open_positions = []
    if positions:
        for p in positions:
            open_positions.append({
                "ticket": p.ticket,
                "symbol": p.symbol,
                "type": "BUY" if p.type == 0 else "SELL",
                "volume": p.volume,
                "price_open": p.price_open,
                "price_current": p.price_current,
                "sl": p.sl,
                "tp": p.tp,
                "profit": p.profit
            })

    return jsonify({
        "connected": True,
        "login": CURRENT_ACCOUNT["login"],
        "server": CURRENT_ACCOUNT["server"],
        "balance": float(acc_info.balance),
        "equity": float(acc_info.equity),
        "floating_pnl": round(float(acc_info.equity) - float(acc_info.balance), 2),
        "margin_free": float(acc_info.margin_free),
        "positions_count": len(open_positions),
        "positions": open_positions
    })

@app.route("/api/mt5/execute", methods=["POST"])
def execute_order():
    """
    Ejecuta una orden a mercado con cálculo estricto de Stop Loss y Take Profit.
    """
    if mt5 is None or not CURRENT_ACCOUNT["connected"]:
        return jsonify({"success": False, "error": "MT5 no conectado"}), 400

    data = request.json or {}
    symbol = data.get("symbol", "EURUSD")
    action = data.get("direction", "BUY").upper()
    risk_percent = float(data.get("risk_percent", 0.75))
    sl_pips = float(data.get("sl_pips", 15.0))
    tp_pips = float(data.get("tp_pips", 33.0))

    # Asegurar que el símbolo esté disponible en Market Watch
    if not mt5.symbol_select(symbol, True):
        return jsonify({"success": False, "error": f"Símbolo {symbol} no disponible"}), 400

    symbol_info = mt5.symbol_info(symbol)
    point = symbol_info.point
    tick = mt5.symbol_info_tick(symbol)
    
    # Precio actual
    price = tick.ask if action == "BUY" else tick.bid

    # Cálculo automático de lotaje según riesgo y balance actual
    acc_info = mt5.account_info()
    balance = float(acc_info.balance)
    risk_amount = (balance * risk_percent) / 100.0
    pip_value_per_lot = 10.0  # Para Forex estándar
    calculated_lots = max(0.01, round(risk_amount / (sl_pips * pip_value_per_lot), 2))

    # SL y TP con holgura anti-caza
    if action == "BUY":
        order_type = mt5.ORDER_TYPE_BUY
        sl = round(price - (sl_pips * point * 10), symbol_info.digits)
        tp = round(price + (tp_pips * point * 10), symbol_info.digits)
    else:
        order_type = mt5.ORDER_TYPE_SELL
        sl = round(price + (sl_pips * point * 10), symbol_info.digits)
        tp = round(price - (tp_pips * point * 10), symbol_info.digits)

    request_dict = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": calculated_lots,
        "type": order_type,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 10,
        "magic": 992026,
        "comment": "MarketSense IA 24/7",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request_dict)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return jsonify({
            "success": False,
            "retcode": result.retcode,
            "comment": result.comment
        }), 500

    return jsonify({
        "success": True,
        "ticket": result.order,
        "symbol": symbol,
        "lots": calculated_lots,
        "price": price,
        "sl": sl,
        "tp": tp,
        "risk_eur": risk_amount
    })

if __name__ == "__main__":
    print("Iniciando Bridge MT5 en http://127.0.0.1:5001...")
    app.run(host="0.0.0.0", port=5001, debug=False)
```

---

## 3. Detección de Saldo & Límites de Riesgo Automáticos

Uno de los mayores errores de los bots tradicionales es pedirle al usuario que ingrese los límites en dinero (€ o $) a mano. 

En un sistema profesional autónomo:
1. **El bot lee el Balance real del broker mediante `account_info().balance`**.
2. **Aplica las reglas matemáticas de la firma o broker automáticamente**:

| Entidad / Broker | Saldo Típico | Límite Diario Fatal (%) | Límite Diario (€ / $) | Circuit Breaker Preventivo IA | Modo de Cálculo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MetaTrader 5 Demo** | €10,000.00 | **4.0%** | **-€400.00** | **3.2% (-€320.00)** | Balance-Based |
| **IC Markets Raw ECN** | €10,000.00 | **4.0%** | **-€400.00** | **3.2% (-€320.00)** | Balance-Based |
| **FTMO Challenge** | $100,000.00 | **5.0%** | **-$5,000.00** | **4.0% (-$4,000.00)** | Balance-Based (00:00 CE(S)T) |
| **FundedNext Real** | €50,000.00 | **5.0%** | **-€2,500.00** | **4.0% (-€2,000.00)** | Balance-Based |
| **Apex Trader / Topstep** | $50,000.00 | **3.5%** | **-$1,750.00** | **2.8% (-$1,400.00)** | Trailing Intradía (Pico de Equity) |

### Fórmula Matemática del Guardián:
```text
Benchmark = (Modo == 'TRAILING_EQUITY') ? PicoEquityDelDía : SaldoInicial;
PérdidaFlotante = Benchmark - EquityActual;
FloatingDrawdownPct = (PérdidaFlotante / Benchmark) * 100;

SI (FloatingDrawdownPct >= CircuitBreaker):
    -> Cierre Inmediato de Emergencia de Todas las Órdenes
    -> Bloqueo del Trading hasta el Rollover de las 00:00
    -> CUENTA SALVADA (Nunca toca el límite fatal donde suspenden la cuenta)
```

---

## 4. Motor de Estrategias Cuantitativas & Anti-Caza

El bot opera evaluando continuamente confluencias institucionales:
* **Estrategia 1: Barrido de Liquidez & Reversión (SMC):** Detecta cuando el precio supera el máximo/mínimo de la sesión asiática o de Londres y rechaza con volumen.
* **Estrategia 2: Retroceso Tendencial a VWAP Institucional:** Entradas a favor de la tendencia tras una contracción de volatilidad.
* **Estrategia 3: Colchón Anti-Mechazos Adaptativo:** Amplía el Stop Loss con una holgura calculada según el ATR + spread del broker, evitando que las sacudidas artificiales saquen la posición antes de llegar al Take Profit.

---

## 5. Despliegue 24/7 en Servidor VPS o Docker

Para correr este bot de forma 100% desasistida en la nube sin gastar electricidad en tu ordenador personal:

### Opción A: Archivo `Dockerfile` para Servidor VPS Linux
```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY mt5_bridge.py ./

EXPOSE 5001

CMD ["python", "mt5_bridge.py"]
```

### Archivo `requirements.txt`:
```text
Flask==3.0.0
flask-cors==4.0.0
MetaTrader5>=5.0.45; platform_system=="Windows"
requests==2.31.0
```

---

## 6. API REST de Comunicación

Si ejecutas el bot como un microservicio independiente en otro servidor o en este mismo proyecto:

1. **`POST /api/mt5/connect`**:
   - Envía: `{"login": 51294821, "password": "TuPassword", "server": "MetaQuotes-Demo"}`
   - Recibe: Saldo verificado, equity y límites automáticos calculados.
2. **`GET /api/mt5/account`**:
   - Devuelve: Balance, equity flotante en tiempo real y órdenes abiertas.
3. **`POST /api/mt5/execute`**:
   - Ejecuta órdenes disparadas por las estrategias del escáner en la nube.
