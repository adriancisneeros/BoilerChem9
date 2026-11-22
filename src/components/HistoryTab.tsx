import React, { useMemo, useState } from 'react';
import { Download, Share2, Trash2, TrendingUp } from 'lucide-react';
import {
  AnalysisRecord,
  BoilerConfig,
  PARAMETERS_9,
  ParamKey,
} from '../data/standards';
import { exportRecordsToCsv, formatRecordForWhatsApp } from '../data/storage';
import { getEffectiveLimits } from '../utils/chemistry';

interface Props {
  boiler: BoilerConfig;
  records: AnalysisRecord[];
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<Props> = ({
  boiler,
  records,
  onDeleteRecord,
  onClearHistory,
}) => {
  const [selectedParam, setSelectedParam] = useState<ParamKey>('ph');
  const [filterBoiler, setFilterBoiler] = useState<'current' | 'all'>('current');

  const visibleRecords = useMemo(() => {
    const list =
      filterBoiler === 'current'
        ? records.filter((r) => r.boilerId === boiler.id)
        : records;
    return [...list].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [records, filterBoiler, boiler.id]);

  const chartPoints = useMemo(() => {
    const chrono = [...visibleRecords]
      .reverse()
      .map((r) => ({
        label: new Date(r.timestamp).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
        }),
        val: Number(r.values[selectedParam]),
      }))
      .filter((pt) => !Number.isNaN(pt.val) && pt.val !== 0);
    return chrono.slice(-12);
  }, [visibleRecords, selectedParam]);

  const limits = getEffectiveLimits(boiler)[selectedParam];
  const paramDef = PARAMETERS_9.find((p) => p.key === selectedParam)!;

  const handleDownloadCsv = () => {
    if (visibleRecords.length === 0) return;
    const csv = exportRecordsToCsv(visibleRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boilerchem9-historial-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareRecord = (r: AnalysisRecord) => {
    const text = formatRecordForWhatsApp(r);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2>Historial y Tendencias</h2>
          <p className="muted">{visibleRecords.length} registros guardados en el teléfono</p>
        </div>
        <div className="action-row-compact">
          <button
            type="button"
            className="btn-ghost"
            onClick={handleDownloadCsv}
            disabled={visibleRecords.length === 0}
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          {records.length > 0 && (
            <button
              type="button"
              className="btn-ghost danger-text"
              onClick={onClearHistory}
            >
              <Trash2 size={16} />
              <span>Vaciar</span>
            </button>
          )}
        </div>
      </div>

      <div className="segmented-scroll">
        <button
          type="button"
          className={filterBoiler === 'current' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setFilterBoiler('current')}
        >
          Solo {boiler.name}
        </button>
        <button
          type="button"
          className={filterBoiler === 'all' ? 'seg-btn active' : 'seg-btn'}
          onClick={() => setFilterBoiler('all')}
        >
          Todas las calderas
        </button>
      </div>

      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <TrendingUp size={18} />
            <span>Tendencia</span>
          </div>
          <select
            className="inline-select"
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as ParamKey)}
          >
            {PARAMETERS_9.map((p) => (
              <option key={p.key} value={p.key}>
                {p.index}. {p.shortName} ({p.unit})
              </option>
            ))}
          </select>
        </div>

        {chartPoints.length >= 2 ? (
          <TrendChart
            points={chartPoints}
            minLimit={limits.min}
            maxLimit={limits.max}
            unit={paramDef.unit}
          />
        ) : (
          <p className="muted small">
            Guarda al menos 2 análisis con {paramDef.shortName} para ver la gráfica de tendencia.
          </p>
        )}
      </div>

      {visibleRecords.length === 0 ? (
        <div className="card empty-state">
          <p>Aún no hay análisis guardados.</p>
          <p className="muted small">
            Captura los parámetros en la pestaña <strong>Análisis</strong> y toca{' '}
            <strong>Guardar Análisis</strong>.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {visibleRecords.map((rec) => {
            const dateStr = new Date(rec.timestamp).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            });
            return (
              <div key={rec.id} className="card history-item">
                <div className="history-top">
                  <div>
                    <strong>{rec.boilerName}</strong>
                    <span className="muted small block">
                      {dateStr} · {rec.operator}
                    </span>
                  </div>
                  <span className={`pill pill-${rec.overallStatus}`}>
                    {rec.overallStatus === 'ok'
                      ? 'ÓPTIMO'
                      : rec.overallStatus === 'warn'
                      ? 'PRECAUCIÓN'
                      : 'CRÍTICO'}
                  </span>
                </div>

                <div className="history-chips">
                  {PARAMETERS_9.map((p) => {
                    const v = rec.values[p.key];
                    if (!v) return null;
                    return (
                      <span key={p.key} className="mini-chip">
                        {p.shortName}: <strong>{v}</strong>
                      </span>
                    );
                  })}
                </div>

                {rec.notes && <p className="muted small">📝 {rec.notes}</p>}

                <div className="history-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleShareRecord(rec)}
                  >
                    <Share2 size={15} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className="btn-ghost danger-text"
                    onClick={() => onDeleteRecord(rec.id)}
                  >
                    <Trash2 size={15} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TrendChart: React.FC<{
  points: { label: string; val: number }[];
  minLimit: number;
  maxLimit: number;
  unit: string;
}> = ({ points, minLimit, maxLimit, unit }) => {
  const width = 320;
  const height = 140;
  const padX = 28;
  const padY = 18;

  const allVals = [...points.map((p) => p.val), minLimit, maxLimit];
  const minY = Math.min(...allVals) * 0.92;
  const maxY = Math.max(...allVals) * 1.08 || 1;
  const spanY = maxY - minY || 1;

  const toX = (i: number) =>
    padX + (i / Math.max(1, points.length - 1)) * (width - padX * 2);
  const toY = (v: number) =>
    height - padY - ((v - minY) / spanY) * (height - padY * 2);

  const polyline = points.map((p, i) => `${toX(i)},${toY(p.val)}`).join(' ');
  const yMaxLine = toY(maxLimit);
  const yMinLine = toY(minLimit);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg">
        <rect
          x={padX}
          y={Math.min(yMaxLine, yMinLine)}
          width={width - padX * 2}
          height={Math.abs(yMinLine - yMaxLine)}
          fill="rgba(34, 197, 94, 0.12)"
        />
        <line
          x1={padX}
          x2={width - padX}
          y1={yMaxLine}
          y2={yMaxLine}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <line
          x1={padX}
          x2={width - padX}
          y1={yMinLine}
          y2={yMinLine}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(p.val)} r="4" fill="#38bdf8" />
            <text
              x={toX(i)}
              y={height - 3}
              textAnchor="middle"
              fontSize="8"
              fill="#94a3b8"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="chart-legend muted small">
        <span>Zona verde: {minLimit}–{maxLimit} {unit}</span>
        <span>Último: {points[points.length - 1].val} {unit}</span>
      </div>
    </div>
  );
};
