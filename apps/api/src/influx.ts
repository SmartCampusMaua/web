import { SensorType } from "@smartcampus/types";

const API_BASE_URL = process.env.IOT_API_URL ?? "https://iot.maua.br/api/timeseries";
const API_TOKEN = process.env.INFLUXDB_TOKEN ?? "";

// Função auxiliar unificada para buscar dados da API REST do SmartCampus
async function fetchFromApi(endpointPath: string, params?: Record<string, string>): Promise<Record<string, any>[]> {
  try {
    const url = new URL(`${API_BASE_URL}${endpointPath}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(API_TOKEN ? { "Authorization": `Bearer ${API_TOKEN}` } : {})
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na resposta da API (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json();
    
    // Normaliza diferentes formatos possíveis de retorno da API
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rows)) return data.rows;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.data)) return data.data;
    
    return [];
  } catch (error) {
    console.error("Falha de conexão com a API IoT:", error);
    return [];
  }
}

export async function querySensors(measurement: SensorType, limit = 100, device_id: string) {
  // Faz a chamada para a rota de sensores passando o device_id e o tipo de medição
  const rows = await fetchFromApi("/v0.4/imt/iot/sensors", {
    device_id: device_id,
    sensorType: measurement
  });
  return rows;
}

export async function queryLatestSensorReadings(measurement: string, device_id: string) {
  const rows = await fetchFromApi("/v0.4/imt/iot/sensors", {
    device_id: device_id,
    sensorType: measurement
  });
  console.log("Latest readings:", rows);
  return rows;
}

export async function queryRestaurantsPayment(device_id: string, date: Date) {
  const rows = await fetchFromApi("/v0.4/imt/iot/sensors", {
    device_id: device_id,
    sensorType: "restaurant"
  });
  
  if (rows.length >= 3) {
    return [rows[0], rows[2]];
  }
  return [rows[0], rows[1] || rows[0]];
}

export async function queryRestaurantsConsumptionFromMonth(device_id: string, date: Date) {
  const rows = await fetchFromApi("/v0.4/imt/iot/sensors", {
    device_id: device_id,
    sensorType: "restaurant"
  });
  return rows;
}