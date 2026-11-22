import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calculator,
  ClipboardList,
  Droplet,
  History,
  Settings,
} from 'lucide-react';
import { AnalysisTab } from './components/AnalysisTab';
import { CalculatorsTab } from './components/CalculatorsTab';
import { GuideTab } from './components/GuideTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { AnalysisRecord, AnalysisValues, BoilerConfig } from './data/standards';
import {
  EMPTY_VALUES,
  loadBoilers,
  loadRecords,
  loadSelectedBoilerId,
  saveBoilers,
  saveRecords,
  saveSelectedBoilerId,
} from './data/storage';

type TabId = 'analysis' | 'calc' | 'history' | 'guide' | 'settings';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('analysis');
  const [boilers, setBoilers] = useState<BoilerConfig[]>(() => loadBoilers());
  const [selectedBoilerId, setSelectedBoilerId] = useState<string>(() =>
    loadSelectedBoilerId(loadBoilers())
  );
  const [values, setValues] = useState<AnalysisValues>(EMPTY_VALUES);
  const [records, setRecords] = useState<AnalysisRecord[]>(() => loadRecords());
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const currentBoiler =
    boilers.find((b) => b.id === selectedBoilerId) || boilers[0];

  const handleSelectBoiler = (id: string) => {
    setSelectedBoilerId(id);
    saveSelectedBoilerId(id);
  };

  const handleSaveBoilers = (next: BoilerConfig[]) => {
    setBoilers(next);
    saveBoilers(next);
  };

  const handleSaveRecord = (rec: AnalysisRecord) => {
    const next = [rec, ...records];
    setRecords(next);
    saveRecords(next);
  };

  const handleDeleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id);
    setRecords(next);
    saveRecords(next);
  };

  const handleClearHistory = () => {
    setRecords([]);
    saveRecords([]);
  };

  const handleTriggerInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Droplet size={20} />
          </div>
          <div>
            <h1>BoilerChem9</h1>
            <span className="brand-sub">Química de Calderas · Offline</span>
          </div>
        </div>

        <select
          aria-label="Seleccionar caldera"
          className="boiler-select"
          value={currentBoiler.id}
          onChange={(e) => handleSelectBoiler(e.target.value)}
        >
          {boilers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.operatingPsi} psi)
            </option>
          ))}
        </select>
      </header>

      <main className="app-main">
        {activeTab === 'analysis' && (
          <AnalysisTab
            boiler={currentBoiler}
            values={values}
            onChangeValues={setValues}
            onSaveRecord={handleSaveRecord}
          />
        )}
        {activeTab === 'calc' && <CalculatorsTab boiler={currentBoiler} />}
        {activeTab === 'history' && (
          <HistoryTab
            boiler={currentBoiler}
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onClearHistory={handleClearHistory}
          />
        )}
        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            boilers={boilers}
            selectedBoilerId={currentBoiler.id}
            onSelectBoiler={handleSelectBoiler}
            onSaveBoilers={handleSaveBoilers}
            canInstallPwa={Boolean(installPrompt)}
            onTriggerInstall={handleTriggerInstall}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navegación principal">
        <button
          type="button"
          className={activeTab === 'analysis' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('analysis')}
        >
          <ClipboardList size={20} />
          <span>Análisis</span>
        </button>
        <button
          type="button"
          className={activeTab === 'calc' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('calc')}
        >
          <Calculator size={20} />
          <span>Cálculos</span>
        </button>
        <button
          type="button"
          className={activeTab === 'history' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('history')}
        >
          <History size={20} />
          <span>Historial</span>
        </button>
        <button
          type="button"
          className={activeTab === 'guide' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('guide')}
        >
          <BookOpen size={20} />
          <span>Guía</span>
        </button>
        <button
          type="button"
          className={activeTab === 'settings' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span>Equipos</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
