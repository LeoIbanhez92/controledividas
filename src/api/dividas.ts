import { apiFetch } from './client';

export type BandeiraCartao = 'santander' | 'itau' | 'banco_do_brasil' | 'nubank' | 'bradesco' | 'picpay';

export const BANDEIRAS: { value: BandeiraCartao; label: string }[] = [
  { value: 'nubank', label: 'Nubank' },
  { value: 'itau', label: 'Itaú' },
  { value: 'bradesco', label: 'Bradesco' },
  { value: 'santander', label: 'Santander' },
  { value: 'banco_do_brasil', label: 'Banco do Brasil' },
  { value: 'picpay', label: 'PicPay' },
];

export interface Divida {
  id: number;
  descricao: string;
  valor: number;
  quantidadeParcelas: number;
  dataVencimentoPrimeiraParcela: string;
  nomeTitular?: string;
  bandeira?: BandeiraCartao | null;
}

export interface DividaDto {
  descricao: string;
  valor: number;
  quantidadeParcelas: number;
  dataVencimentoPrimeiraParcela: string;
  nomeTitular?: string;
  bandeira?: BandeiraCartao | null;
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
