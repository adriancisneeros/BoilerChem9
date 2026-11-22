import {
  ASME_PRESETS,
  AnalysisValues,
  BoilerConfig,
  PARAMETERS_9,
  ParamKey,
  ParamRange,
  PressureLimits,
} from '../data/standards';

export type EvalStatus = 'ok' | 'warn' | 'critical' | 'empty';

export interface ParamEvaluation {
  key: ParamKey;
  value: number | null;
  status: EvalStatus;
  direction: 'low' | 'high' | 'ok' | 'empty';
  range: ParamRange;
  message: string;
}

export interface FullEvaluation {
  params: Record<ParamKey, ParamEvaluation>;
  overallStatus: 'ok' | 'warn' | 'critical';
  ohAlkalinity: number | null;
  ohStatus: 'ok' | 'warn' | 'empty';
  findings: string[];
  filledCount: number;
}

export function getEffectiveLimits(boiler: BoilerConfig): PressureLimits {
  const base = ASME_PRESETS[boiler.pressureClass];
  if (!boiler.customLimits) return base;
  return {
    ...base,
    ...boiler.customLimits,
  };
}

export function evaluateParameter(
  key: ParamKey,
  rawValue: string,
  range: ParamRange
): ParamEvaluation {
  const def = PARAMETERS_9.find((p) => p.key === key)!;
  const trimmed = rawValue.trim();
  if (trimmed === '') {
    return {
      key,
      value: null,
      status: 'empty',
      direction: 'empty',
      range,
      message: '',
    };
  }

  const num = Number(trimmed);
  if (Number.isNaN(num)) {
    return {
      key,
      value: null,
      status: 'critical',
      direction: 'low',
      range,
      message: 'Valor numérico inválido.',
    };
  }

  if (num >= range.min && num <= range.max) {
    return {
      key,
      value: num,
      status: 'ok',
      direction: 'ok',
      range,
      message: 'Dentro de rango óptimo.',
    };
  }

  if (num < range.min) {
    const isCritical = range.warnLow !== undefined ? num < range.warnLow : true;
    return {
      key,
      value: num,
      status: isCritical ? 'critical' : 'warn',
      direction: 'low',
      range,
      message: def.lowAdvice,
    };
  }

  const isCritical = range.warnHigh !== undefined ? num > range.warnHigh : true;
  return {
    key,
    value: num,
    status: isCritical ? 'critical' : 'warn',
    direction: 'high',
    range,
    message: def.highAdvice,
  };
}

export function evaluateAll(
  values: AnalysisValues,
  boiler: BoilerConfig
): FullEvaluation {
  const limits = getEffectiveLimits(boiler);
  const params = {} as Record<ParamKey, ParamEvaluation>;
  const findings: string[] = [];

  let hasWarn = false;
  let hasCritical = false;
  let filledCount = 0;

  for (const def of PARAMETERS_9) {
    const ev = evaluateParameter(def.key, values[def.key], limits[def.key]);
    params[def.key] = ev;
    if (ev.status !== 'empty') filledCount++;
    if (ev.status === 'warn') hasWarn = true;
    if (ev.status === 'critical') hasCritical = true;
    if (ev.status === 'warn' || ev.status === 'critical') {
      findings.push(
        `${def.index}. ${def.shortName} (${ev.value} ${def.unit}): ${ev.message}`
      );
    }
  }

  // Alcalinidad OH- aproximada: 2P - M
  let ohAlkalinity: number | null = null;
  let ohStatus: 'ok' | 'warn' | 'empty' = 'empty';
  const pVal = params.pAlkalinity.value;
  const mVal = params.mAlkalinity.value;
  if (pVal !== null && mVal !== null) {
    ohAlkalinity = Math.round((2 * pVal - mVal) * 10) / 10;
    if (ohAlkalinity < 30 || ohAlkalinity > 300) {
      ohStatus = 'warn';
      if (ohAlkalinity < 30) {
        findings.push(
          `Alcalinidad OH⁻ estimada baja (${ohAlkalinity} ppm). Riesgo de precipitación adherente de calcio/magnesio.`
        );
      } else {
        findings.push(
          `Alcalinidad OH⁻ estimada alta (${ohAlkalinity} ppm). Vigilar fragilización cáustica y arrastre.`
        );
      }
    } else {
      ohStatus = 'ok';
    }
  }

  const overallStatus: 'ok' | 'warn' | 'critical' = hasCritical
    ? 'critical'
    : hasWarn || ohStatus === 'warn'
    ? 'warn'
    : 'ok';

  return {
    params,
    overallStatus,
    ohAlkalinity,
    ohStatus,
    findings,
    filledCount,
  };
}

export interface BlowdownResult {
  cycles: number;
  blowdownPct: number;
  blowdownKgH: number;
  makeupKgH: number;
  status: 'low_cycles' | 'optimal' | 'high_cycles';
  note: string;
}

export function calculateBlowdown(
  feedTracer: number,
  boilerTracer: number,
  steamKgH: number
): BlowdownResult | null {
  if (feedTracer <= 0 || boilerTracer <= feedTracer || steamKgH <= 0) {
    return null;
  }
  const cycles = boilerTracer / feedTracer;
  const blowdownPct = 100 / (cycles - 1);
  const blowdownKgH = steamKgH / (cycles - 1);
  const makeupKgH = steamKgH + blowdownKgH;

  let status: BlowdownResult['status'] = 'optimal';
  let note = 'Ciclos en rango eficiente (4–8× típico industrial).';
  if (cycles < 3.5) {
    status = 'low_cycles';
    note = 'Ciclos bajos: purga excesiva, se desperdicia agua, combustible y químicos.';
  } else if (cycles > 10) {
    status = 'high_cycles';
    note = 'Ciclos muy altos: vigilar TDS, sílice y riesgo de incrustación o arrastre.';
  }

  return {
    cycles,
    blowdownPct,
    blowdownKgH,
    makeupKgH,
    status,
    note,
  };
}

export interface LsiResult {
  pHs: number;
  lsi: number;
  rsi: number;
  interpretation: string;
  tone: 'ok' | 'warn' | 'critical';
}

/**
 * Índice de Saturación de Langelier (LSI) y Estabilidad de Ryznar (RSI)
 * para evaluar agua de reposición / pretratamiento.
 */
export function calculateLsiRsi(
  pH: number,
  tempC: number,
  tdsPpm: number,
  caHardnessPpm: number,
  mAlkPpm: number
): LsiResult | null {
  if (
    pH <= 0 ||
    tdsPpm <= 0 ||
    caHardnessPpm <= 0 ||
    mAlkPpm <= 0 ||
    tempC < 0
  ) {
    return null;
  }
  const A = (Math.log10(tdsPpm) - 1) / 10;
  const B = -13.12 * Math.log10(tempC + 273) + 34.55;
  const C = Math.log10(caHardnessPpm) - 0.4;
  const D = Math.log10(mAlkPpm);
  const pHs = 9.3 + A + B - (C + D);
  const lsi = pH - pHs;
  const rsi = 2 * pHs - pH;

  let interpretation = 'Agua equilibrada (sin tendencia marcada a incrustar ni corroer).';
  let tone: LsiResult['tone'] = 'ok';

  if (lsi > 0.5) {
    interpretation = 'Tendencia INCRUSTANTE (precipitación de CaCO₃). Revisar suavizador/antiincrustante.';
    tone = lsi > 1.2 ? 'critical' : 'warn';
  } else if (lsi < -0.5) {
    interpretation = 'Tendencia CORROSIVA (disuelve CaCO₃ y ataca acero). Ajustar pH/alcalinidad.';
    tone = lsi < -1.2 ? 'critical' : 'warn';
  }

  return {
    pHs,
    lsi,
    rsi,
    interpretation,
    tone,
  };
}
