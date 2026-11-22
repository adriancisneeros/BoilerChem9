export type PressureClass = 'low' | 'medium' | 'high';

export type ParamKey =
  | 'ph'
  | 'pAlkalinity'
  | 'mAlkalinity'
  | 'hardness'
  | 'tds'
  | 'sulfite'
  | 'phosphate'
  | 'silica'
  | 'chlorides';

export interface ParamDefinition {
  key: ParamKey;
  index: number;
  name: string;
  shortName: string;
  unit: string;
  step: string;
  description: string;
  lowAdvice: string;
  highAdvice: string;
}

export interface ParamRange {
  min: number;
  max: number;
  warnLow?: number;
  warnHigh?: number;
}

export type PressureLimits = Record<ParamKey, ParamRange>;

export interface BoilerConfig {
  id: string;
  name: string;
  pressureClass: PressureClass;
  operatingPsi: number;
  steamCapacityKgH: number;
  waterVolumeL: number;
  customLimits?: Partial<PressureLimits>;
}

export interface AnalysisValues {
  ph: string;
  pAlkalinity: string;
  mAlkalinity: string;
  hardness: string;
  tds: string;
  sulfite: string;
  phosphate: string;
  silica: string;
  chlorides: string;
}

export interface AnalysisRecord {
  id: string;
  boilerId: string;
  boilerName: string;
  timestamp: string;
  operator: string;
  notes: string;
  values: AnalysisValues;
  overallStatus: 'ok' | 'warn' | 'critical';
}

export const PRESSURE_CLASS_LABELS: Record<PressureClass, { title: string; subtitle: string }> = {
  low: {
    title: 'Baja Presión',
    subtitle: '0 – 300 psi (0 – 20.7 bar) · Pirotubular / Calefacción / Proceso',
  },
  medium: {
    title: 'Media Presión',
    subtitle: '301 – 600 psi (20.8 – 41.4 bar) · Acuotubular Industrial',
  },
  high: {
    title: 'Alta Presión',
    subtitle: '601 – 1000+ psi (> 41.4 bar) · Generación / Turbina',
  },
};

export const PARAMETERS_9: ParamDefinition[] = [
  {
    key: 'ph',
    index: 1,
    name: 'pH del Agua de Caldera',
    shortName: 'pH',
    unit: 'u. pH',
    step: '0.1',
    description: 'Controla la pasivación de magnetita y previene corrosión ácida o cáustica.',
    lowAdvice: 'Riesgo de corrosión ácida. Dosificar alcalinizante (NaOH) o revisar aminas en retorno.',
    highAdvice: 'Riesgo de fragilización cáustica y espuma. Realizar purga de fondo/superficie y reducir sosa.',
  },
  {
    key: 'pAlkalinity',
    index: 2,
    name: 'Alcalinidad P (Fenolftaleína)',
    shortName: 'Alc. P',
    unit: 'ppm CaCO₃',
    step: '1',
    description: 'Mide hidróxidos y la mitad de los carbonatos. Base para calcular alcalinidad OH⁻ (2P - M).',
    lowAdvice: 'Alcalinidad insuficiente para precipitar dureza. Aumentar dosis de alcalinizante.',
    highAdvice: 'Exceso de alcalinidad P. Incrementar purga continua y bajar dosis de NaOH.',
  },
  {
    key: 'mAlkalinity',
    index: 3,
    name: 'Alcalinidad Total (M)',
    shortName: 'Alc. M',
    unit: 'ppm CaCO₃',
    step: '1',
    description: 'Alcalinidad total al naranja de metilo. Un exceso genera CO₂ corrosivo en el vapor.',
    lowAdvice: 'Baja reserva alcalina; vigilar pH y revisar agua de reposición.',
    highAdvice: 'Riesgo de espuma, arrastre (carryover) y corrosión carbónica en condensados. Aumentar purga.',
  },
  {
    key: 'hardness',
    index: 4,
    name: 'Dureza Total (en Caldera)',
    shortName: 'Dureza',
    unit: 'ppm CaCO₃',
    step: '0.5',
    description: 'Calcio y magnesio residuales. Debe mantenerse cercana a cero para evitar incrustaciones.',
    lowAdvice: 'En rango ideal (sin dureza libre).',
    highAdvice: '¡Fuga de dureza! Revisar regeneración del suavizador, dureza de reposición y dosis de fosfato/polímero.',
  },
  {
    key: 'tds',
    index: 5,
    name: 'TDS / Sólidos Disueltos',
    shortName: 'TDS',
    unit: 'ppm',
    step: '10',
    description: 'Concentración total de sales disueltas. Si usas conductímetro (µS/cm), multiplica × 0.67.',
    lowAdvice: 'Ciclos muy bajos: estás desperdiciando agua, calor y químicos por exceso de purga.',
    highAdvice: 'Riesgo de arrastre de agua en el vapor (carryover) e incrustación. Abrir purga continua/fondo.',
  },
  {
    key: 'sulfite',
    index: 6,
    name: 'Sulfito Residual (SO₃²⁻)',
    shortName: 'Sulfito',
    unit: 'ppm',
    step: '1',
    description: 'Secuestrante de oxígeno disuelto. Previene picaduras (pitting) en tubos y economizador.',
    lowAdvice: '¡Peligro de corrosión por O₂! Aumentar bomba de sulfito y revisar temperatura del desaireador (>102 °C).',
    highAdvice: 'Sobredosificación de sulfito: aumenta TDS innecesariamente. Reducir carrera/frecuencia de bomba.',
  },
  {
    key: 'phosphate',
    index: 7,
    name: 'Fosfatos Residuales (PO₄³⁻)',
    shortName: 'Fosfatos',
    unit: 'ppm',
    step: '1',
    description: 'Precipita trazas de calcio como lodo no adherente (hidroxiapatita) para purgarlo.',
    lowAdvice: 'Sin reserva anti-incrustante. Subir dosis de fosfato y verificar dureza de alimentación.',
    highAdvice: 'Exceso de fosfato puede formar lodos o escondite (hideout). Ajustar bomba dosificadora.',
  },
  {
    key: 'silica',
    index: 8,
    name: 'Sílice (SiO₂)',
    shortName: 'Sílice',
    unit: 'ppm',
    step: '1',
    description: 'Forma incrustaciones vítreas muy difíciles de remover y se volatiliza a altas presiones.',
    lowAdvice: 'Nivel seguro de sílice.',
    highAdvice: 'Riesgo de incrustación silícea o depósito en álabes. Aumentar purga continua y revisar Ósmosis/Resina.',
  },
  {
    key: 'chlorides',
    index: 9,
    name: 'Cloruros (Cl⁻)',
    shortName: 'Cloruros',
    unit: 'ppm',
    step: '1',
    description: 'Ión trazador estable para calcular Ciclos de Concentración reales y vigilar corrosión.',
    lowAdvice: 'Concentración baja (revisar si la purga está demasiado abierta).',
    highAdvice: 'Cloruros altos aceleran picadura y definen el límite de ciclos. Incrementar purga o revisar reposición.',
  },
];

export const ASME_PRESETS: Record<PressureClass, PressureLimits> = {
  low: {
    ph: { min: 10.5, max: 11.8, warnLow: 10.2, warnHigh: 12.1 },
    pAlkalinity: { min: 150, max: 500, warnLow: 100, warnHigh: 600 },
    mAlkalinity: { min: 200, max: 700, warnLow: 150, warnHigh: 850 },
    hardness: { min: 0, max: 2, warnHigh: 5 },
    tds: { min: 800, max: 3500, warnLow: 500, warnHigh: 4000 },
    sulfite: { min: 30, max: 60, warnLow: 20, warnHigh: 80 },
    phosphate: { min: 20, max: 50, warnLow: 15, warnHigh: 70 },
    silica: { min: 0, max: 150, warnHigh: 180 },
    chlorides: { min: 0, max: 350, warnHigh: 450 },
  },
  medium: {
    ph: { min: 10.2, max: 11.2, warnLow: 9.8, warnHigh: 11.5 },
    pAlkalinity: { min: 100, max: 350, warnLow: 80, warnHigh: 420 },
    mAlkalinity: { min: 150, max: 500, warnLow: 100, warnHigh: 600 },
    hardness: { min: 0, max: 1, warnHigh: 2 },
    tds: { min: 600, max: 2500, warnLow: 400, warnHigh: 3000 },
    sulfite: { min: 20, max: 45, warnLow: 15, warnHigh: 60 },
    phosphate: { min: 15, max: 40, warnLow: 10, warnHigh: 55 },
    silica: { min: 0, max: 90, warnHigh: 110 },
    chlorides: { min: 0, max: 250, warnHigh: 320 },
  },
  high: {
    ph: { min: 9.8, max: 10.6, warnLow: 9.5, warnHigh: 10.9 },
    pAlkalinity: { min: 50, max: 180, warnLow: 40, warnHigh: 220 },
    mAlkalinity: { min: 80, max: 250, warnLow: 60, warnHigh: 300 },
    hardness: { min: 0, max: 0.5, warnHigh: 1 },
    tds: { min: 300, max: 1200, warnLow: 200, warnHigh: 1500 },
    sulfite: { min: 10, max: 25, warnLow: 5, warnHigh: 35 },
    phosphate: { min: 5, max: 20, warnLow: 3, warnHigh: 30 },
    silica: { min: 0, max: 30, warnHigh: 40 },
    chlorides: { min: 0, max: 100, warnHigh: 140 },
  },
};

export interface TroubleshootingCase {
  id: string;
  title: string;
  severity: 'alta' | 'media';
  symptoms: string[];
  causes: string[];
  actions: string[];
}

export const TROUBLESHOOTING_CASES: TroubleshootingCase[] = [
  {
    id: 'oxygen-pitting',
    title: 'Corrosión por Oxígeno (Pitting)',
    severity: 'alta',
    symptoms: [
      'Sulfito residual menor a 15–20 ppm o en cero',
      'Picaduras localizadas con óxido rojizo/negro en tubos y economizador',
      'Hierro disuelto elevado en agua de caldera',
    ],
    causes: [
      'Temperatura del desaireador por debajo de 102 °C o venteo insuficiente',
      'Bomba de sulfito de sodio descebada o tanque de químico vacío',
      'Entrada de aire en succión de bomba de alimentación',
    ],
    actions: [
      'Verificar temperatura del tanque desaireador (102–105 °C) y presión de vapor',
      'Aumentar dosificación de sulfito hasta recuperar 30–50 ppm en caldera',
      'Purgar línea de succión de bomba dosificadora y revisar nivel del tanque',
    ],
  },
  {
    id: 'scale-hardness',
    title: 'Incrustación por Dureza / Sílice',
    severity: 'alta',
    symptoms: [
      'Dureza > 2 ppm en caldera o > 1 ppm en agua de alimentación',
      'Aumento de temperatura de gases de chimenea y pérdida de eficiencia',
      'Fosfatos consumidos rápidamente (caída brusca de PO₄³⁻)',
    ],
    causes: [
      'Suavizador agotado, salmuera insuficiente o válvula bypass abierta',
      'Fuga de agua cruda en intercambiadores de condensado',
      'Purga de fondo insuficiente para evacuar lodos',
    ],
    actions: [
      'Medir dureza a la salida del suavizador (debe ser < 1 ppm CaCO₃)',
      'Forzar regeneración del suavizador y revisar nivel de sal en salmuera',
      'Aumentar purgas de fondo cortas (3–5 s) y ajustar fosfato/polímero dispersante',
    ],
  },
  {
    id: 'carryover-foaming',
    title: 'Arrastre y Espuma (Carryover)',
    severity: 'alta',
    symptoms: [
      'Nivel de agua inestable en mirilla y trampas de vapor saturadas',
      'TDS o Alcalinidad M por encima del límite ASME',
      'Vapor húmedo o presencia de sólidos/alcalinidad en condensado',
    ],
    causes: [
      'Exceso de TDS, alcalinidad o sólidos suspendidos por falta de purga',
      'Contaminación con aceite, grasas o materia orgánica en retorno',
      'Picos bruscos de demanda de vapor (apertura rápida de válvulas)',
    ],
    actions: [
      'Abrir purga continua y realizar purgas de fondo alternadas hasta bajar TDS',
      'Revisar retornos de condensado por contaminación con aceites',
      'Verificar dosis de antiespumante si la carga térmica es alta',
    ],
  },
  {
    id: 'acid-condensate',
    title: 'Corrosión en Líneas de Condensado',
    severity: 'media',
    symptoms: [
      'pH del retorno de condensado menor a 7.5',
      'Rupturas o fugas en tuberías de retorno y trampas de vapor',
      'Alcalinidad M muy alta en caldera (descomposición de bicarbonatos en CO₂)',
    ],
    causes: [
      'Exceso de CO₂ arrastrado con el vapor por alta alcalinidad en reposición',
      'Falta de amina neutralizante o fímica en el sistema',
    ],
    actions: [
      'Medir pH en distintos puntos de retorno de condensado (meta: 8.0–8.8)',
      'Ajustar dosificación de amina neutralizante',
      'Evaluar desalkalinización si el agua de reposición tiene M > 150 ppm',
    ],
  },
];
