import type { DividaFixa } from '../api/dividasFixas';

interface DividaFixaCardProps {
    divida: DividaFixa;
    paga: boolean;
    onTogglePaga: () => void;
    onEdit: (divida: DividaFixa) => void;
    onDelete: (id: number) => void;
    onToggleAtiva: (divida: DividaFixa) => void;
}

const brl = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function DividaFixaCard({ divida, paga, onTogglePaga, onEdit, onDelete, onToggleAtiva }: DividaFixaCardProps) {
    return (
        <div className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${paga ? 'border-green-200 bg-green-50/40' : divida.ativa ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-semibold truncate ${paga ? 'line-through text-gray-400' : 'text-gray-800'}`}>{divida.descricao}</h3>
                        {paga ? (
                            <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paga ✓</span>
                        ) : divida.ativa ? (
                            <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ativa</span>
                        ) : (
                            <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Pausada</span>
                        )}
                    </div>
                    <p className={`text-xl font-bold ${paga ? 'text-gray-400' : 'text-indigo-600'}`}>{brl(Number(divida.valorMensal))}<span className="text-sm font-normal text-gray-400">/mês</span></p>
                </div>
                {/* Botão paga destacado */}
                <button
                    onClick={onTogglePaga}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        paga ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                    }`}
                    title={paga ? 'Marcar como não paga' : 'Marcar como paga'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {paga ? 'Paga' : 'Pagar'}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm font-semibold text-gray-800">{divida.tipo}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Vencimento</p>
                    <p className="text-sm font-semibold text-gray-800">Dia {divida.diaVencimento}</p>
                </div>
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-3">
                <button
                    onClick={() => onToggleAtiva(divida)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        divida.ativa ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                    title={divida.ativa ? 'Pausar' : 'Ativar'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {divida.ativa
                            ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                            : <polygon points="5 3 19 12 5 21 5 3" />
                        }
                    </svg>
                    {divida.ativa ? 'Pausar' : 'Ativar'}
                </button>
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
