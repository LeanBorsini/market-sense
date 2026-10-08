# 🏛️ MarketSense AI — Technical Architecture & Engineering Standards

> **Document Version:** 2.0.0  
> **Target Audience:** Senior Software Engineers & Future AI Development Agents  
> **Core Purpose:** Guide ongoing development, maintain modularity, prevent regressions (especially state loops & quota failures), and uphold the terminal's core investing philosophy.

---

## 1. Filosofía y Objetivos del Proyecto (Core Principles)

MarketSense es una terminal de inteligencia financiera fundamental diseñada para inversores particulares que buscan operar con la disciplina y el rigor de inversores institucionales (Value Investing, Turnarounds Asimétricos y Arbitraje de Pánico).

### Principios Fundamentales
1. **La Caja Manda (Cash is King):** EBITDA real, deuda neta y flujo de caja libre (FCF) tienen prioridad absoluta sobre titulares de prensa, rumores o gráficos técnicos de corto plazo.
2. **Asimetría Matemática Sobria:** En cualquier oportunidad analizada, se cuantifica con números fríos el riesgo asumido (suelo de valoración) frente al beneficio potencial (normalización de múltiplos), acompañado **siempre de un horizonte temporal explícito** (ej. 12 a 18 meses) para neutralizar la ansiedad y la incertidumbre del inversor.
3. **Filtro de Ruido ("Explicado en Cristiano"):** Cada noticia o movimiento brusco de mercado se descompone en dos caras:
   * *Ruido de la Prensa:* El titular alarmista.
   * *Realidad Contable:* Lo que realmente dicen los hechos relevantes auditados ante CNMV / SEC.
4. **Resiliencia Total Offline y Tolerancia a Fallos:** La terminal nunca debe quedar bloqueada o inutilizable. Si los servicios en la nube (Firestore) agotan su cuota o fallan, la aplicación conmuta silenciosamente a almacenamiento local (`localStorage`) con cero pérdida de datos.

---

## 2. Estructura Modular de Archivos (Directory Tree)

```
/
├── ARCHITECTURE.md                 # [ESTE ARCHIVO] Manual de arquitectura y estándares
├── PLAN_ETAPA_2_TRADING_AUTONOMO.md # Plan de trading autónomo 24/7 (CFDs/MT5/Fondeo sin futuros)
├── package.json                    # Dependencias y scripts de construcción
├── vite.config.ts                  # Configuración de empaquetado Vite + PWA
├── index.html                      # Punto de entrada HTML con metaetiquetas SEO y viewport
└── src/
    ├── main.tsx                    # Montaje de React y providers globales
    ├── App.tsx                     # Orquestador principal (estado global y tabs)
    ├── index.css                   # Tailwind CSS global (@import "tailwindcss";)
    │
    ├── types/                      # Definiciones TypeScript compartidas
    │   └── market.ts               # Tipos de cotizaciones, filtros y navegación
    │
    ├── context/                    # Contextos globales de React
    │   └── AuthContext.tsx         # Gestión de usuarios (Google Auth + Local) y cuota de Firestore
    │
    ├── lib/                        # Librerías y utilidades de infraestructura
    │   ├── firebase.ts             # Inicialización de Firebase con desconexión segura (disableNetwork)
    │   └── telegram.ts             # Generador de informes y despacho a Telegram (Proxy + Fallback directo)
    │
    ├── data/                       # Bases de datos y modelos contables
    │   ├── assets.ts               # Catálogo de activos, perfiles y base de datos de oportunidades del radar
    │   └── marketSignals.ts        # Razones de movimiento, previsiones a 3 horizontes y calendario macro
    │
    ├── hooks/                      # Hooks personalizados reutilizables
    │   └── usePWAInstall.ts        # Detección de soporte e instalación PWA en escritorio y móviles
    │
    └── components/                 # Componentes visuales desacoplados
        ├── Header.tsx              # Barra superior editorial, reloj multi-horario, buscador y tabs
        ├── AsymmetryVisualizer.tsx # Barra de asimetría sobria y cálculo de horizonte temporal sin ansiedad
        ├── TickerAIConsultant.tsx  # Chatbot consultor de análisis fundamental por activo
        ├── PWAInstallButton.tsx    # Botón de instalación nativa PWA
        │
        ├── views/                  # Vistas principales de las 4 secciones del terminal
        │   ├── WatchlistView.tsx   # Vista 1: Acordeones de seguimiento, TradingView, ajuste de precios y Telegram
        │   ├── MacroImpactView.tsx # Vista 2: Noticias explicadas sin jerga ("En Cristiano")
        │   ├── RadarOpportunitiesView.tsx # Vista 3: Joyas Small Cap, turnarounds y monopolios de nicho
        │   └── CalendarView.tsx    # Vista 4: Calendario de alertas críticas de deuda y pulso macro
        │
        └── modals/                 # Modales interactivos
            ├── AuditModal.tsx      # Modal de auditoría instantánea para cualquier activo del mundo
            └── ProfilesModal.tsx   # Modal de configuración de Telegram (bot/canal) y auto-despacho
```

---

## 3. Flujo de Datos y Arquitectura de Persistencia

### A. Prevención Crítica del Bucle de Escritura Circular
> ⚠️ **REGLA DE ORO PARA CUALQUIER AGENTE IA O DESARROLLADOR:**  
> Nunca sincronices datos bidireccionales entre `cloudData` y el estado local sin el flag de control `isSyncingFromCloudRef`.

* **El Problema:** Cuando Firestore emite un cambio vía `onSnapshot`, `cloudData` se actualiza. Si un `useEffect` local escucha `[trackedTickers]` y llama ciegamente a `saveUserDataToCloud()`, se genera un **bucle infinito de escrituras** (Firestore emite -> App actualiza -> App escribe -> Firestore emite) que agota la cuota diaria en menos de 5 minutos.
* **La Solución Implementada (`src/App.tsx`):**
  ```ts
  // 1. Marcar flag cuando la actualización proviene de Firestore
  if (!areSame) {
    isSyncingFromCloudRef.current = true;
    prevTrackedTickersRef.current = cloudData.keyTickers;
    setTrackedTickers(cloudData.keyTickers);
  }

  // 2. En el guardado, ignorar si fue causado por sincronización entrante
  if (isSyncingFromCloudRef.current) {
    isSyncingFromCloudRef.current = false;
    return;
  }
  ```

### B. Manejo Silencioso de Cuota Excedida (`resource-exhausted`)
* Si la base de datos de Firebase alcanza el límite gratuito diario (20.000 escrituras), `src/context/AuthContext.tsx` y `src/lib/firebase.ts`:
  1. Detectan el código `resource-exhausted`.
  2. Guardan el día UTC actual en `localStorage.setItem('marketsense_fs_quota_day', todayUtc)`.
  3. Ejecutan `disableNetwork(db).catch(() => {})` para cortar el tráfico de red del SDK de Firestore. Esto evita que el cliente de Google intente reconectar continuamente con `Using maximum backoff delay`.
  4. Garantizan que el usuario pueda seguir añadiendo activos, cambiando precios y auditando empresas con **persistencia local garantizada al 100%**.
  5. Al comenzar el nuevo día UTC, el bloqueo se levanta automáticamente.

---

## 4. Descripción de los Módulos Principales

### 1. Barra de Asimetría Sobria (`AsymmetryVisualizer.tsx`)
* **Propósito:** Mostrar visualmente la relación entre el **riesgo a la baja asumido** (suelo de valoración contable) y el **beneficio potencial proyectado** (hacia precio objetivo de normalización).
* **Propiedades Clave:**
  * `ratioText`: Ratio simplificado (ej. `1 : 4.8` o `1 : 8.3`).
  * `timeHorizonEstimate`: Plazo estimado para que la tesis madure (ej. `12 a 18 meses`).
  * `patienceGuidance`: Frase psicológica para neutralizar la ansiedad intradía.

### 2. Vista de Cartera y Previsiones (`WatchlistView.tsx`)
* Acordeón interactivo vertical con enlace a TradingView para gráficos en tiempo real.
* Muestra las previsiones a 3 horizontes temporales:
  * **Corto Plazo (1-3 semanas):** Impulsos técnicos y flujos de liquidez.
  * **Medio Plazo (1-6 meses):** Publicación de resultados trimestrales y cartera de pedidos.
  * **Largo Plazo (12-24 meses):** Desapalancamiento de deuda y valor intrínseco.
* Drawer desplegable para ajustar precios manualmente en vivo si difieren de la referencia.
* Despacho individualizado a Telegram con formato estructurado por activo.

### 3. Radar de Oportunidades & Asimetrías (`RadarOpportunitiesView.tsx`)
* Filtra activos en 4 categorías:
  * `small_cap_tech`: Proveedores críticos de chips y fotónica para IA.
  * `panic_turnaround`: Empresas castigadas por histeria mediática pero con contratos multimillonarios y caja sólida.
  * `niche_monopoly`: Monopolios casi invisibles pero indispensables para la industria global.
  * `asia_ibkr`: Activos de Asia (Japón, Taiwán, India) accesibles al contado en Interactive Brokers.

### 4. Integración con Telegram (`src/lib/telegram.ts`)
* Envío de síntesis diaria ejecutiva con 1 solo clic.
* Auto-detección automática del Chat ID numérico para grupos o canales (`/api/telegram-detect` o llamada directa a `getUpdates`).
* Despacho programado en las 4 ventanas clave de mercado:
  * `09:00 CET` — Apertura de Europa (BME / Madrid).
  * `15:30 CET` — Apertura de Wall Street (NYSE / Nasdaq).
  * `20:00 CET` — Ventana de la Reserva Federal (FED / Powell).
  * `22:00 CET` — Cierre diario de mercados.

---

## 5. Instrucciones para Agentes IA en Futuras Iteraciones

Si eres una Inteligencia Artificial encargada de añadir funciones o corregir errores en este repositorio, debes cumplir estrictamente las siguientes directrices:

1. **No modifiques `metadata.json` para cambiar el nombre de la aplicación.** Mantén las capabilities existentes.
2. **Respeta la separación de vistas:** No agregues lógica visual compleja directamente en `App.tsx`. Si creas una nueva sección o herramienta, añádela como componente en `src/components/views/` o `src/components/modals/`.
3. **No uses `window.alert` o `window.confirm`:** Emplea modales o estados reactivos integrados con Tailwind.
4. **Verificación de Compilación Obligatoria:** Tras modificar cualquier archivo TypeScript, ejecuta siempre `lint_applet` y `compile_applet` para certificar que el código compila sin ningún error de tipado.
5. **No añadas chatbots flotantes genéricos de IA:** La aplicación solo incluye el consultor contable específico por activo (`TickerAIConsultant.tsx`) y el escáner del radar.
6. **Mantén el estilo sobrio (Warm Ivory / Minimalista):** Los colores de fondo base deben mantenerse en `#FBF9F4` y `#F8F6F0`, con acentos en esmeralda sobrio (`emerald-700`/`emerald-800`), ámbar para precauciones y pizarra para tipografía.
