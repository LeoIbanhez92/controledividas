import { apiFetch } from './client';

export interface Divida {
  id: number;
  descricao: string;
  valor: number;
  quantidadeParcelas: number;
  dataVencimentoPrimeiraParcela: string;
  nomeTitular?: string;
}

export interface DividaDto {
  descricao: string;
  valor: number;
  quantidadeParcelas: number;
  dataVencimentoPrimeiraParcela: string;
  nomeTitular?: string;
}

export const getDividas = () => apiFetch<Divida[]>('/dividas');

export const createDivida = (data: DividaDto) =>
  apiFetch<Divida>('/dividas', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateDivida = (id: number, data: Partial<DividaDto>) =>
  apiFetch<Divida>(`/dividas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteDivida = (id: number) =>
  apiFetch<null>(`/dividas/${id}`, { method: 'DELETE' });
