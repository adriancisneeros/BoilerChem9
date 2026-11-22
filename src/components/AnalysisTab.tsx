import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eraser,
  FlaskConical,
  Share2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  AnalysisRecord,
  AnalysisValues,
  BoilerConfig,
  PARAMETERS_9,
  ParamKey,
} from '../data/standards';
import { EMPTY_VALUES, formatRecordForWhatsApp } from '../data/storage';
import { evaluateAll } from '../utils/chemistry';

interface Props {
  boiler: BoilerConfig;
  values: AnalysisValues;
  onChangeValues: (next: AnalysisValues) => void;
  onSaveRecord: (record: AnalysisRecord) => void;
}

export const AnalysisTab: React.FC<Props> = ({
  boiler,
  values,
  onChangeValues,
  onSaveRecord,
}) => {
  const [operator, setOperator] = useState('Bolaños');
  const [notes, setNotes] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  const evaluation = useMemo(
    () => evaluateAll(values, boiler),
    [values, boiler]
  );

  const handleFieldChange = (key: ParamKey, val: string) => {
    onChangeValues({ ...values, [key]: val });
  };

  const handleLoadSample = () => {
    onChangeValues({
      ph: '11.1',
      pAlkalinity: '280',
      mAlkalinity: '410',
      hardness: '0.5',
      tds: '2150',
      sulfite: '38',
      phosphate: '32',
      silica: '65',
      chlorides: '180',
    });
  };

  const handleClear = () => {
    onChangeValues(EMPTY_VALUES);
    setNotes('');
  };

  const buildRecord = (): AnalysisRecord => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    boilerId: boiler.id,
    boilerName: boiler.name,
    timestamp: new Date().toISOString(),
    operator: operator.trim() || 'Campo',
    notes: notes.trim(),
    values: { ...values },
    overallStatus: evaluation.overallStatus,
  });

  const handleSave = () => {
    if (evaluation.filledCount === 0) return;
    onSaveRecord(buildRecord());
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (evaluation.filledCount === 0) return;
    const text = formatRecordForWhatsApp(buildRecord());
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const statusConfig = {
    ok: {
      label: 'Química en Rango Óptimo',
      icon: <CheckCircle2 size={20} />,
      cls: 'banner-ok',
    },
    warn: {
      label: 'Precaución — Revisar Ajustes',
      icon: <AlertTriangle size={20} />,
      cls: 'banner-warn',
    },
    critical: {
      label: 'Alerta Crítica — Acción Requerida',
      icon: <XCircle size={20} />,
      cls: 'banner-critical',
    },
  }[evaluation.overallStatus];

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2>Los 9 Parámetros</h2>
          <p className="muted">
            Toca cada campo para ingresar lectura ({evaluation.filledCount}/9 capturados)
          </p>
        </div>
        <div className="action-row-compact">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleLoadSample}
            title="Cargar ejemplo"
          >
            <Sparkles size={16} />
            <span>Ejemplo</span>
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleClear}
            title="Limpiar campos"
          >
            <Eraser size={16} />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {evaluation.filledCount > 0 && (
        <div className={`status-banner ${statusConfig.cls}`}>
          <div className="status-banner-title">
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </div>
          {evaluation.ohAlkalinity !== null && (
            <div className="oh-pill">
              Alc. OH⁻ (2P−M): <strong>{evaluation.ohAlkalinity} ppm</strong>
            </div>
          )}
        </div>
      )}

      <div className="params-grid">
        {PARAMETERS_9.map((param) => {
          const ev = evaluation.params[param.key];
          const cardClass =
            ev.status === 'ok'
              ? 'param-card card-ok'
              : ev.status === 'warn'
              ? 'param-card card-warn'
              : ev.status === 'critical'
              ? 'param-card card-critical'
              : 'param-card';

          return (
            <div key={param.key} className={cardClass}>
              <div className="param-top">
                <span className="param-badge">#{param.index}</span>
                <label htmlFor={`param-${param.key}`} className="param-name">
                  {param.shortName}
                </label>
                <span className="param-unit">{param.unit}</span>
              </div>

              <div className="param-input-wrap">
                <input
                  id={`param-${param.key}`}
                  type="number"
                  inputMode="decimal"
                  step={param.step}
                  placeholder="—"
                  value={values[param.key]}
                  onChange={(e) => handleFieldChange(param.key, e.target.value)}
                  className="param-input"
                />
              </div>

              <div className="param-meta">
                <span>
                  Meta: {ev.range.min} – {ev.range.max}
                </span>
                {ev.status !== 'empty' && (
                  <span className={`pill pill-${ev.status}`}>
                    {ev.status === 'ok'
                      ? 'OK'
                      : ev.direction === 'low'
                      ? 'BAJO'
                      : 'ALTO'}
                  </span>
                )}
              </div>

              {(ev.status === 'warn' || ev.status === 'critical') && (
                <p className="param-advice">{ev.message}</p>
              )}
            </div>
          );
        })}
      </div>

      {evaluation.findings.length > 0 && (
        <div className="card diagnosis-card">
          <div className="card-title">
            <FlaskConical size={18} />
            <span>Diagnóstico y Acciones Recomendadas</span>
          </div>
          <ul className="findings-list">
            {evaluation.findings.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="form-row">
          <div className="field">
            <label htmlFor="operator-input">Operador / Técnico</label>
            <input
              id="operator-input"
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="Ej. Bolaños"
            />
          </div>
          <div className="field">
            <label htmlFor="notes-input">Notas de turno (opcional)</label>
            <input
              id="notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Se purgó fondo 5 seg, bomba sulfito al 60%"
            />
          </div>
        </div>

        <div className="save-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={evaluation.filledCount === 0}
            onClick={handleSave}
          >
            <ClipboardCheck size={18} />
            <span>{savedToast ? '¡Guardado en Historial!' : 'Guardar Análisis'}</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={evaluation.filledCount === 0}
            onClick={handleShareWhatsApp}
          >
            <Share2 size={18} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
