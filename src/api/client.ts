const BASE_URL = 'https://controle-dividas-8sag.onrender.com';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        const body = JSON.parse(text);
        message = body.message || message;
      }
    } catch {
      // ignora erros de parse
    }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;

  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text);
}
