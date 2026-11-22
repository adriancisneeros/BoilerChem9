import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Calculator, Droplets, Gauge, Beaker } from 'lucide-react';
import { BoilerConfig } from '../data/standards';
import { calculateBlowdown, calculateLsiRsi } from '../utils/chemistry';

interface Props {
  boiler: BoilerConfig;
}

type CalcMode = 'blowdown' | 'dosing' | 'lsi' | 'units';

export const CalculatorsTab: React.FC<Props> = ({ boiler }) => {
  const [mode, setMode] = useState<CalcMode>('blowdown');

  // Blowdown / Cycles state
  const [feedTracer, setFeedTracer] = useState('25');
  const [boilerTracer, setBoilerTracer] = useState('150');
  const [steamKgH, setSteamKgH] = useState(String(boiler.steamCapacityKgH));

  // Dosing state
  const [tankVolumeL, setTankVolumeL] = useState(String(boiler.waterVolumeL));
  const [currentPpm, setCurrentPpm] = useState('12');
  const [targetPpm, setTargetPpm] = useState('40');
  const [purityPct, setPurityPct] = useState('98');
  const [chemType, setChemType] = useState<'sulfite' | 'phosphate' | 'naoh'>('sulfite');

  // LSI state
  const [lsiPh, setLsiPh] = useState('7.6');
  const [lsiTemp, setLsiTemp] = useState('25');
  const [lsiTds, setLsiTds] = useState('320');
  const [lsiCa, setLsiCa] = useState('80');
  const [lsiAlk, setLsiAlk] = useState('110');

  // Units converter state
  const [convValue, setConvValue] = useState('150');
  const [convType, setConvType] = useState<
    'cond_tds' | 'psi_bar' | 'c_f' | 'gpg_ppm' | 'm3_gpm'
  >('cond_tds');

  const blowdownRes = useMemo(
    () =>
      calculateBlowdown(
        Number(feedTracer),
        Number(boilerTracer),
        Number(steamKgH)
      ),
    [feedTracer, boilerTracer, steamKgH]
  );

  const dosingGrams = useMemo(() => {
    const vol = Number(tankVolumeL);
    const curr = Number(currentPpm);
    const targ = Number(targetPpm);
    const pur = Number(purityPct);
    if (vol <= 0 || targ <= curr || pur <= 0) return null;
    const deltaPpm = targ - curr; // mg/L
    // 1 mg/L * L = mg -> / 1000 = g
    const activeGrams = (deltaPpm * vol) / 1000;
    const productGrams = activeGrams / (pur / 100);
    return {
      deltaPpm,
      activeGrams,
      productGrams,
      productKg: productGrams / 1000,
    };
  }, [tankVolumeL, currentPpm, targetPpm, purityPct]);

  const lsiRes = useMemo(
    () =>
      calculateLsiRsi(
        Number(lsiPh),
        Number(lsiTemp),
        Number(lsiTds),
        Number(lsiCa),
        Number(lsiAlk)
      ),
    [lsiPh, lsiTemp, lsiTds, lsiCa, lsiAlk]
  );

  const unitResult = useMemo(() => {
    const v = Number(convValue);
    if (Number.isNaN(v)) return null;
    switch (convType) {
      case 'cond_tds':
        return {
          a: `${v} µS/cm ≈ ${(v * 0.67).toFixed(1)} ppm TDS`,
          b: `${v} ppm TDS ≈ ${(v / 0.67).toFixed(1)} µS/cm`,
        };
      case 'psi_bar':
        return {
          a: `${v} psi = ${(v * 0.0689476).toFixed(2)} bar (${(v * 0.070307).toFixed(2)} kg/cm²)`,
          b: `${v} bar = ${(v * 14.5038).toFixed(1)} psi`,
        };
      case 'c_f':
        return {
          a: `${v} °C = ${((v * 9) / 5 + 32).toFixed(1)} °F`,
          b: `${v} °F = ${(((v - 32) * 5) / 9).toFixed(1)} °C`,
        };
      case 'gpg_ppm':
        return {
          a: `${v} gpg = ${(v * 17.118).toFixed(1)} ppm CaCO₃`,
          b: `${v} ppm CaCO₃ = ${(v / 17.118).toFixed(2)} gpg`,
        };
      case 'm3_gpm':
        return {
          a: `${v} m³/h = ${(v * 4.40287).toFixed(2)} GPM (${(v * 16.6667).toFixed(1)} L/min)`,
          b: `${v} GPM = ${(v / 4.40287).toFixed(2)} m³/h`,
        };
    }
  }, [convValue, convType]);

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2>Calculadoras de Campo</h2>
          <p className="muted">Cálculos rápidos listos para operar junto a la caldera</p>
        </div>
      </div>

      <div className="segmented-scroll">
        <button
          type="button"
          className={mode === 'blowdown' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setMode('blowdown')}
        >
          <Gauge size={16} />
          <span>Ciclos y Purga</span>
        </button>
        <button
          type="button"
          className={mode === 'dosing' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setMode('dosing')}
        >
          <Beaker size={16} />
          <span>Dosificación</span>
        </button>
        <button
          type="button"
          className={mode === 'lsi' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setMode('lsi')}
        >
          <Droplets size={16} />
          <span>LSI / Ryznar</span>
        </button>
        <button
          type="button"
          className={mode === 'units' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setMode('units')}
        >
          <ArrowLeftRight size={16} />
          <span>Unidades</span>
        </button>
      </div>

      {mode === 'blowdown' && (
        <div className="card">
          <div className="card-title">
            <Calculator size={18} />
            <span>Ciclos de Concentración y % de Purga</span>
          </div>
          <p className="muted small">
            Usa el mismo ión trazador (Cloruros o Conductividad) en agua de alimentación y caldera.
          </p>
          <div className="form-grid-2">
            <div className="field">
              <label>Trazador Alimentación (ppm o µS)</label>
              <input
                type="number"
                inputMode="decimal"
                value={feedTracer}
                onChange={(e) => setFeedTracer(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Trazador Caldera (ppm o µS)</label>
              <input
                type="number"
                inputMode="decimal"
                value={boilerTracer}
                onChange={(e) => setBoilerTracer(e.target.value)}
              />
            </div>
            <div className="field full-span">
              <label>Generación de Vapor (kg/h)</label>
              <input
                type="number"
                inputMode="decimal"
                value={steamKgH}
                onChange={(e) => setSteamKgH(e.target.value)}
              />
            </div>
          </div>

          {blowdownRes ? (
            <div className="result-box">
              <div className="result-kpis">
                <div className="kpi">
                  <span className="kpi-label">Ciclos (CoC)</span>
                  <strong className="kpi-val">{blowdownRes.cycles.toFixed(1)}×</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">% Purga</span>
                  <strong className="kpi-val">{blowdownRes.blowdownPct.toFixed(1)}%</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Purga</span>
                  <strong className="kpi-val">{Math.round(blowdownRes.blowdownKgH)} kg/h</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Reposición</span>
                  <strong className="kpi-val">{Math.round(blowdownRes.makeupKgH)} kg/h</strong>
                </div>
              </div>
              <p className="result-note">{blowdownRes.note}</p>
            </div>
          ) : (
            <p className="muted small">
              Ingresa valores válidos (el trazador de caldera debe ser mayor al de alimentación).
            </p>
          )}
        </div>
      )}

      {mode === 'dosing' && (
        <div className="card">
          <div className="card-title">
            <Beaker size={18} />
            <span>Dosificación Directa por Volumen</span>
          </div>
          <div className="form-grid-2">
            <div className="field full-span">
              <label>Producto Químico</label>
              <select
                value={chemType}
                onChange={(e) =>
                  setChemType(e.target.value as 'sulfite' | 'phosphate' | 'naoh')
                }
              >
                <option value="sulfite">Sulfito de Sodio (Na₂SO₃)</option>
                <option value="phosphate">Fosfato Trisódico / Polifosfato</option>
                <option value="naoh">Sosa Cáustica / Alcalinizante</option>
              </select>
            </div>
            <div className="field">
              <label>Volumen de Agua (Litros)</label>
              <input
                type="number"
                inputMode="decimal"
                value={tankVolumeL}
                onChange={(e) => setTankVolumeL(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Pureza / Concentración (%)</label>
              <input
                type="number"
                inputMode="decimal"
                value={purityPct}
                onChange={(e) => setPurityPct(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Lectura Actual (ppm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={currentPpm}
                onChange={(e) => setCurrentPpm(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Meta Deseada (ppm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={targetPpm}
                onChange={(e) => setTargetPpm(e.target.value)}
              />
            </div>
          </div>

          {dosingGrams ? (
            <div className="result-box">
              <div className="result-kpis">
                <div className="kpi">
                  <span className="kpi-label">A subir</span>
                  <strong className="kpi-val">+{dosingGrams.deltaPpm.toFixed(1)} ppm</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">Producto a agregar</span>
                  <strong className="kpi-val">{dosingGrams.productGrams.toFixed(0)} g</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">En kilogramos</span>
                  <strong className="kpi-val">{dosingGrams.productKg.toFixed(2)} kg</strong>
                </div>
              </div>
              <p className="result-note">
                {chemType === 'sulfite'
                  ? 'Nota: ~8 ppm de Na₂SO₃ reaccionan con cada 1 ppm de O₂ disuelto; si el desaireador está frío, considera demanda extra.'
                  : 'Dosifica de forma gradual en tanque de alimentación o bomba dosificadora y vuelve a medir tras homogeneizar.'}
              </p>
            </div>
          ) : (
            <p className="muted small">
              La meta debe ser mayor a la lectura actual y el volumen positivo.
            </p>
          )}
        </div>
      )}

      {mode === 'lsi' && (
        <div className="card">
          <div className="card-title">
            <Droplets size={18} />
            <span>Índices Langelier (LSI) y Ryznar (RSI)</span>
          </div>
          <p className="muted small">
            Evalúa tendencia incrustante o corrosiva del agua de reposición / pretratamiento.
          </p>
          <div className="form-grid-2">
            <div className="field">
              <label>pH del Agua</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={lsiPh}
                onChange={(e) => setLsiPh(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Temperatura (°C)</label>
              <input
                type="number"
                inputMode="decimal"
                value={lsiTemp}
                onChange={(e) => setLsiTemp(e.target.value)}
              />
            </div>
            <div className="field">
              <label>TDS (ppm)</label>
              <input
                type="number"
                inputMode="decimal"
                value={lsiTds}
                onChange={(e) => setLsiTds(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Dureza Cálcica (ppm CaCO₃)</label>
              <input
                type="number"
                inputMode="decimal"
                value={lsiCa}
                onChange={(e) => setLsiCa(e.target.value)}
              />
            </div>
            <div className="field full-span">
              <label>Alcalinidad M (ppm CaCO₃)</label>
              <input
                type="number"
                inputMode="decimal"
                value={lsiAlk}
                onChange={(e) => setLsiAlk(e.target.value)}
              />
            </div>
          </div>

          {lsiRes && (
            <div className={`result-box tone-${lsiRes.tone}`}>
              <div className="result-kpis">
                <div className="kpi">
                  <span className="kpi-label">pHs</span>
                  <strong className="kpi-val">{lsiRes.pHs.toFixed(2)}</strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">LSI</span>
                  <strong className="kpi-val">
                    {lsiRes.lsi >= 0 ? '+' : ''}
                    {lsiRes.lsi.toFixed(2)}
                  </strong>
                </div>
                <div className="kpi">
                  <span className="kpi-label">RSI</span>
                  <strong className="kpi-val">{lsiRes.rsi.toFixed(2)}</strong>
                </div>
              </div>
              <p className="result-note">{lsiRes.interpretation}</p>
            </div>
          )}
        </div>
      )}

      {mode === 'units' && (
        <div className="card">
          <div className="card-title">
            <ArrowLeftRight size={18} />
            <span>Conversor Rápido de Unidades</span>
          </div>
          <div className="form-grid-2">
            <div className="field full-span">
              <label>Conversión</label>
              <select
                value={convType}
                onChange={(e) =>
                  setConvType(e.target.value as typeof convType)
                }
              >
                <option value="cond_tds">Conductividad (µS/cm) ↔ TDS (ppm)</option>
                <option value="psi_bar">Presión (psi ↔ bar ↔ kg/cm²)</option>
                <option value="c_f">Temperatura (°C ↔ °F)</option>
                <option value="gpg_ppm">Dureza (granos/gal ↔ ppm CaCO₃)</option>
                <option value="m3_gpm">Flujo (m³/h ↔ GPM ↔ L/min)</option>
              </select>
            </div>
            <div className="field full-span">
              <label>Valor a convertir</label>
              <input
                type="number"
                inputMode="decimal"
                value={convValue}
                onChange={(e) => setConvValue(e.target.value)}
              />
            </div>
          </div>

          {unitResult && (
            <div className="result-box">
              <p className="conv-line">{unitResult.a}</p>
              <p className="conv-line">{unitResult.b}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
