
import React from 'react';
import { SimulationResult } from '../types';

interface Props {
  currentData: SimulationResult | null;
  mqttStatus: string;
}

const MetricsDisplay: React.FC<Props> = ({ currentData, mqttStatus }) => {
  const isConnected = mqttStatus === 'Connected';
  const isStockout = currentData?.stockout === 1;

  const MetricCard = ({ label, value, colorClass = "text-white" }: { label: string, value: string | number, colorClass?: string }) => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          label="Current Stock" 
          value={currentData?.inventory_level ?? '--'} 
          colorClass={isStockout ? "text-red-500" : "text-blue-400"}
        />
        <MetricCard 
          label="Last Demand" 
          value={currentData?.demand ?? '--'} 
        />
        <MetricCard 
          label="Lead Time (Used)" 
          value={currentData ? `${currentData.lead_time_days} days` : '--'} 
        />
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">MQTT Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className={`text-sm font-bold ${isConnected ? 'text-green-500' : 'text-slate-500'}`}>{mqttStatus}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 overflow-hidden border border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">Last JSON Message</p>
          {currentData && (
             <span className="text-[10px] text-slate-600 font-mono">{currentData.timestamp}</span>
          )}
        </div>
        <pre className="text-blue-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
          {currentData ? JSON.stringify(currentData, null, 2) : '// No data sent yet...'}
        </pre>
      </div>
    </div>
  );
};

export default MetricsDisplay;
