import type { SensorReadings, SensorsResponse, SensorType } from "@smartcampus/types";

// This module is used both from Server Components (fetch runs inside the
// web container/process) and Client Components (fetch runs in the browser).
// Those need different base URLs when containerized: the browser needs the
// externally published address (NEXT_PUBLIC_API_URL), while server-side code
// needs the api service's Docker-internal address (API_INTERNAL_URL). Native
// dev (no Docker) doesn't need API_INTERNAL_URL — both sides share localhost.
const API_URL =
  (typeof window === "undefined" && process.env.API_INTERNAL_URL) ||
  process.env.IOT_API_URL ||
  "https://iot.maua.br/";

export async function fetchEnergySensors(): Promise<SensorsResponse> {
  const res = await fetch(`${API_URL}/energy/sensors`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch energy sensors: ${res.statusText}`);
  }
  return res.json() as Promise<SensorsResponse>;
}

export async function fetchWaterSensors(): Promise<SensorsResponse> {
  const res = await fetch(`${API_URL}/water/sensors`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch water sensors: ${res.statusText}`);
  }
  return res.json() as Promise<SensorsResponse>;
}

export async function fetchRestaurants(): Promise<SensorsResponse> {
  const res = await fetch(`${API_URL}/restaurant/sensors`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch restaurants: ${res.statusText}`);
  }
  return res.json() as Promise<SensorsResponse>;
}

export async function getSensorReadings(device_id : string, type : SensorType, limit: number = 1) : Promise<SensorReadings>{
  const query = new URLSearchParams({
    limit : `${limit}`
  }).toString();
  const res = await fetch(`${API_URL}/${type}/sensors/${device_id}/readings?${query}`, );
  if (!res.ok) {
    throw new Error(`Failed to get sensor Readings: ${res.statusText}`);
  }
  return res.json() as Promise<SensorReadings>;
}

export async function getRestaurantReport(device_id : string, date : Date = new Date()){
  try {
    const query = new URLSearchParams({
      date: `${date}`
    }).toString();
    const response = await fetch(`${API_URL}/reports/${device_id}?${query}`);
    const blob = await response.blob();
    return blob;

  } catch (error) {
    console.error("Failed to get the report PDF:", error);
  }
}
