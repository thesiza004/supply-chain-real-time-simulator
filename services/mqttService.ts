import mqtt, { MqttClient } from 'mqtt';
import { MQTT_CONFIG } from '../constants';

class MqttService {
  private client: MqttClient | null = null;

  connect(onStatusChange: (status: string) => void) {
    onStatusChange('Connecting...');

    // 1. On construit l'URL manuellement : ws://test.mosquitto.org:8080
    const connectUrl = `ws://${MQTT_CONFIG.BROKER_URL}:${MQTT_CONFIG.PORT}`;

    console.log('Attempting connection to:', connectUrl); // Pour le debug

    this.client = mqtt.connect(connectUrl, {
      clientId: 'sc_sim_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      // 2. IMPORTANT : On supprime la ligne "protocol: 'wss'"
      // car le protocole est déjà dans l'URL (ws://)
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      onStatusChange('Connected');
    });

    this.client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      onStatusChange('Error: ' + err.message);
    });

    this.client.on('offline', () => {
      onStatusChange('Disconnected');
    });
  }

  // Accept arbitrary JSON payloads and optional topic
  publish(data: any, topic?: string) {
    const dest = topic || MQTT_CONFIG.TOPIC;
    if (this.client && this.client.connected) {
      const message = JSON.stringify(data);
      this.client.publish(dest, message, { qos: 0 }, (err) => {
        if (err) console.error('Publish error:', err);
      });
      return message;
    }
    return null;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

export const mqttService = new MqttService();