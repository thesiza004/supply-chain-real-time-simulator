
import React from 'react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SimulationResult } from '../types';

interface Props {
  history: SimulationResult[];
}

const StockChart: React.FC<Props> = ({ history }) => {
  // Map history to simple format for recharts
  const chartData = history.slice(-20).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    inventory: d.inventory_level,
    reorder: d.reorder_quantity > 0 ? d.inventory_level : null
  }));

  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 h-[300px]">
      <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Stock Level History</h3>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              tick={{ fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              fontSize={10} 
              tick={{ fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '12px', 
                border: '1px solid #1e293b', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                color: '#f8fafc'
              }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area 
              type="monotone" 
              dataKey="inventory" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorStock)" 
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
