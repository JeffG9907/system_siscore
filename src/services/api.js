const API_URL = "http://localhost:4000/api";

export async function getDashboardData() {
  const res = await fetch(`${API_URL}/dashboard`);
  return res.json();
}

export async function createCorte(data) {
  const res = await fetch(`${API_URL}/cortes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createIncidencia(formData) {
  const res = await fetch(`${API_URL}/incidencias`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function getReportes(start, end) {
  const res = await fetch(`${API_URL}/reportes?start=${start}&end=${end}`);
  return res.json();
}