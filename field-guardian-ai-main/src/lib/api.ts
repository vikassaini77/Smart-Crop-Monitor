export const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
export const API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "smartcrop2026";

export const getHeaders = () => ({
  "X-API-Key": API_KEY,
});

export const fetchJobStatus = async (jobId: string) => {
  const res = await fetch(`${API_BASE_URL}/status/${jobId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
};

export const fetchJobResults = async (jobId: string) => {
  const res = await fetch(`${API_BASE_URL}/results/${jobId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch job results");
  return res.json();
};

export const fetchPestInsights = async (pestName: string, confidence: number, count: number = 1) => {
  const res = await fetch(`${API_BASE_URL}/api/insights?pest_name=${encodeURIComponent(pestName)}&confidence=${confidence}&count=${count}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch pest insights");
  return res.json();
};
