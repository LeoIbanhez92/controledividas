import { useState, useEffect } from 'react';
import type { Divida, DividaDto, BandeiraCartao } from '../api/dividas';
import { BANDEIRAS } from '../api/dividas';

interface DividaModalProps {
    divida?: Divida | null;
    onSave: (data: DividaDto) => Promise<void>;
    onClose: () => void;
}

export function DividaModal({ divida, onSave, onClose }: DividaModalProps) {
    const [descricao, setDescricao] = useState('');
    const [nomeTitular, setNomeTitular] = useState('');
    const [valorParcela, setValorParcela] = useState('');
    const [quantidadeParcelas, setQuantidadeParcelas] = useState('1');
    const [dataVencimentoPrimeiraParcela, setDataVencimento] = useState('');
    const [bandeira, setBandeira] = useState<BandeiraCartao | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (divida) {
            setDescricao(divida.descricao);
            setNomeTitular(divida.nomeTitular ?? '');
            const parcela = Number(divida.valor) / Number(divida.quantidadeParcelas);
            setValorParcela(parcela.toFixed(2));
            setQuantidadeParcelas(String(divida.quantidadeParcelas));
            setDataVencimento(divida.dataVencimentoPrimeiraParcela.split('T')[0]);
            setBandeira(divida.bandeira ?? '');
        }
    }, [divida]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const parcelas = parseInt(quantidadeParcelas);
            const valorTotal = parseFloat(valorParcela) * parcelas;
            await onSave({
                descricao,
                valor: valorTotal,
                quantidadeParcelas: parcelas,
                dataVencimentoPrimeiraParcela: dataVencimentoPrimeiraParcela,
                ...(nomeTitular.trim() ? { nomeTitular: nomeTitular.trim() } : {}),
                ...(bandeira ? { bandeira } : { bandeira: null }),
            });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const valorTotal =
        valorParcela && quantidadeParcelas
            ? parseFloat(valorParcela) * parseInt(quantidadeParcelas)
            : null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {divida ? 'Editar Dívida' : 'Nova Dívida'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition text-xl leading-none cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={255}
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Ex: Financiamento do carro"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do titular / devedor <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={nomeTitular}
                            onChange={(e) => setNomeTitular(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Ex: Maria Silva"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor da parcela (R$)
                        </label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={valorParcela}
                            onChange={(e) => setValorParcela(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="0,00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantidade de parcelas
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="360"
                            value={quantidadeParcelas}
                            onChange={(e) => setQuantidadeParcelas(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                        {valorTotal !== null && !isNaN(valorTotal) && (
                            <p className="text-xs text-indigo-600 mt-1">
                                Total:{' '}
                                {valorTotal.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bandeira / Banco <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={bandeira}
                            onChange={(e) => setBandeira(e.target.value as BandeiraCartao | '')}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        >
                            <option value="">Selecione (opcional)</option>
                            {BANDEIRAS.map((b) => (
                                <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de vencimento da 1ª parcela
                        </label>
                        <input
                            type="date"
                            required
                            value={dataVencimentoPrimeiraParcela}
                            onChange={(e) => setDataVencimento(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition text-sm cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
