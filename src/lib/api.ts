import { getClerkInstance } from '@clerk/expo';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * fetch para o nosso backend: anexa o token do Clerk e prefixa a URL base.
 * Uso: const vagas = await api<Vaga[]>('/vagas');
 *      await api('/favoritos', { method: 'POST', body: { vagaId } });
 */
export async function api<T = unknown>(
  path: string,
  { body, headers, ...init }: Omit<RequestInit, 'body'> & { body?: unknown } = {}
): Promise<T> {
  const token = await getClerkInstance().session?.getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Erro ${res.status} em ${path}`);
  return data as T;
}
