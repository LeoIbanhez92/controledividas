import type { Divida } from '../api/dividas';

interface DividaCardProps {
    divida: Divida;
    onEdit: (divida: Divida) => void;
    onDelete: (id: number) => void;
}

const brl = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return date.toLocaleDateString('pt-BR');
};

export function DividaCard({ divida, onEdit, onDelete }: DividaCardProps) {
    const valorParcela = Number(divida.valor) / Number(divida.quantidadeParcelas);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{divida.descricao}</h3>
                    {divida.nomeTitular && (
                        <p className="text-xs text-gray-500 mt-0.5">👤 {divida.nomeTitular}</p>
                    )}
                    <p className="text-xl font-bold text-indigo-600 mt-1">{brl(valorParcela)}<span className="text-xs font-normal text-gray-400">/mês</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Total: {brl(Number(divida.valor))}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Parcelas</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {divida.quantidadeParcelas}x
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">1º Vencimento</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {formatDate(divida.dataVencimentoPrimeiraParcela)}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-3">
                <button
                    onClick={() => onEdit(divida)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                    title="Editar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar
                </button>
                <button
                    onClick={() => onDelete(divida.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                    title="Excluir"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Excluir
                </button>
            </div>
        </div>
    );
}
