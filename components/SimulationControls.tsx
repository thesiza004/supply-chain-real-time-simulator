
import React from 'react';
import { SimulationParams } from '../types';

interface Props {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

const SimulationControls: React.FC<Props> = ({ params, setParams, isRunning, onStart, onStop }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams({
      ...params,
      [name]: Number(value)
    });
  };

  const InputField = ({ label, name, value }: { label: string, name: string, value: number }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={handleChange}
        disabled={isRunning}
        className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800"
      />
    </div>
  );

  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-full">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Configuration
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Initial Stock" name="initialStock" value={params.initialStock} />
        <InputField label="Reorder Point" name="reorderPoint" value={params.reorderPoint} />
        <InputField label="Reorder Quantity" name="reorderQuantity" value={params.reorderQuantity} />
        <InputField label="Demand Min" name="demandMin" value={params.demandMin} />
        <InputField label="Demand Max" name="demandMax" value={params.demandMax} />
        <InputField label="Lead Time Min" name="leadTimeMin" value={params.leadTimeMin} />
        <InputField label="Lead Time Max" name="leadTimeMax" value={params.leadTimeMax} />
        <InputField label="Interval (sec)" name="simulationInterval" value={params.simulationInterval} />
      </div>

      <div className="mt-8 flex gap-3">
        {!isRunning ? (
          <button
            onClick={onStart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start Simulation
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop Simulation
          </button>
        )}
      </div>
    </div>
  );
};

export default SimulationControls;
