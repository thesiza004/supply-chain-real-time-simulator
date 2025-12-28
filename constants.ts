export const MQTT_CONFIG = {
  // Juste l'adresse du serveur, sans 'ws://' ni 'http://'
  BROKER_URL: 'test.mosquitto.org', 
  PORT : 8080,
  TOPIC: 'supplychain/warehouse/events'
};

export const DEFAULT_PARAMS = {
  initialStock: 200,
  reorderPoint: 50,
  reorderQuantity: 150,
  demandMin: 10,
  demandMax: 50,
  leadTimeMin: 1,
  leadTimeMax: 5,
  simulationInterval: 0.5
};