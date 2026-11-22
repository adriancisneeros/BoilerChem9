import React, { useState } from 'react';
import { Flame, Plus, Smartphone, Trash2 } from 'lucide-react';
import {
  BoilerConfig,
  PRESSURE_CLASS_LABELS,
  PressureClass,
} from '../data/standards';

interface Props {
  boilers: BoilerConfig[];
  selectedBoilerId: string;
  onSelectBoiler: (id: string) => void;
  onSaveBoilers: (next: BoilerConfig[]) => void;
  canInstallPwa: boolean;
  onTriggerInstall: () => void;
}

export const SettingsTab: React.FC<Props> = ({
  boilers,
  selectedBoilerId,
  onSelectBoiler,
  onSaveBoilers,
  canInstallPwa,
  onTriggerInstall,
}) => {
  const [name, setName] = useState('');
  const [pressureClass, setPressureClass] = useState<PressureClass>('low');
  const [operatingPsi, setOperatingPsi] = useState('150');
  const [steamCapacityKgH, setSteamCapacityKgH] = useState('4000');
  const [waterVolumeL, setWaterVolumeL] = useState('6000');

  const handleAddBoiler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newBoiler: BoilerConfig = {
      id: `caldera-${Date.now()}`,
      name: name.trim(),
      pressureClass,
      operatingPsi: Number(operatingPsi) || 150,
      steamCapacityKgH: Number(steamCapacityKgH) || 4000,
      waterVolumeL: Number(waterVolumeL) || 6000,
    };
    const next = [...boilers, newBoiler];
    onSaveBoilers(next);
    onSelectBoiler(newBoiler.id);
    setName('');
  };

  const handleDeleteBoiler = (id: string) => {
    if (boilers.length <= 1) return;
    const next = boilers.filter((b) => b.id !== id);
    onSaveBoilers(next);
    if (selectedBoilerId === id) {
      onSelectBoiler(next[0].id);
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2>Calderas y Celular</h2>
          <p className="muted">Configura tus equipos y guarda la app en tu Oppo</p>
        </div>
      </div>

      <div className="card install-card">
        <div className="card-title">
          <Smartphone size={18} />
          <span>Instalar en Celular Oppo (Android)</span>
        </div>
        <p className="muted small">
          BoilerChem9 funciona como app instalada sin internet en cuarto de calderas.
        </p>
        {canInstallPwa ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onTriggerInstall}
            style={{ marginTop: '0.6rem' }}
          >
            <Smartphone size={18} />
            <span>Instalar BoilerChem9 en este teléfono</span>
          </button>
        ) : (
          <ol className="install-steps muted small">
            <li>Abre esta página en <strong>Google Chrome</strong> en tu Oppo.</li>
            <li>Toca el menú <strong>⋮</strong> (arriba a la derecha).</li>
            <li>
              Elige <strong>“Instalar aplicación”</strong> o{' '}
              <strong>“Agregar a la pantalla principal”</strong>.
            </li>
          </ol>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          <Flame size={18} />
          <span>Calderas Registradas</span>
        </div>
        <div className="boiler-list">
          {boilers.map((b) => (
            <div
              key={b.id}
              className={
                b.id === selectedBoilerId
                  ? 'boiler-item active'
                  : 'boiler-item'
              }
              onClick={() => onSelectBoiler(b.id)}
            >
              <div>
                <strong>{b.name}</strong>
                <span className="muted small block">
                  {PRESSURE_CLASS_LABELS[b.pressureClass].title} · {b.operatingPsi} psi ·{' '}
                  {b.steamCapacityKgH} kg/h · {b.waterVolumeL} L
                </span>
              </div>
              {boilers.length > 1 && (
                <button
                  type="button"
                  className="btn-icon danger-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBoiler(b.id);
                  }}
                  title="Eliminar caldera"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <form className="card" onSubmit={handleAddBoiler}>
        <div className="card-title">
          <Plus size={18} />
          <span>Agregar Nueva Caldera</span>
        </div>
        <div className="form-grid-2">
          <div className="field full-span">
            <label>Nombre / Tag del Equipo</label>
            <input
              type="text"
              placeholder="Ej. Caldera Cleaver Brooks #3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field full-span">
            <label>Rango de Presión (ASME)</label>
            <select
              value={pressureClass}
              onChange={(e) => setPressureClass(e.target.value as PressureClass)}
            >
              <option value="low">Baja Presión (0 – 300 psi)</option>
              <option value="medium">Media Presión (301 – 600 psi)</option>
              <option value="high">Alta Presión (601+ psi)</option>
            </select>
          </div>
          <div className="field">
            <label>Presión Operación (psi)</label>
            <input
              type="number"
              inputMode="decimal"
              value={operatingPsi}
              onChange={(e) => setOperatingPsi(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Capacidad Vapor (kg/h)</label>
            <input
              type="number"
              inputMode="decimal"
              value={steamCapacityKgH}
              onChange={(e) => setSteamCapacityKgH(e.target.value)}
            />
          </div>
          <div className="field full-span">
            <label>Volumen de Agua (Litros)</label>
            <input
              type="number"
              inputMode="decimal"
              value={waterVolumeL}
              onChange={(e) => setWaterVolumeL(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '0.75rem', width: '100%' }}
        >
          <Plus size={18} />
          <span>Guardar Caldera</span>
        </button>
      </form>
    </div>
  );
};
