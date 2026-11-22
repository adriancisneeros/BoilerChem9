import React, { useState } from 'react';
import { BookOpen, ShieldAlert, Table } from 'lucide-react';
import {
  ASME_PRESETS,
  PARAMETERS_9,
  PRESSURE_CLASS_LABELS,
  PressureClass,
  TROUBLESHOOTING_CASES,
} from '../data/standards';

export const GuideTab: React.FC = () => {
  const [pressureTab, setPressureTab] = useState<PressureClass>('low');

  const limits = ASME_PRESETS[pressureTab];

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2>Guía Técnica en Campo</h2>
          <p className="muted">Rangos de referencia ASME/ABMA y solución de fallas</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <Table size={18} />
          <span>Tabla de Límites por Presión</span>
        </div>

        <div className="segmented-scroll">
          {(['low', 'medium', 'high'] as PressureClass[]).map((pc) => (
            <button
              key={pc}
              type="button"
              className={pressureTab === pc ? 'seg-btn active' : 'seg-btn'}
              onClick={() => setPressureTab(pc)}
            >
              {PRESSURE_CLASS_LABELS[pc].title}
            </button>
          ))}
        </div>

        <p className="muted small" style={{ marginBottom: '0.75rem' }}>
          {PRESSURE_CLASS_LABELS[pressureTab].subtitle}
        </p>

        <div className="ref-table">
          {PARAMETERS_9.map((p) => {
            const r = limits[p.key];
            return (
              <div key={p.key} className="ref-row">
                <div>
                  <strong>
                    {p.index}. {p.shortName}
                  </strong>
                  <span className="muted small block">{p.description}</span>
                </div>
                <div className="ref-val">
                  <strong>
                    {r.min} – {r.max}
                  </strong>
                  <span className="muted small block">{p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '0.5rem' }}>
        <div className="card-title">
          <ShieldAlert size={18} />
          <span>Diagnóstico de Fallas Comunes</span>
        </div>
      </div>

      <div className="guide-list">
        {TROUBLESHOOTING_CASES.map((item) => (
          <div key={item.id} className="card">
            <div className="history-top">
              <strong>{item.title}</strong>
              <span
                className={`pill ${
                  item.severity === 'alta' ? 'pill-critical' : 'pill-warn'
                }`}
              >
                Prioridad {item.severity}
              </span>
            </div>

            <div className="guide-block">
              <span className="guide-label">Síntomas:</span>
              <ul>
                {item.symptoms.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="guide-block">
              <span className="guide-label">Causas probables:</span>
              <ul>
                {item.causes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="guide-block">
              <span className="guide-label">Qué hacer en campo:</span>
              <ul>
                {item.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">
          <BookOpen size={18} />
          <span>Regla Práctica de Muestreo</span>
        </div>
        <p className="muted small">
          Toma la muestra siempre con <strong>enfriador de muestras</strong> (20–30 °C)
          y deja purgar la línea 15–30 segundos antes de llenar el frasco. El vapor flash sin
          enfriar concentra las sales y altera el pH y el TDS real.
        </p>
      </div>
    </div>
  );
};
