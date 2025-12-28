
export interface SimulationParams {
  initialStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  demandMin: number;
  demandMax: number;
  leadTimeMin: number;
  leadTimeMax: number;
  simulationInterval: number; // in seconds
}

export interface SimulationResult {
  timestamp: string;
  demand: number;
  inventory_level: number;
  reorder_quantity: number;
  lead_time_days: number;
  stockout: number;
  // optional detailed products snapshot
  products?: Product[];
}

export enum MqttStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
  ERROR = 'Error'
}

export enum ProductType {
  FRESH = 'FRESH',
  FROZEN = 'FROZEN',
  DRY = 'DRY'
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  idealTemp: number;
  idealHumidity: number;
  maxStock: number;
  currentStock: number;
  reorderLevel: number;
  price: number;
  demandRate: number;
  sensors: { temperature: number; humidity: number; timestamp: number };
  status: string;
  lastRestock: number | null;
}
