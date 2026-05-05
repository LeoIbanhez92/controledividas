import { apiFetch } from './client';

export interface DividaFixa {
  id: number;
  descricao: string;
  tipo: string;
  valorMensal: number;
  diaVencimento: number;
  ativa: boolean;
}

export interface DividaFixaDto {
  descricao: string;
  tipo: string;
  valorMensal: number;
  diaVencimento: number;
}

export const getDividasFixas = () => apiFetch<DividaFixa[]>('/dividas-fixas');

export const createDividaFixa = (data: DividaFixaDto) =>
  apiFetch<DividaFixa>('/dividas-fixas', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateDividaFixa = (id: number, data: Partial<DividaFixaDto & { ativa: boolean }>) =>
  apiFetch<DividaFixa>(`/dividas-fixas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteDividaFixa = (id: number) =>
  apiFetch<null>(`/dividas-fixas/${id}`, { method: 'DELETE' });
