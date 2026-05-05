import { useState, useEffect } from 'react';
import type { DividaFixa, DividaFixaDto } from '../api/dividasFixas';

interface DividaFixaModalProps {
    divida?: DividaFixa | null;
    onSave: (data: DividaFixaDto) => Promise<void>;
    onClose: () => void;
}


export function DividaFixaModal({ divida, onSave, onClose }: DividaFixaModalProps) {
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('');
    const [valorMensal, setValorMensal] = useState('');
    const [diaVencimento, setDiaVencimento] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (divida) {
            setDescricao(divida.descricao);
            setTipo(divida.tipo);
            setValorMensal(String(divida.valorMensal));
            setDiaVencimento(String(divida.diaVencimento));
        }
    }, [divida]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onSave({
                descricao,
                tipo,
                valorMensal: parseFloat(valorMensal),
                diaVencimento: parseInt(diaVencimento),
            });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {divida ? 'Editar Dívida Fixa' : 'Nova Dívida Fixa'}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <input
                            type="text"
                            required
                            maxLength={255}
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Ex: Aluguel do apartamento"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <input
                            type="text"
                            required
                            maxLength={50}
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="Ex: Aluguel, Água, Internet..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor mensal (R$)</label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={valorMensal}
                            onChange={(e) => setValorMensal(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="0,00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dia do vencimento</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="31"
                            value={diaVencimento}
                            onChange={(e) => setDiaVencimento(e.target.value)}
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
