
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationParams, SimulationResult, MqttStatus, Product, ProductType } from './types';
import { DEFAULT_PARAMS } from './constants';
import { mqttService } from './services/mqttService';
import SimulationControls from './components/SimulationControls';
import MetricsDisplay from './components/MetricsDisplay';
import StockChart from './components/StockChart';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isRunning, setIsRunning] = useState(false);
  const [mqttStatus, setMqttStatus] = useState<string>('Disconnected');
  const [currentData, setCurrentData] = useState<SimulationResult | null>(null);
  const [history, setHistory] = useState<SimulationResult[]>([]);
  
  // Simulation internal state
  const timerRef = useRef<number | null>(null);

  const initialProducts: Product[] = [
    {
      id: 'P001',
      name: 'Pommes Golden (Frais)',
      type: ProductType.FRESH,
      idealTemp: 4.0,
      idealHumidity: 90,
      maxStock: 500,
      currentStock: 450,
      reorderLevel: 100,
      price: 2.5,
      demandRate: 5,
      sensors: { temperature: 4.2, humidity: 88, timestamp: Date.now() },
      status: 'OK',
      lastRestock: null
    },
    {
      id: 'P002',
      name: 'Steaks Hachés (Surgelé)',
      type: ProductType.FROZEN,
      idealTemp: -18.0,
      idealHumidity: 50,
      maxStock: 300,
      currentStock: 280,
      reorderLevel: 50,
      price: 8.9,
      demandRate: 3,
      sensors: { temperature: -18.5, humidity: 55, timestamp: Date.now() },
      status: 'OK',
      lastRestock: null
    },
    {
      id: 'P003',
      name: 'Riz Basmati 5kg (Sec)',
      type: ProductType.DRY,
      idealTemp: 20.0,
      idealHumidity: 40,
      maxStock: 200,
      currentStock: 150,
      reorderLevel: 20,
      price: 12.0,
      demandRate: 1,
      sensors: { temperature: 21.0, humidity: 38, timestamp: Date.now() },
      status: 'OK',
      lastRestock: null
    }
  ];

  const [products, setProducts] = useState<Product[]>(initialProducts);

  const startSimulation = useCallback(() => {
    // Connect MQTT if not already
    mqttService.connect(setMqttStatus);
    
    // Reset products to initial set and clear history
    setProducts(initialProducts);
    setHistory([]);
    setIsRunning(true);

    // Initial first run
    runSimulationTick();

    // Start interval
    timerRef.current = window.setInterval(() => {
      runSimulationTick();
    }, params.simulationInterval * 1000);
  }, [params]);

  const stopSimulation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mqttService.disconnect();
    setMqttStatus('Disconnected');
    setIsRunning(false);
  }, []);

  const runSimulationTick = () => {
    // Simulate for each product
    setProducts(prev => {
      let totalDemand = 0;
      let totalInventory = 0;
      let totalReorder = 0;
      let totalStockouts = 0;

      const next = prev.map(p => {
        // demand based on product demandRate (0..demandRate)
        const sold = Math.floor(Math.random() * (p.demandRate + 1));
        totalDemand += sold;

        let newStock = Math.max(0, p.currentStock - sold);
        if (newStock === 0) totalStockouts += 1;

        let reorderQty = 0;
        if (newStock <= p.reorderLevel) {
          reorderQty = p.maxStock - newStock; // restock to full
          newStock += reorderQty;
          totalReorder += reorderQty;
          p.lastRestock = Date.now();
        }

        // sensor variation: temperature +/-0.5 around ideal, humidity +/-2
        const newTemp = +(p.idealTemp + (Math.random() - 0.5) * 1).toFixed(2);
        const newHumidity = +Math.max(0, Math.min(100, p.idealHumidity + (Math.random() - 0.5) * 4)).toFixed(1);
        const newStatus = Math.abs(newTemp - p.idealTemp) > 2 ? 'WARNING' : 'OK';

        totalInventory += newStock;

        return {
          ...p,
          currentStock: newStock,
          sensors: { temperature: newTemp, humidity: newHumidity, timestamp: Date.now() },
          status: newStatus,
          lastRestock: p.lastRestock
        } as Product;
      });

      // publish aggregate result for compatibility with existing UI
      const leadTime = Math.floor(Math.random() * (params.leadTimeMax - params.leadTimeMin + 1)) + params.leadTimeMin;
      const agg: SimulationResult = {
        timestamp: new Date().toISOString(),
        demand: totalDemand,
        inventory_level: totalInventory,
        reorder_quantity: totalReorder,
        lead_time_days: leadTime,
        stockout: totalStockouts
      };

      // Publish per-product events with detailed info
      next.forEach(prod => {
        const payload = {
          event: 'product_update',
          timestamp: new Date().toISOString(),
          product: {
            id: prod.id,
            name: prod.name,
            type: prod.type,
            currentStock: prod.currentStock,
            maxStock: prod.maxStock,
            reorderLevel: prod.reorderLevel,
            price: prod.price,
            demandRate: prod.demandRate,
            sensors: prod.sensors,
            status: prod.status,
            lastRestock: prod.lastRestock
          }
        };
        mqttService.publish(payload);
      });

      // keep aggregate publish for backwards compatibility
      mqttService.publish(agg);
      // also set currentData to include detailed products so UI shows them
      const aggWithProducts = { ...agg, products: next };
      setCurrentData(aggWithProducts as SimulationResult);
      setHistory(prevH => [...prevH, aggWithProducts as SimulationResult]);

      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mqttService.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-slate-950 text-slate-100">
      <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">SupplyChain <span className="text-blue-500">SimX</span></h1>
          <p className="text-slate-400 text-sm font-medium">Real-time inventory simulation & MQTT streaming</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Broker:</span>
              <span className="text-sm font-semibold text-slate-300">mqtt.cool</span>
           </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-4">
          <SimulationControls 
            params={params} 
            setParams={setParams} 
            isRunning={isRunning} 
            onStart={startSimulation} 
            onStop={stopSimulation} 
          />
        </div>

        {/* Right Column - Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <MetricsDisplay 
            currentData={currentData} 
            mqttStatus={mqttStatus} 
          />
          <StockChart history={history} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(p => {
              const stockPct = Math.round((p.currentStock / p.maxStock) * 100);
              const tempColor = p.status === 'WARNING' ? 'bg-amber-400' : 'bg-green-400';
              return (
                <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <div className="text-xs text-slate-400">{p.type} • €{p.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Stock</div>
                      <div className="font-bold text-white">{p.currentStock}/{p.maxStock}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                      <div className="h-2 bg-blue-500" style={{ width: `${stockPct}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                      <div>Reorder: {p.reorderLevel}</div>
                      <div>{stockPct}%</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-slate-400">Température</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-6 rounded flex items-center justify-center text-sm font-semibold ${tempColor} text-slate-900`}>{p.sensors.temperature}°C</div>
                        <div className="text-xs text-slate-400">Hum: {p.sensors.humidity}%</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-white">{p.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-300">
              <p className="font-semibold mb-1 text-white">How it works</p>
              <p className="leading-relaxed opacity-80">
                At each interval, a random demand is subtracted from the stock. If stock drops below the reorder point, a new batch is immediately added. All events are published as JSON to <code className="bg-slate-800 px-1 rounded text-blue-400">supplychain/warehouse/events</code> via MQTT over WebSockets.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-slate-500 text-xs text-center">
        &copy; 2025 SupplyChain SimX - Browser-based Industrial Simulator. Built with React & MQTT.js
      </footer>
    </div>
  );
};

export default App;
