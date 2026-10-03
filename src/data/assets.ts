import { AsymmetryVisualMetrics } from '../components/AsymmetryVisualizer';

export type AssetCategory = 'Todos' | 'Acciones' | 'Índices' | 'Cripto' | 'Materias Primas';

export interface NewsItem {
  headline: string;
  source: string;
  time: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  relevance: string;
}

export interface HorizonSentiment {
  sentiment: 'Alcista' | 'Neutral' | 'Bajista';
  score: number; // 0 to 100
  reason: string;
  catalyst: string;
}

export interface BlackSwanAssessment {
  level: 'Bajo' | 'Moderado' | 'Severo';
  isPanicOrStructural: 'Ruido/Pánico Psicológico (Oportunidad)' | 'Deterioro Fundamental Estructural (Precaución)' | 'Estable / Sin Señales Críticas';
  summary: string;
  recommendation: string;
}

export interface FundamentalMetrics {
  ebitda: string;
  netDebt: string;
  debtToEbitda: string;
  freeCashFlow: string;
  peRatio?: string;
  orderBacklog?: string; // Cartera de obras/pedidos
  aiSolvencyVerdict: string;
  balanceStrength: 'Excelente (Caja Neta)' | 'Saludable / Manejable' | 'En Reestructuración / Requiere Vigilancia' | 'Riesgo Elevado';
}

export interface Asset {
  ticker: string;
  name: string;
  category: 'Acciones' | 'Índices' | 'Cripto' | 'Materias Primas';
  price: string;
  change: string;
  isPositive: boolean;
  shortTerm: HorizonSentiment;
  midTerm: HorizonSentiment;
  longTerm: HorizonSentiment;
  blackSwan: BlackSwanAssessment;
  fundamentals?: FundamentalMetrics;
  newsSample: NewsItem[];
  volume24h?: string;
  marketCap?: string;
  exchange?: string;
  currency?: string;
}

export interface TelegramConfig {
  mode: 'personal' | 'canal_compartido';
  target: string; // e.g. "@InversoresColegas" or "Privado"
  channelName: string;
  autoBriefing: boolean;
  autoOpportunities: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  ownerLabel: string;
  description: string;
  accentColor: string;
  assetTickers: string[];
  telegramConfig: TelegramConfig;
  createdAt: string;
}

export type MarketSector = 'Todos' | 'Asia & Emergentes' | 'Bolsa USA' | 'Bolsa Europea & España' | 'Materias Primas & Energía' | 'Cripto & Web3';

export type GemType = 'small_cap_tech' | 'panic_turnaround' | 'niche_monopoly';

export interface OpportunityScan {
  ticker: string;
  name: string;
  category: 'Acciones' | 'Índices' | 'Cripto' | 'Materias Primas';
  marketSector: 'Asia & Emergentes' | 'Bolsa USA' | 'Bolsa Europea & España' | 'Materias Primas & Energía' | 'Cripto & Web3';
  currentPrice: string;
  targetPriceEstimated?: string; // Precio medio / objetivo estimado de valoración
  exchangeAvailableIBKR?: string; // Bolsa y accesibilidad en Interactive Brokers
  catalystTitle: string;
  whyIsOpportunity: string;
  ebitdaStrength: string;
  debtProfile: string;
  potentialUpside: string;
  riskRewardRatio: string;
  dateDetected: string;
  isFavorited?: boolean;
  gemType?: GemType;
  secretEdge?: string; // Foso tecnológico o patente que codician las Big Tech
  cashBurnVerdict?: string; // Filtro de quema de caja
  allocationStrategy?: string; // Estrategia proporcional universal (% de cartera)
  ticket500Strategy?: string; // Compatible con cálculos de ticket
  asymmetry?: AsymmetryVisualMetrics; // Datos de asimetría visual y horizonte temporal sin ansiedad
}

export const INITIAL_ASSET_DATABASE: Asset[] = [
  {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF (VUSA/VOO)',
    category: 'Índices',
    price: '$538.10',
    change: '+0.54%',
    isPositive: true,
    exchange: 'NYSE / Vanguard',
    currency: 'USD',
    volume24h: '4.8M',
    marketCap: '$520B AUM',
    shortTerm: {
      sentiment: 'Neutral',
      score: 55,
      reason: 'Consolidación cerca de máximos. El mercado asimila la senda de recortes de tipos de interés de la Reserva Federal y datos de empleo.',
      catalyst: 'Publicación del IPC y declaraciones de miembros del FOMC.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 78,
      reason: 'Beneficios del S&P 500 creciendo a doble dígito. Margen de rentabilidad corporativo de empresas líderes en niveles de solidez histórica.',
      catalyst: 'Resultados trimestrales de gigantes tecnológicos y consumo.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 90,
      reason: 'Tu pilar fundamental de acumulación pasiva (TER 0.03%). Máxima diversificación en las 500 mejores corporaciones de la economía americana.',
      catalyst: 'Crecimiento secular de productividad y reinversión automática.'
    },
    blackSwan: {
      level: 'Bajo',
      isPanicOrStructural: 'Estable / Sin Señales Críticas',
      summary: 'El VIX (volatilidad) se encuentra en niveles de complacencia/tranquilidad (14-16). Sin tensiones crediticias en el sistema financiero de EE.UU.',
      recommendation: 'Si se produce una caída del 5% al 10% en un "Viernes Negro", es históricamente la mejor oportunidad para hacer Dollar-Cost Averaging (DCA).'
    },
    fundamentals: {
      ebitda: 'EBITDA agregado: +8.5% YoY',
      netDebt: 'Deuda neta corporativa media: 1.8x EBITDA',
      debtToEbitda: '1.8x (Grado de inversión)',
      freeCashFlow: 'Rendimiento FCF: ~4.2%',
      peRatio: 'P/E Forward: 21.2x',
      balanceStrength: 'Excelente (Caja Neta)',
      aiSolvencyVerdict: 'El conjunto de las 500 compañías posee balances de máxima calificación crediticia mundial. Las 10 mayores acumulan más de 500.000 millones de dólares en caja líquida.'
    },
    newsSample: [
      {
        headline: 'Vanguard reporta flujos récord de aportaciones mensuales en su fondo indexado del S&P 500',
        source: 'Morningstar',
        time: 'Hace 2 horas',
        impact: 'Medio',
        relevance: 'Flujo continuo de inversores pasivos e institucionales sosteniendo el mercado.'
      },
      {
        headline: 'La Reserva Federal reitera su compromiso con un aterrizaje suave de la economía estadounidense',
        source: 'Reuters Financial',
        time: 'Hace 4 horas',
        impact: 'Alto',
        relevance: 'Despeja el temor a una recesión inminente en los próximos trimestres.'
      }
    ]
  },
  {
    ticker: 'OHLA',
    name: 'OHLA - Obrascón Huarte Lain (Bolsa de Madrid)',
    category: 'Acciones',
    price: '0.3614 €',
    change: '+1.69%',
    isPositive: true,
    exchange: 'Bolsa de Madrid (BME: OHLA)',
    currency: 'EUR',
    volume24h: '18.4M títulos',
    marketCap: '235 M€',
    shortTerm: {
      sentiment: 'Neutral',
      score: 49,
      reason: 'Alta sensibilidad a los avances de la ampliación de capital, acuerdos con la banca acreedora para la liberación de avales y venta de filiales.',
      catalyst: 'Comunicaciones a la CNMV sobre el acuerdo con los bonistas y la familia Amodio.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 64,
      reason: 'Cartera de pedidos de obra civil e infraestructuras en máximos históricos (más de 8.000 millones de euros en contratos adjudicados en EE.UU., España y Latinoamérica).',
      catalyst: 'Culminación del proceso de desapalancamiento y mejora de la calificación crediticia de Moody\'s.'
    },
    longTerm: {
      sentiment: 'Neutral',
      score: 58,
      reason: 'Valor de "Turnaround" (reestructuración profunda). Si limpian la deuda y recuperan el margen EBITDA histórico de construcción, el potencial de revalorización es asimétrico, pero exige paciencia.',
      catalyst: 'Regreso al beneficio neto sostenido y reducción drástica de gastos financieros de la deuda de bonos.'
    },
    blackSwan: {
      level: 'Moderado',
      isPanicOrStructural: 'Ruido/Pánico Psicológico (Oportunidad)',
      summary: 'OHLA es una acción de pequeña capitalización (Small/Penny Cap) en reestructuración. Los titulares sensacionalistas de la prensa española sobre "ultimátum bancario" provocan caídas del 8-12% en días de baja liquidez.',
      recommendation: 'No sobre-reaccionar a rumores de prensa. Solo una ruptura total de las negociaciones de bonistas justificaría salir en pérdidas. La cartera de contratos reales de obra civil sigue ejecutándose.'
    },
    fundamentals: {
      ebitda: '137 M€ (EBITDA Operativo)',
      netDebt: 'Deuda Financiera Neta: ~420 M€ (con bonistas)',
      debtToEbitda: '3.1x (En proceso de reducción vía ampliación)',
      freeCashFlow: 'Mejorando por liquidación de anticipos en EE.UU.',
      orderBacklog: '8.200 M€ (Más de 24 meses de actividad garantizada)',
      peRatio: 'P/E Normalizado proyectado: ~7x tras refinanciación',
      balanceStrength: 'En Reestructuración / Requiere Vigilancia',
      aiSolvencyVerdict: 'La clave de OHLA no es la falta de trabajo (su cartera de 8.200 M€ en EE.UU. y Europa es récord), sino el coste de los intereses de sus bonos. Si el plan de refinanciación reduce la deuda por debajo de 300 M€, el valor contable por acción triplica el precio de cotización actual.'
    },
    newsSample: [
      {
        headline: 'OHLA asegura nuevos contratos de infraestructuras de transporte en EE.UU. por más de 300 millones de dólares',
        source: 'Expansión / CNMV',
        time: 'Hace 3 horas',
        impact: 'Alto',
        relevance: 'Confirma que el negocio operativo sigue ganando proyectos clave a pesar de la reestructuración.'
      },
      {
        headline: 'Avanzan las negociaciones entre los accionistas de referencia y las entidades financieras para el calendario de vencimientos',
        source: 'Cinco Días',
        time: 'Ayer',
        impact: 'Alto',
        relevance: 'La dirección busca estabilizar el balance para los próximos 4 ejercicios.'
      }
    ]
  },
  {
    ticker: 'BTC',
    name: 'Bitcoin (Criptoactivo Reserva)',
    category: 'Cripto',
    price: '$83,064.10',
    change: '-0.49%',
    isPositive: false,
    exchange: 'Global 24/7',
    currency: 'USD',
    volume24h: '$34.2B',
    marketCap: '$1.64T',
    shortTerm: {
      sentiment: 'Alcista',
      score: 78,
      reason: 'Flujo neto de entrada institucional constante en los ETFs al contado. Rápida absorción de ventas en zonas de soporte clave.',
      catalyst: 'Entrada de capital corporativo y reducción de oferta líquida en exchanges.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 84,
      reason: 'Consolidación del efecto post-halving y política monetaria global expansiva.',
      catalyst: 'Adopción de Bitcoin como activo de reserva en tesorerías corporativas internacionales.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 89,
      reason: 'La red monetaria descentralizada más segura del planeta. Excelente activo de protección contra la degradación de monedas fiduciarias.',
      catalyst: 'Monetización global como Oro Digital a escala soberana.'
    },
    blackSwan: {
      level: 'Moderado',
      isPanicOrStructural: 'Ruido/Pánico Psicológico (Oportunidad)',
      summary: 'Históricamente, caídas de -10% o -15% en un solo día en Bitcoin son comunes debido a cascadas de liquidación de futuros apalancados. La red blockchain sigue minando bloques al 100%.',
      recommendation: 'Si baja 10% en un día por volatilidad de futuros: mantener la calma total. Nunca vender en capitulación si los fundamentales on-chain se mantienen.'
    },
    fundamentals: {
      ebitda: 'Cero deuda corporativa (Red descentralizada)',
      netDebt: '$0 (Activo sin riesgo de contraparte)',
      debtToEbitda: '0.0x (Sin pasivos)',
      freeCashFlow: 'Emisión fija algorítmica (3.125 BTC por bloque)',
      peRatio: 'Coste marginal de minado: ~$55,000 / BTC',
      balanceStrength: 'Excelente (Caja Neta)',
      aiSolvencyVerdict: 'Bitcoin no es una empresa con directores ni deuda bancaria; es un protocolo monetario. Su métrica equivalente a solvencia es la seguridad criptográfica (Hashrate en máximos históricos) y la oferta en manos de inversores a largo plazo (más del 70% sin moverse en 1 año).'
    },
    newsSample: [
      {
        headline: 'Los ETFs al contado de Bitcoin registran el tercer mayor flujo semanal de entradas del trimestre',
        source: 'CoinDesk',
        time: 'Hace 1 hora',
        impact: 'Alto',
        relevance: 'La demanda institucional institucionalizada supera la creación de nuevas monedas.'
      },
      {
        headline: 'Bancos de inversión en EE.UU. amplían servicios de custodia y negociación para clientes de alto patrimonio',
        source: 'Bloomberg Crypto',
        time: 'Hace 5 horas',
        impact: 'Medio',
        relevance: 'Legitimación regulatoria y eliminación de riesgo de prohibición.'
      }
    ]
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    category: 'Índices',
    price: '$586.40',
    change: '+0.52%',
    isPositive: true,
    exchange: 'NYSE Arca',
    currency: 'USD',
    volume24h: '58.2M',
    marketCap: '$590B AUM',
    shortTerm: {
      sentiment: 'Neutral',
      score: 54,
      reason: 'Consolidación técnica en máximos históricos a la espera de minutas de la Reserva Federal y datos de IPC.',
      catalyst: 'Publicación de datos de inflación y rendimientos del bono a 10 años.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 76,
      reason: 'Beneficios corporativos del 78% de empresas superando estimaciones; ciclo de flexibilización monetaria en marcha.',
      catalyst: 'Temporada de balances trimestrales de mega caps tecnológicas.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 88,
      reason: 'El índice más resiliente de la historia del capitalismo global. Crecimiento compuesto secular de productividad.',
      catalyst: 'Inyección de productividad por software, robótica y demografía corporativa.'
    },
    blackSwan: {
      level: 'Bajo',
      isPanicOrStructural: 'Estable / Sin Señales Críticas',
      summary: 'El VIX cotiza en rangos controlados (13-16). Sin dislocaciones de liquidez interbancaria ni riesgos de crédito sistémico.',
      recommendation: 'Mantener compras periódicas programadas (DCA). Si ocurre una caída repentina del 5-8%, históricamente es oportunidad de acumulación.'
    },
    newsSample: [
      {
        headline: 'Wall Street evalúa trayectoria de tasas de interés tras informe favorable de nóminas no agrícolas',
        source: 'Reuters Financial',
        time: 'Hace 45 min',
        impact: 'Alto',
        relevance: 'Confirma que la economía no entra en recesión inminente.'
      }
    ]
  },
  {
    ticker: 'GLD',
    name: 'SPDR Gold Shares (Oro Físico)',
    category: 'Materias Primas',
    price: '$252.30',
    change: '+0.60%',
    isPositive: true,
    exchange: 'NYSE Arca',
    currency: 'USD',
    volume24h: '7.1M',
    marketCap: '$74B AUM',
    shortTerm: {
      sentiment: 'Alcista',
      score: 77,
      reason: 'Tensiones geopolíticas y compras ininterrumpidas de oro físico por parte de bancos centrales de Asia y Medio Oriente.',
      catalyst: 'Desdolarización gradual de reservas oficiales extranjeras.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 85,
      reason: 'Entorno de recorte de tasas de interés reales disminuye el costo de oportunidad de mantener metales preciosos.',
      catalyst: 'Déficit fiscal crónico en las principales economías desarrolladas.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 88,
      reason: 'El depósito de valor indiscutido de la humanidad durante más de 5,000 años.',
      catalyst: 'Cobertura contra devaluación monetaria y turbulencia geopolítica.'
    },
    blackSwan: {
      level: 'Bajo',
      isPanicOrStructural: 'Estable / Sin Señales Críticas',
      summary: 'El activo refugio por excelencia durante un "Viernes Negro" financiero.',
      recommendation: 'Excelente contrapeso para amortiguar volatilidades del S&P o de criptoactivos en tu cuenta de Interactive Brokers.'
    },
    newsSample: [
      {
        headline: 'Banco Popular de China y otros 14 bancos centrales acumulan lingotes por decimoctavo mes consecutivo',
        source: 'World Gold Council',
        time: 'Ayer',
        impact: 'Alto',
        relevance: 'Piso de demanda institucional inflexible al precio spot.'
      }
    ]
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Acciones',
    price: '$129.80',
    change: '+2.45%',
    isPositive: true,
    exchange: 'NASDAQ',
    currency: 'USD',
    volume24h: '52.1M',
    marketCap: '$3.18T',
    shortTerm: {
      sentiment: 'Alcista',
      score: 84,
      reason: 'Capacidad de producción de chips Blackwell vendida al 100% para los próximos 12 meses.',
      catalyst: 'Declaraciones de directores ejecutivos de Microsoft, Meta y Google ratificando su gasto en centros de datos.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 80,
      reason: 'Foso tecnológico insuperable a corto plazo gracias al ecosistema de software CUDA y redes InfiniBand.',
      catalyst: 'Márgenes brutos estables superiores al 70%.'
    },
    longTerm: {
      sentiment: 'Neutral',
      score: 62,
      reason: 'Riesgo de desaceleración del capex tecnológico si el retorno de inversión (ROI) del software IA tarda más de lo previsto.',
      catalyst: 'Competencia interna de chips personalizados.'
    },
    blackSwan: {
      level: 'Moderado',
      isPanicOrStructural: 'Ruido/Pánico Psicológico (Oportunidad)',
      summary: 'Cualquier titular sobre controles de exportación a China provoca caídas bruscas de 7-10% intradía.',
      recommendation: 'Comprobar si el impacto afecta más del 15% de los ingresos totales. Si no es así, es ruido pasajero que no justifica venta en pérdidas.'
    },
    fundamentals: {
      ebitda: '$75.0B (Margen EBITDA > 60%)',
      netDebt: '-$20.0B (Caja neta positiva masiva)',
      debtToEbitda: '0.0x (Sin deuda neta)',
      freeCashFlow: '$52.0B anuales',
      peRatio: 'P/E Forward: ~32x',
      balanceStrength: 'Excelente (Caja Neta)',
      aiSolvencyVerdict: 'Solvencia del más alto rango mundial. Produce tanto flujo de caja libre que podría recomprar sus pasivos varias veces al año.'
    },
    newsSample: [
      {
        headline: 'NVIDIA expande acuerdos estratégicos de supercómputo soberano en Europa y Japón',
        source: 'Wall Street Journal',
        time: 'Hace 1 hora',
        impact: 'Alto',
        relevance: 'Diversifica clientes fuera de los 4 grandes gigantes de Silicon Valley.'
      }
    ]
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    category: 'Acciones',
    price: '$233.50',
    change: '-0.20%',
    isPositive: false,
    exchange: 'NASDAQ',
    currency: 'USD',
    volume24h: '41.0M',
    marketCap: '$3.55T',
    shortTerm: {
      sentiment: 'Neutral',
      score: 50,
      reason: 'Lanzamiento paulatino de funciones de Apple Intelligence sin un superciclo evidente aún.',
      catalyst: 'Monitoreo de tiempos de entrega y encuestas de compra de consumidores en Norteamérica.'
    },
    midTerm: {
      sentiment: 'Neutral',
      score: 58,
      reason: 'Crecimiento de ingresos en servicios (App Store, iCloud, Pay) compensa la maduración de ventas de hardware.',
      catalyst: 'Batallas antimonopolio del Departamento de Justicia de EE.UU. sobre acuerdos de búsqueda predeterminada.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 83,
      reason: 'La máquina de flujo de caja libre más implacable del mundo, lealtad de usuarios con tasa de retención del 98%.',
      catalyst: 'Recompra sistemática de acciones propias reduciendo el circulante año tras año.'
    },
    blackSwan: {
      level: 'Bajo',
      isPanicOrStructural: 'Estable / Sin Señales Críticas',
      summary: 'Balance con fortaleza de grado soberano. Prácticamente inmune a quiebras o cisnes negros financieros clásicos.',
      recommendation: 'Activo idóneo para dejar madurar durante años en Interactive Brokers sin estrés diario.'
    },
    newsSample: [
      {
        headline: 'La división de servicios de Apple se encamina a superar los $100 mil millones de facturación anual',
        source: 'Barron\'s',
        time: 'Hace 6 horas',
        impact: 'Alto',
        relevance: 'Margen bruto de servicios superior al 74%, transformando el múltiplo del negocio.'
      }
    ]
  },
  {
    ticker: 'TSM',
    name: 'Taiwan Semiconductor Manufacturing Co. (TSMC)',
    category: 'Acciones',
    price: '$189.50',
    change: '+2.10%',
    isPositive: true,
    exchange: 'NYSE / Taiwán (ADR)',
    currency: 'USD',
    volume24h: '16.8M',
    marketCap: '$980B',
    shortTerm: {
      sentiment: 'Alcista',
      score: 82,
      reason: 'Capacidad de fundición de obleas de 3nm y 2nm copada al 100% por Apple, Nvidia y Qualcomm.',
      catalyst: 'Guía de ingresos trimestrales superando estimaciones de analistas.'
    },
    midTerm: {
      sentiment: 'Alcista',
      score: 86,
      reason: 'Foso defensivo insuperable: domina más del 60% de la cuota global de semiconductores y el 90% en chips avanzados.',
      catalyst: 'Subida de precios de obleas aceptada sin fricción por los clientes.'
    },
    longTerm: {
      sentiment: 'Alcista',
      score: 88,
      reason: 'La columna vertebral física de la era digital y de la IA. Diversificación geográfica con fábricas en Arizona, Japón y Alemania.',
      catalyst: 'Capex plurianual masivo con márgenes brutos superiores al 53%.'
    },
    blackSwan: {
      level: 'Moderado',
      isPanicOrStructural: 'Ruido/Pánico Psicológico (Oportunidad)',
      summary: 'El ruido geopolítico recurrente sobre tensiones con China en el Estrecho de Taiwán genera caídas temporales del 8-12%.',
      recommendation: 'Históricamente, cualquier retroceso brusco en TSMC por titulares geopolíticos es una de las mejores oportunidades de compra en Interactive Brokers. El mundo entero colapsaría sin sus fábricas.'
    },
    fundamentals: {
      ebitda: '$48.5B (Margen EBITDA > 68%)',
      netDebt: '-$18.0B (Caja neta positiva holgada)',
      debtToEbitda: '0.0x (Solvencia de primer nivel mundial)',
      freeCashFlow: '$24.0B anuales',
      peRatio: 'P/E Forward: ~21x',
      balanceStrength: 'Excelente (Caja Neta)',
      aiSolvencyVerdict: 'Balance extraordinariamente protegido. Genera tanta caja que financia $30.000 millones anuales en nuevas fábricas sin depender de deuda bancaria.'
    },
    newsSample: [
      {
        headline: 'TSMC eleva previsiones de ingresos para el año impulsada por pedidos ininterrumpidos de aceleradores de IA',
        source: 'Nikkei Asia',
        time: 'Hace 3 horas',
        impact: 'Alto',
        relevance: 'Ratifica la salud inquebrantable de la demanda asiática.'
      }
    ]
  }
];

export const OPPORTUNITIES_DATABASE: OpportunityScan[] = [
  {
    ticker: 'TSM',
    name: 'Taiwan Semiconductor Manufacturing Co. (TSMC)',
    category: 'Acciones',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$189.50',
    catalystTitle: 'Monopolio indiscutido de fundición de chips de IA con descuento por riesgo geopolítico',
    whyIsOpportunity: 'Fabrica el 90% de los chips de IA del mundo (Nvidia, AMD, Apple). Cotiza a solo 21x beneficios con crecimiento de beneficios de +30% anual.',
    ebitdaStrength: 'EBITDA colosal de $48.500M con márgenes operativos del 43%.',
    debtProfile: 'Caja neta positiva de $18.000M. Solvencia impecable.',
    potentialUpside: '+30% en ciclo de superchips de 2nm',
    riskRewardRatio: '1 : 4.1 (Líder tecnológico absoluto de Asia)',
    dateDetected: 'Hoy'
  },
  {
    ticker: 'BABA',
    name: 'Alibaba Group (E-Commerce, Cloud & IA en Asia)',
    category: 'Acciones',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$104.20',
    catalystTitle: 'Estímulos económicos masivos en China y aceleración de recompras de acciones',
    whyIsOpportunity: 'Valor profundo extremo: cotiza a menos de 11x beneficios con más de $60.000 millones en caja líquida (casi el 30% de toda su capitalización bursátil).',
    ebitdaStrength: 'EBITDA superior a $25.000M anuales.',
    debtProfile: 'Caja neta masiva libre de deuda bancaria riesgosa.',
    potentialUpside: '+45% en revalorización del consumo asiático',
    riskRewardRatio: '1 : 3.8 (Asimetría alta para carteras emergentes)',
    dateDetected: 'Ayer'
  },
  {
    ticker: 'MELI',
    name: 'MercadoLibre (El Titán de E-commerce y Fintech de América Latina)',
    category: 'Acciones',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$1,980.00',
    catalystTitle: 'Crecimiento imparable del volumen de pagos en Mercado Pago y logística líder',
    whyIsOpportunity: 'Crece a tasas superiores al +35% interanual en Brasil y México. La red de logística y servicios financieros de crédito crea un foso de red imposible de replicar para Amazon en la región.',
    ebitdaStrength: 'EBITDA expandiéndose a doble dígito (+40% YoY).',
    debtProfile: 'Flujo de caja libre robusto y deuda controlada.',
    potentialUpside: '+32% hacia precio objetivo de consenso',
    riskRewardRatio: '1 : 3.6 (La mejor multinacional emergente en IBKR)',
    dateDetected: 'Hoy'
  },
  {
    ticker: 'INDA',
    name: 'iShares MSCI India ETF (La Mayor Democracia y Demografía del Mundo)',
    category: 'Índices',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$55.80',
    catalystTitle: 'Crecimiento de PIB del 7% y migración industrial global hacia India',
    whyIsOpportunity: 'India es el mercado emergente con mejor demografía y estabilidad jurídica de Asia. Más de 1.400 millones de personas en plena bancarización y consumo masivo.',
    ebitdaStrength: 'Beneficios del sector financiero e industrial indio creciendo al 15% anual.',
    debtProfile: 'Deuda soberana y corporativa en niveles de grado de inversión.',
    potentialUpside: '+26% en acumulación pasiva multianual',
    riskRewardRatio: '1 : 3.9 (Excelente diversificación fuera de Wall Street)',
    dateDetected: 'Hace 2 días'
  },
  {
    ticker: 'ASML',
    name: 'ASML Holding (Monopolio Litografía UE)',
    category: 'Acciones',
    marketSector: 'Bolsa Europea & España',
    currentPrice: '€645.00',
    catalystTitle: 'Caída irracional por guía conservadora de pedidos a corto plazo',
    whyIsOpportunity: 'Monopolio mundial absoluto en máquinas de litografía ultravioleta extrema (EUV). Ningún chip avanzado en el mundo (NVIDIA, Apple, TSMC) puede fabricarse sin ASML.',
    ebitdaStrength: 'EBITDA 9.800 M€ con margen operativo superior al 32%.',
    debtProfile: 'Caja neta positiva. Solvencia AAA implícita.',
    potentialUpside: '+35% a 18 meses hacia fair value',
    riskRewardRatio: '1 : 3.8 (Riesgo bajo / Retorno asimétrico)',
    dateDetected: 'Hoy'
  },
  {
    ticker: 'IBE',
    name: 'Iberdrola (Líder Eléctrico / Redes Renovables)',
    category: 'Acciones',
    marketSector: 'Bolsa Europea & España',
    currentPrice: '13.40 €',
    catalystTitle: 'Demanda disparada de electricidad por centros de datos en Europa y EE.UU.',
    whyIsOpportunity: 'Empresa española con modelo de negocio regulado y seguro. Más del 80% de sus ingresos están blindados contra la inflación mediante tarifas gubernamentales.',
    ebitdaStrength: 'EBITDA récord superior a 15.000 M€ con dividendo creciente (~4.5%).',
    debtProfile: 'Deuda neta 3.2x EBITDA pero 100% ligada a activos de infraestructura con rentabilidad fija por 30 años.',
    potentialUpside: '+22% + 4.5% de dividendo anual en euros',
    riskRewardRatio: '1 : 4.2 (Defensiva de máxima calidad en IBKR)',
    dateDetected: 'Ayer'
  },
  {
    ticker: 'SAN',
    name: 'Banco Santander (Banca Global / ROTE > 16%)',
    category: 'Acciones',
    marketSector: 'Bolsa Europea & España',
    currentPrice: '4.62 €',
    catalystTitle: 'Valoración absurdamente barata (PER 5.8x) a pesar de beneficios récord',
    whyIsOpportunity: 'El mercado europeo sigue infravalorando la rentabilidad bancaria. Santander está usando su exceso de capital para recomprar más del 6% de sus propias acciones cada año.',
    ebitdaStrength: 'Beneficio neto atribuido superior a 12.000 M€ anuales.',
    debtProfile: 'Ratio de capital CET1 fully loaded en 12.5% (máxima solvencia regulatoria del BCE).',
    potentialUpside: '+28% + 6% de dividendo en efectivo',
    riskRewardRatio: '1 : 3.6 (Generador masivo de rentas en IBKR)',
    dateDetected: 'Hoy'
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet / Google (Monopolio Búsqueda, Cloud & YouTube)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$168.40',
    catalystTitle: 'Descuento por miedo regulatorio antimonopolio frente a sus pares',
    whyIsOpportunity: 'Cotiza a tan solo 20.5x beneficios esperados mientras Microsoft y Apple superan las 32x. Líder indiscutido en investigación de IA, YouTube y computación en la nube.',
    ebitdaStrength: 'EBITDA superior a $110.000 millones de dólares anuales.',
    debtProfile: 'Caja neta descomunal: más de $90.000 millones libres de pasivos.',
    potentialUpside: '+28% hacia múltiplos promedio de Big Tech',
    riskRewardRatio: '1 : 4.0 (Poco riesgo a 3 años vista)',
    dateDetected: 'Ayer'
  },
  {
    ticker: 'PYPL',
    name: 'PayPal Holdings (Fintech Global & Checkout)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$74.20',
    catalystTitle: 'Oportunidad de Turnaround / Valor Profundo (Deep Value)',
    whyIsOpportunity: 'Castigada por la competencia de Apple Pay, pero sigue procesando más de 1.5 billones de dólares anuales en volumen de pagos y recomprando el 8% de sus acciones al año.',
    ebitdaStrength: 'Flujo de caja libre (FCF) récord de más de $5.200 M€.',
    debtProfile: 'Deuda neta nula / posición de caja saneada.',
    potentialUpside: '+45% en normalización de múltiplos',
    riskRewardRatio: '1 : 3.4 (Perfil asimétrico de recuperación)',
    dateDetected: 'Hace 3 días'
  },
  {
    ticker: 'CCJ',
    name: 'Cameco Corporation (Líder Mundial de Minería de Uranio)',
    category: 'Materias Primas',
    marketSector: 'Materias Primas & Energía',
    currentPrice: '$54.10',
    catalystTitle: 'Renacimiento nuclear impulsado por Microsoft, Google y Amazon',
    whyIsOpportunity: 'Los centros de datos de inteligencia artificial necesitan energía limpia ininterrumpida las 24 horas del día. La energía nuclear es la única opción y el uranio físico sufre un déficit de oferta.',
    ebitdaStrength: 'Contratos firmados a largo plazo con eléctricas a precios en máximos.',
    debtProfile: 'Deuda neta baja y balances saneados.',
    potentialUpside: '+38% en ciclo plurianual de reactores',
    riskRewardRatio: '1 : 3.7 (Megatendencia energética global)',
    dateDetected: 'Hoy'
  },
  {
    ticker: 'COPX',
    name: 'Global X Copper Miners ETF (Cobre Físico & Mineras)',
    category: 'Materias Primas',
    marketSector: 'Materias Primas & Energía',
    currentPrice: '$42.80',
    catalystTitle: 'Déficit estructural crónico de cobre para redes de energía e IA',
    whyIsOpportunity: 'Para electrificar el mundo, construir centros de datos y coches eléctricos se necesita el doble de cobre del que las minas actuales pueden producir.',
    ebitdaStrength: 'Flujo de caja libre récord en las 5 principales mineras mundiales (Freeport, BHP).',
    debtProfile: 'Desapalancamiento minero masivo durante los últimos 4 años.',
    potentialUpside: '+40% en ciclo plurianual',
    riskRewardRatio: '1 : 3.5 (Excelente contrapeso para materias primas)',
    dateDetected: 'Hace 2 días'
  },
  {
    ticker: 'SOL',
    name: 'Solana (Blockchain de Alta Velocidad & Pagos)',
    category: 'Cripto',
    marketSector: 'Cripto & Web3',
    currentPrice: '$184.50',
    catalystTitle: 'Liderazgo indiscutible en volumen de transacciones y comisiones en exchanges descentralizados',
    whyIsOpportunity: 'Ecosistema de mayor crecimiento orgánico en usuarios activos y adopción de transferencias de bajo coste (Visa, Shopify y PayPal ya integran pagos en Solana).',
    ebitdaStrength: 'Volumen de comisiones superando a Ethereum en días de pico.',
    debtProfile: 'Red descentralizada sin pasivos corporativos.',
    potentialUpside: '+55% en ciclo de adopción Web3',
    riskRewardRatio: '1 : 3.2 (Mayor beta que Bitcoin para carteras cripto)',
    dateDetected: 'Ayer',
    gemType: 'niche_monopoly',
    secretEdge: 'Ecosistema de pagos descentralizados ultrarrápidos con comisiones inferiores a $0.001.',
    cashBurnVerdict: 'No quema caja corporativa; red autónoma autosuficiente.',
    targetPriceEstimated: '$280.00 (Techo de canal en ciclo alcista)',
    allocationStrategy: 'Asignación sugerida: 1% a 3% de tu capital total. Volatilidad alta pero asimetría en adopción masiva.',
    asymmetry: {
      downsideRiskPercent: 22,
      downsidePrice: '$144.00',
      upsidePotentialPercent: 55,
      targetPrice: '$285.00',
      ratioText: '1 : 2.5',
      timeHorizonEstimate: '6 a 12 meses',
      timeHorizonCategory: 'Medio (6-12 meses)',
      patienceGuidance: 'Activo de alta volatilidad. Asignar fracciones pequeñas (1-2%) y dejar correr el ciclo de adopción sin entrar en pánico por retrocesos semanales.'
    }
  },
  {
    ticker: 'SONY',
    name: 'Sony Group Corp (Monopolio Sensores Imagen & Fotónica IA)',
    category: 'Acciones',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$94.20',
    targetPriceEstimated: '$132.00 (Valoración por múltiplos de software y semiconductores)',
    exchangeAvailableIBKR: 'Bolsa de Tokio (6758.T) y NYSE ADR (SONY) en IBKR',
    catalystTitle: 'Demanda disparada de sensores de visión computacional para robótica, coches y smartphones',
    whyIsOpportunity: 'Más del 55% de todos los sensores de imagen CMOS de alta gama del planeta (incluyendo todos los iPhones y cámaras profesionales) son fabricados por Sony. Un foso tecnológico japonés imposible de replicar.',
    ebitdaStrength: 'EBITDA superior a 1.2 billones de yenes (~$8.500M) con márgenes estables.',
    debtProfile: 'Posición de caja neta industrial muy saneada y calificación crediticia A+.',
    potentialUpside: '+40% hacia su valoración intrínseca',
    riskRewardRatio: '1 : 4.2 (Monopolio asiático de máxima calidad en IBKR)',
    dateDetected: 'Escaneo Hoy',
    gemType: 'niche_monopoly',
    secretEdge: 'Patentes mundiales de sensores de imagen apilados indispensables para cámaras de IA y visión autónoma.',
    cashBurnVerdict: 'Cero quema de caja. Generador continuo de miles de millones en flujo libre al año.',
    allocationStrategy: 'Asignación sugerida: 2% a 5% de tu cartera. Calidad defensiva con viento de cola tecnológico en IBKR.',
    asymmetry: {
      downsideRiskPercent: 12,
      downsidePrice: '$82.80',
      upsidePotentialPercent: 40,
      targetPrice: '$132.00',
      ratioText: '1 : 3.3',
      timeHorizonEstimate: '12 a 18 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Monopolio industrial japonés de grado de inversión. El valor se consolida con la demanda de cámaras de IA y robótica; evolución sólida y pausada.'
    }
  },
  {
    ticker: 'TM',
    name: 'Toyota Motor Corp (El Gigante de la Movilidad Híbrida & Caja Neta)',
    category: 'Acciones',
    marketSector: 'Asia & Emergentes',
    currentPrice: '$188.50',
    targetPriceEstimated: '$245.00 (Múltiplo de 10x beneficios normalizados)',
    exchangeAvailableIBKR: 'Bolsa de Tokio (7203.T) y NYSE ADR (TM) en IBKR',
    catalystTitle: 'Triunfo comercial de la tecnología híbrida frente a la desaceleración del vehículo 100% eléctrico',
    whyIsOpportunity: 'Toyota es la empresa automovilística más rentable del mundo: vende más de 10 millones de vehículos al año con un margen operativo del 11% y acumula más de $30.000M en caja neta en su negocio industrial.',
    ebitdaStrength: 'Beneficio operativo récord superior a $35.000M anuales.',
    debtProfile: 'Fortaleza financiera equivalente a calificación soberana AAA.',
    potentialUpside: '+30% + 3.2% de dividendo anual',
    riskRewardRatio: '1 : 4.0 (Pilar defensivo de Asia para comprar en IBKR)',
    dateDetected: 'Escaneo Hoy',
    gemType: 'niche_monopoly',
    secretEdge: 'Red de producción global imbatible en costes y fiabilidad mecánica por más de 30 años.',
    cashBurnVerdict: 'La mayor máquina de generar flujo de caja de la industria mundial del motor.',
    allocationStrategy: 'Asignación sugerida: 3% a 6% de tu cartera. Máxima solvencia patrimonial en Interactive Brokers.',
    asymmetry: {
      downsideRiskPercent: 10,
      downsidePrice: '$169.00',
      upsidePotentialPercent: 30,
      targetPrice: '$245.00',
      ratioText: '1 : 3.0',
      timeHorizonEstimate: '12 a 24 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Pilar defensivo patrimonial. Los 30.000M$ en caja líquida y dividendos protegen el capital mientras la tecnología híbrida barre en ventas mundiales.'
    }
  },
  {
    ticker: 'INTC',
    name: 'Intel Corporation (Reestructuración & Fábricas Soberanas CHIPS Act)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$21.80',
    targetPriceEstimated: '$38.00 - $45.00 (Precio medio histórico de recuperación)',
    exchangeAvailableIBKR: 'NASDAQ (INTC) en IBKR',
    catalystTitle: 'Alianzas de empaquetado avanzado para Amazon AWS y subsidios federales de $8.500M de EE.UU.',
    whyIsOpportunity: 'Intel demostró la fuerza de la asimetría cuando el pánico la llevó a cotizar por debajo del valor de sus propias fábricas. Hoy no se trata de esperar a 19$, sino de evaluar su consolidación actual: EE.UU. no puede permitir que su única fundición soberana caiga, y las alianzas con gigantes de la nube respaldan su plan a medio plazo.',
    ebitdaStrength: 'Negocio tradicional de centros de datos y PCs generando más de $12.000M en flujo operativo.',
    debtProfile: 'Inyecciones directas de la CHIPS Act y entrada de capital de Apollo Global para financiar sus plantas.',
    potentialUpside: '+75% a +105% en maduración de su plan de fundición 18A',
    riskRewardRatio: '1 : 3.8 (Turnaround industrial con respaldo geopolítico de EE.UU.)',
    dateDetected: 'Escaneo Hoy',
    gemType: 'panic_turnaround',
    secretEdge: 'La única empresa occidental con capacidad física de fundición a gran escala en territorio de EE.UU. y Europa.',
    cashBurnVerdict: 'Fase intensiva de inversión cubierta por ayudas gubernamentales y acuerdos de co-inversión privada.',
    allocationStrategy: 'Asignación sugerida: 2% a 4% de tu cartera total. Posición asimétrica con horizonte a 18-24 meses.',
    asymmetry: {
      downsideRiskPercent: 15,
      downsidePrice: '$18.50',
      upsidePotentialPercent: 85,
      targetPrice: '$40.00',
      ratioText: '1 : 5.6',
      timeHorizonEstimate: '18 a 24 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Paciencia en proceso de fundición: la construcción de fábricas y producción para Amazon/Gobierno de EE.UU. madura hacia finales de 2026 y 2027. No buscar retornos instantáneos.'
    }
  },
  {
    ticker: 'FN',
    name: 'Fabrinet (La Empresa Secreta de Fibra Óptica para Nvidia)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$242.00',
    targetPriceEstimated: '$320.00 (Consenso analistas por ciclo de IA óptica)',
    exchangeAvailableIBKR: 'NYSE (FN) en IBKR',
    catalystTitle: 'Crecimiento silencioso del +38% fabricando los transceptores de IA',
    whyIsOpportunity: 'Casi nadie en la calle ha oído hablar de Fabrinet, pero es la fábrica en Tailandia que manufactura físicamente las conexiones ópticas de alta velocidad que Nvidia y Cisco necesitan en sus clusters de servidores de IA.',
    ebitdaStrength: 'Márgenes de rentabilidad operativa del 12% con ingresos récord de más de $2.800M.',
    debtProfile: 'Caja neta positiva de más de $500M. Cero deuda financiera peligrosa.',
    potentialUpside: '+42% por expansión de centros de datos de IA',
    riskRewardRatio: '1 : 4.0 (Small/Mid Cap de calidad suprema sin humo)',
    dateDetected: 'Escaneo Hoy',
    gemType: 'small_cap_tech',
    secretEdge: 'Monopolio en empaquetado y fabricación óptica de precisión. Cliente exclusivo de Nvidia para cables ópticos de 800G.',
    cashBurnVerdict: 'Cero quema de caja. Genera más de $250M de flujo libre al año.',
    allocationStrategy: 'Asignación sugerida: 1.5% a 3% de tu capital. Crecimiento compuesto a rebufo de la IA sin múltiplos desorbitados.',
    asymmetry: {
      downsideRiskPercent: 16,
      downsidePrice: '$203.00',
      upsidePotentialPercent: 42,
      targetPrice: '$345.00',
      ratioText: '1 : 2.6',
      timeHorizonEstimate: '6 a 12 meses',
      timeHorizonCategory: 'Medio (6-12 meses)',
      patienceGuidance: 'Proveedor crítico de Nvidia. Los catalizadores se reflejan en cada entrega trimestral de servidores ópticos de IA.'
    }
  },
  {
    ticker: 'POWI',
    name: 'Power Integrations (Chips de GaN y Ultra-Eficiencia Energética)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$64.50',
    targetPriceEstimated: '$95.00 (Múltiplo de OPA o ciclo de renovación de centros de datos)',
    exchangeAvailableIBKR: 'NASDAQ (POWI) en IBKR',
    catalystTitle: 'Patentes clave en nitruro de galio para cargadores y servidores',
    whyIsOpportunity: 'Empresa tecnológica pequeña y desconocida con más de 800 patentes en conversión de alta tensión. Sus chips permiten que los centros de datos de IA y los cargadores gasten la mitad de calor y electricidad.',
    ebitdaStrength: 'Margen bruto superior al 52% de forma continuada durante más de 10 años.',
    debtProfile: 'Balance con cero deuda bancaria y más de $300M en tesorería pura.',
    potentialUpside: '+50% ante ciclo de renovación de eficiencia energética',
    riskRewardRatio: '1 : 3.8 (Foso tecnológico que codician Texas Instruments o Qualcomm)',
    dateDetected: 'Escaneo Hoy',
    gemType: 'small_cap_tech',
    secretEdge: 'Patentes de tecnología PowiGaN irremplazables en fuentes de alimentación de alta eficiencia.',
    cashBurnVerdict: 'Impecable: Más de 20 años consecutivos con flujo de caja positivo. No diluye a los accionistas.',
    allocationStrategy: 'Asignación sugerida: 1.5% a 3% de tu capital. Joya tecnológica con patentes de alto valor de adquisición.',
    asymmetry: {
      downsideRiskPercent: 14,
      downsidePrice: '$55.50',
      upsidePotentialPercent: 50,
      targetPrice: '$96.00',
      ratioText: '1 : 3.5',
      timeHorizonEstimate: '12 a 18 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Joya de nitruro de galio con balance limpio. Madura conforme los centros de datos renuevan su infraestructura de eficiencia energética.'
    }
  },
  {
    ticker: 'ALNY',
    name: 'Alnylam Pharmaceuticals (Pionera Mundial en Terapias de ARN)',
    category: 'Acciones',
    marketSector: 'Bolsa USA',
    currentPrice: '$282.00',
    targetPriceEstimated: '$380.00 (Prima de adquisición por Big Pharma)',
    exchangeAvailableIBKR: 'NASDAQ (ALNY) en IBKR',
    catalystTitle: 'Candidata histórica Nº1 de compra por parte de Pfizer, Novartis o Roche',
    whyIsOpportunity: 'Ha inventado y patentado la técnica de silenciamiento génico por ARN (RNAi) para curar enfermedades raras del hígado y corazón. Sus fármacos ya facturan más de $1.500M con aprobación de la FDA.',
    ebitdaStrength: 'Creciendo ingresos al +35% anual con royalties de patentes mundiales.',
    debtProfile: 'Más de $2.000M en caja líquida para financiar sus ensayos sin riesgo de quiebra.',
    potentialUpside: '+40% en ventas orgánicas o +60% si se formaliza una OPA de compra',
    riskRewardRatio: '1 : 3.6 (Biotecnología con productos reales en farmacias, no humo)',
    dateDetected: 'Escaneo Ayer',
    gemType: 'small_cap_tech',
    secretEdge: 'Monopolio en patentes de RNAi. Es el activo más codiciado de la industria farmacéutica global.',
    cashBurnVerdict: 'Punto de equilibrio (break-even) operativo alcanzado. Riesgo de dilución prácticamente nulo.',
    allocationStrategy: 'Asignación sugerida: 1% a 3% de tu cartera. Biotecnología con ingresos comerciales y patentes exclusivas.',
    asymmetry: {
      downsideRiskPercent: 15,
      downsidePrice: '$240.00',
      upsidePotentialPercent: 45,
      targetPrice: '$410.00',
      ratioText: '1 : 3.0',
      timeHorizonEstimate: '12 a 24 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Ventas en farmacias y patentes protegidas. El valor se materializa con la expansión de recetas o eventual oferta de compra por Big Pharma.'
    }
  },
  {
    ticker: 'OHLA',
    name: 'OHLA (Asimetría en España / Contratos de $8.200M en EE.UU.)',
    category: 'Acciones',
    marketSector: 'Bolsa Europea & España',
    currentPrice: '0.3520 €',
    targetPriceEstimated: '0.85 € - 1.15 € (Precio medio de valoración contable en caso de normalización)',
    exchangeAvailableIBKR: 'Bolsa de Madrid (OHLA.MC) en IBKR',
    catalystTitle: 'Desbloqueo de avales bancarios y ahorro de 18M€/año en intereses de bonos',
    whyIsOpportunity: 'Cotiza a precios de liquidación por el miedo mediático, pero tiene 8.200M€ en obras adjudicadas en EE.UU. con Santander, CaixaBank y Sabadell cerrando la liberación de líneas comerciales.',
    ebitdaStrength: 'EBITDA operativo de 130-145 M€/año con obras al 7% de margen.',
    debtProfile: 'Reestructuración de bonos para reducir la deuda a niveles confortables.',
    potentialUpside: '+140% a +220% hacia su valoración contable de normalización (0.85€ - 1.15€)',
    riskRewardRatio: '1 : 4.8 (La mayor asimetría del mercado continuo español)',
    dateDetected: 'Hoy',
    gemType: 'panic_turnaround',
    secretEdge: 'Licencias federales y estatales para construir autopistas y hospitales en Nueva York, Florida y California.',
    cashBurnVerdict: 'Desbloqueo de avales libera anticipos de clientes en efectivo.',
    allocationStrategy: 'Asignación sugerida: 1% a 4% de tu capital. Posición controlada para capturar el recorrido de la reestructuración.',
    asymmetry: {
      downsideRiskPercent: 18,
      downsidePrice: '0.2900 €',
      upsidePotentialPercent: 150,
      targetPrice: '0.8800 €',
      ratioText: '1 : 8.3',
      timeHorizonEstimate: '12 a 18 meses',
      timeHorizonCategory: 'Largo (12-24 meses)',
      patienceGuidance: 'Turnaround de reestructuración: el valor se desbloquea con la firma notarial de avales, ahorro de intereses y ejecución de obras en EE.UU.; no mirar oscilaciones intradía.'
    }
  }
];

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-main',
    name: 'Mi Cartera Personal (IBKR)',
    ownerLabel: 'Tú (Inversor Principal)',
    description: 'Tus activos reales en Interactive Brokers: S&P 500 (Vanguard), OHLA España y Bitcoin.',
    accentColor: 'from-emerald-500 to-teal-400',
    assetTickers: ['VOO', 'OHLA', 'BTC', 'GLD'],
    telegramConfig: {
      mode: 'personal',
      target: 'Chat Privado en Móvil',
      channelName: 'Notificaciones Personales',
      autoBriefing: true,
      autoOpportunities: true
    },
    createdAt: '2026-09-28'
  },
  {
    id: 'user-friend',
    name: 'Canal Colegas / Grupo Compartido',
    ownerLabel: 'Canal Compartido',
    description: 'Canal de Telegram con amigos y colegas para compartir el análisis general y oportunidades sin mezclar cuentas.',
    accentColor: 'from-sky-500 to-blue-500',
    assetTickers: ['VOO', 'OHLA', 'BTC', 'ASML', 'IBE'],
    telegramConfig: {
      mode: 'canal_compartido',
      target: '@ColegasInversoresHub',
      channelName: 'Canal: Colegas Inversores',
      autoBriefing: true,
      autoOpportunities: true
    },
    createdAt: '2026-09-29'
  },
  {
    id: 'user-defensive',
    name: 'Cartera Defensiva & Refugio',
    ownerLabel: 'Perfil Anti-Cisne Negro',
    description: 'Orientada a dividendos, preservación de capital y metales de reserva.',
    accentColor: 'from-amber-500 to-orange-400',
    assetTickers: ['VOO', 'GLD', 'OHLA'],
    telegramConfig: {
      mode: 'personal',
      target: 'Chat Privado',
      channelName: 'Alertas Defensivas',
      autoBriefing: true,
      autoOpportunities: false
    },
    createdAt: '2026-09-29'
  }
];
