import {
  AnalysisRecord,
  AnalysisValues,
  BoilerConfig,
  PARAMETERS_9,
} from '../data/standards';

const BOILERS_KEY = 'boilerchem9_boilers_v1';
const RECORDS_KEY = 'boilerchem9_records_v1';
const SELECTED_BOILER_KEY = 'boilerchem9_selected_boiler_v1';

export const EMPTY_VALUES: AnalysisValues = {
  ph: '',
  pAlkalinity: '',
  mAlkalinity: '',
  hardness: '',
  tds: '',
  sulfite: '',
  phosphate: '',
  silica: '',
  chlorides: '',
};

export const DEFAULT_BOILERS: BoilerConfig[] = [
  {
    id: 'caldera-1',
    name: 'Caldera 1 (Principal)',
    pressureClass: 'low',
    operatingPsi: 150,
    steamCapacityKgH: 5000,
    waterVolumeL: 8500,
  },
  {
    id: 'caldera-2',
    name: 'Caldera 2 (Respaldo)',
    pressureClass: 'low',
    operatingPsi: 125,
    steamCapacityKgH: 3000,
    waterVolumeL: 5200,
  },
];

export function loadBoilers(): BoilerConfig[] {
  try {
    const raw = localStorage.getItem(BOILERS_KEY);
    if (!raw) return DEFAULT_BOILERS;
    const parsed = JSON.parse(raw) as BoilerConfig[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BOILERS;
  } catch {
    return DEFAULT_BOILERS;
  }
}

export function saveBoilers(boilers: BoilerConfig[]): void {
  localStorage.setItem(BOILERS_KEY, JSON.stringify(boilers));
}

export function loadSelectedBoilerId(boilers: BoilerConfig[]): string {
  const saved = localStorage.getItem(SELECTED_BOILER_KEY);
  if (saved && boilers.some((b) => b.id === saved)) return saved;
  return boilers[0].id;
}

export function saveSelectedBoilerId(id: string): void {
  localStorage.setItem(SELECTED_BOILER_KEY, id);
}

export function loadRecords(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: AnalysisRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function formatRecordForWhatsApp(record: AnalysisRecord): string {
  const dateStr = new Date(record.timestamp).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const statusLabel =
    record.overallStatus === 'ok'
      ? '✅ ÓPTIMO'
      : record.overallStatus === 'warn'
      ? '⚠️ PRECAUCIÓN'
      : '🔴 CRÍTICO';

  const lines = [
    `*BoilerChem9 — Reporte de Caldera*`,
    `🏭 *Equipo:* ${record.boilerName}`,
    `📅 *Fecha:* ${dateStr}`,
    `👷 *Operador:* ${record.operator || 'Campo'}`,
    `📊 *Estado:* ${statusLabel}`,
    ``,
    `*9 Parámetros:*`,
  ];

  for (const p of PARAMETERS_9) {
    const val = record.values[p.key];
    if (val !== '') {
      lines.push(`• ${p.shortName}: ${val} ${p.unit}`);
    }
  }

  if (record.notes.trim()) {
    lines.push(``, `📝 *Notas:* ${record.notes.trim()}`);
  }

  return lines.join('\n');
}

export function exportRecordsToCsv(records: AnalysisRecord[]): string {
  const headers = [
    'Fecha',
    'Caldera',
    'Operador',
    'Estado',
    ...PARAMETERS_9.map((p) => `${p.shortName} (${p.unit})`),
    'Notas',
  ];

  const rows = records.map((r) => [
    new Date(r.timestamp).toLocaleString('es-MX'),
    r.boilerName,
    r.operator,
    r.overallStatus,
    ...PARAMETERS_9.map((p) => r.values[p.key] || ''),
    r.notes.replace(/"/g, '""'),
  ]);

  const csvLines = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}
