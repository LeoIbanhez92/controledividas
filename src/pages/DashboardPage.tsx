import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import type { Divida, DividaDto } from '../api/dividas';
import {
    getDividas,
    createDivida,
    updateDivida,
    deleteDivida,
    BANDEIRAS,
} from '../api/dividas';
import type { DividaFixa, DividaFixaDto } from '../api/dividasFixas';
import {
    getDividasFixas,
    createDividaFixa,
    updateDividaFixa,
    deleteDividaFixa,
} from '../api/dividasFixas';
import { DividaCard } from '../components/DividaCard';
import { DividaModal } from '../components/DividaModal';
import { DividaFixaCard } from '../components/DividaFixaCard';
import { DividaFixaModal } from '../components/DividaFixaModal';

const brl = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function DashboardPage() {
    const { logout } = useAuth();
    useInactivityLogout(logout);
    const [dividas, setDividas] = useState<Divida[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDivida, setEditingDivida] = useState<Divida | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Dívidas fixas
    const [dividasFixas, setDividasFixas] = useState<DividaFixa[]>([]);
    const [modalFixaOpen, setModalFixaOpen] = useState(false);
    const [editingFixa, setEditingFixa] = useState<DividaFixa | null>(null);
    const [deleteFixaId, setDeleteFixaId] = useState<number | null>(null);

    // Pagas no mês atual (localStorage) — dívidas fixas
    const getMesKey = () => { const n = new Date(); return `dividas-fixas-pagas-${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; };
    const loadPagas = (): Set<number> => { try { const r = localStorage.getItem(getMesKey()); return r ? new Set(Object.keys(JSON.parse(r)).map(Number)) : new Set(); } catch { return new Set(); } };
    const [pagasIds, setPagasIds] = useState<Set<number>>(loadPagas);

    // Pagas no mês atual (localStorage) — dívidas de cartão
    const getMesCartaoKey = () => { const n = new Date(); return `dividas-cartao-pagas-${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; };
    const loadPagasCartao = (): Set<number> => { try { const r = localStorage.getItem(getMesCartaoKey()); return r ? new Set(Object.keys(JSON.parse(r)).map(Number)) : new Set(); } catch { return new Set(); } };
    const [pagasCartaoIds, setPagasCartaoIds] = useState<Set<number>>(loadPagasCartao);

    const handleToggleGrupo = (ids: number[]) => {
        const key = getMesCartaoKey();
        const raw = localStorage.getItem(key);
        const obj: Record<number, boolean> = raw ? JSON.parse(raw) : {};
        const todosPagos = ids.every((id) => obj[id]);
        if (todosPagos) {
            ids.forEach((id) => delete obj[id]);
        } else {
            ids.forEach((id) => { obj[id] = true; });
        }
        localStorage.setItem(key, JSON.stringify(obj));
        setPagasCartaoIds(new Set(Object.keys(obj).map(Number)));
    };

    const handleTogglePaga = (id: number) => {
        const key = getMesKey();
        const raw = localStorage.getItem(key);
        const obj = raw ? JSON.parse(raw) : {};
        if (obj[id]) delete obj[id]; else obj[id] = true;
        localStorage.setItem(key, JSON.stringify(obj));
        setPagasIds(new Set(Object.keys(obj).map(Number)));
    };

    const fetchDividas = async () => {
        setError('');
        try {
            const [data, fixas] = await Promise.all([getDividas(), getDividasFixas()]);

            // Apagar dívidas cuja última parcela já passou
            const hoje = new Date();
            const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
            const vencidas = data.filter((d) => {
                const primeiro = new Date(d.dataVencimentoPrimeiraParcela + (d.dataVencimentoPrimeiraParcela.includes('T') ? '' : 'T00:00:00'));
                const mesUltima = (primeiro.getFullYear() * 12 + primeiro.getMonth()) + (Number(d.quantidadeParcelas) - 1);
                return mesUltima < mesAtual;
            });
            await Promise.all(vencidas.map((d) => deleteDivida(d.id)));
            const vencidasIds = new Set(vencidas.map((d) => d.id));
            setDividas(data.filter((d) => !vencidasIds.has(d.id)));
            setDividasFixas(fixas);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dívidas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDividas();
    }, []);

    const handleSave = async (data: DividaDto) => {
        if (editingDivida) {
            const updated = await updateDivida(editingDivida.id, data);
            setDividas((prev) =>
                prev.map((d) => (d.id === editingDivida.id ? updated : d))
            );
        } else {
            const created = await createDivida(data);
            setDividas((prev) => [created, ...prev]);
        }
        setEditingDivida(null);
    };

    const handleEdit = (divida: Divida) => {
        setEditingDivida(divida);
        setModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirmId === null) return;
        try {
            await deleteDivida(deleteConfirmId);
            setDividas((prev) => prev.filter((d) => d.id !== deleteConfirmId));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleSaveFixa = async (data: DividaFixaDto) => {
        if (editingFixa) {
            const updated = await updateDividaFixa(editingFixa.id, data);
            setDividasFixas((prev) => prev.map((d) => (d.id === editingFixa.id ? updated : d)));
        } else {
            const created = await createDividaFixa(data);
            setDividasFixas((prev) => [created, ...prev]);
        }
        setEditingFixa(null);
    };

    const handleToggleAtiva = async (divida: DividaFixa) => {
        const updated = await updateDividaFixa(divida.id, { ativa: !divida.ativa });
        setDividasFixas((prev) => prev.map((d) => (d.id === divida.id ? updated : d)));
    };

    const handleDeleteFixaConfirm = async () => {
        if (deleteFixaId === null) return;
        try {
            await deleteDividaFixa(deleteFixaId);
            setDividasFixas((prev) => prev.filter((d) => d.id !== deleteFixaId));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir');
        } finally {
            setDeleteFixaId(null);
        }
    };

    const totalFixasMensal = dividasFixas
        .filter((d) => d.ativa)
        .reduce((sum, d) => sum + Number(d.valorMensal), 0);
    const totalFixasPagas = dividasFixas
        .filter((d) => d.ativa && pagasIds.has(d.id))
        .reduce((sum, d) => sum + Number(d.valorMensal), 0);
    const totalCartaoMensal = dividas.reduce(
        (sum, d) => sum + Number(d.valor) / Number(d.quantidadeParcelas),
        0
    );
    const totalCartaoPago = dividas
        .filter((d) => pagasCartaoIds.has(d.id))
        .reduce((sum, d) => sum + Number(d.valor) / Number(d.quantidadeParcelas), 0);
    const totalGeral = totalCartaoMensal - totalCartaoPago + totalFixasMensal - totalFixasPagas;

    // Agrupar dívidas: bandeira → titular
    type GrupoBandeira = {
        bandeira: string | null;
        label: string;
        titulares: { titular: string; itens: typeof dividas }[];
        todosIds: number[];
    };
    const dividasPorBandeira: GrupoBandeira[] = [];
    const bandeirasUsadas = [...new Set(dividas.map((d) => d.bandeira ?? null))];
    bandeirasUsadas.forEach((b) => {
        const itensBandeira = dividas.filter((d) => (d.bandeira ?? null) === b);
        const label = b ? (BANDEIRAS.find((x) => x.value === b)?.label ?? b) : 'Sem bandeira';
        const titularesUnicos = [...new Set(itensBandeira.map((d) => d.nomeTitular ?? ''))];
        const titulares = titularesUnicos.map((t) => ({
            titular: t,
            itens: itensBandeira.filter((d) => (d.nomeTitular ?? '') === t),
        }));
        dividasPorBandeira.push({ bandeira: b, label, titulares, todosIds: itensBandeira.map((d) => d.id) });
    });

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden" style={{ backgroundImage: "url('/A%20m%C3%A3o%20do%20homem%20de%20neg%C3%B3cios%20segura%20o%20modelo%20da%20casa%20que%20poupa%20uma%20pequena%20casa_%20_%20Foto%20Gr%C3%A1tis.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-white/60" />
            {/* Header */}
            <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 top-0">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <h1 className="text-lg font-bold text-gray-800">Controle de Dívidas</h1>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sair
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
                {/* Stats */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Fixas/Mês</p>
                            <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{brl(totalFixasMensal)}</p>
                            <p className="text-xs text-gray-400 mt-1 hidden sm:block">{dividasFixas.filter(d => d.ativa).length} dívidas ativas</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Cartão/Mês</p>
                            <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1">{brl(totalCartaoMensal)}</p>
                            <p className="text-xs text-gray-400 mt-1 hidden sm:block">soma das parcelas mensais</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total/Mês</p>
                            <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{brl(totalGeral)}</p>
                            <p className="text-xs text-gray-400 mt-1 hidden sm:block">cartão + fixas no mês</p>
                        </div>
                    </div>
                )}

                {/* Actions bar */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Dívidas Cartão de Crédito
                    </h2>
                    <button
                        onClick={() => {
                            setEditingDivida(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="hidden sm:inline">Nova Dívida Crédito</span>
                        <span className="sm:hidden"> Compras</span>
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && dividas.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🎉</div>
                        <p className="text-gray-800 font-semibold text-lg">Nenhuma dívida cadastrada!</p>
                        <p className="text-gray-500 text-sm mt-1">Clique em "Nova Dívida" para começar</p>
                    </div>
                )}

                {/* Debt list grouped by bandeira → titular (independente) */}
                {!loading && dividas.length > 0 && (
                    <div className="space-y-4">
                        {dividasPorBandeira.map(({ bandeira, label, titulares }) => (
                            titulares.map(({ titular, itens }) => {
                                const ids = itens.map((d) => d.id);
                                const subtotalMensal = itens.reduce((s, d) => s + Number(d.valor) / Number(d.quantidadeParcelas), 0);
                                const todosPagos = ids.length > 0 && ids.every((id) => pagasCartaoIds.has(id));
                                const chave = `${bandeira ?? '__sem__'}-${titular || '__sem_titular__'}`;
                                return (
                                    <div key={chave} className="bg-white/80 rounded-2xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between gap-2 mb-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-base">💳</span>
                                                <span className="text-sm font-bold text-gray-800">{label}</span>
                                                {titular && (
                                                    <>
                                                        <span className="text-gray-300 text-sm">•</span>
                                                        <span className="text-sm text-gray-500">👤 {titular}</span>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleToggleGrupo(ids)}
                                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                                        todosPagos ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                                                    }`}
                                                    title={todosPagos ? 'Desmarcar fatura paga' : 'Marcar fatura como paga'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    {todosPagos ? 'Pago' : 'Pagar'}
                                                </button>
                                            </div>
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                                                {brl(subtotalMensal)}/mês
                                            </span>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {itens.map((divida) => (
                                                <DividaCard
                                                    key={divida.id}
                                                    divida={divida}
                                                    pago={pagasCartaoIds.has(divida.id)}
                                                    onEdit={handleEdit}
                                                    onDelete={(id) => setDeleteConfirmId(id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                )}

                {/* Dívidas fixas */}
                <div className="flex items-center justify-between mt-8 mb-4">
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Dívidas Fixas Mensais
                    </h2>
                    <button
                        onClick={() => { setEditingFixa(null); setModalFixaOpen(true); }}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="hidden sm:inline">Nova Dívida Fixa</span>
                        <span className="sm:hidden">Fixas</span>
                    </button>
                </div>

                {!loading && dividasFixas.length === 0 && (
                    <div className="text-center py-10">
                        <div className="text-4xl mb-3">📅</div>
                        <p className="text-gray-700 font-semibold">Nenhuma dívida fixa cadastrada</p>
                        <p className="text-gray-500 text-sm mt-1">Adicione aluguel, financiamentos e outros gastos mensais</p>
                    </div>
                )}

                {!loading && dividasFixas.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {dividasFixas.map((divida) => (
                            <DividaFixaCard
                                key={divida.id}
                                divida={divida}
                                paga={pagasIds.has(divida.id)}
                                onTogglePaga={() => handleTogglePaga(divida.id)}
                                onEdit={(d) => { setEditingFixa(d); setModalFixaOpen(true); }}
                                onDelete={(id) => setDeleteFixaId(id)}
                                onToggleAtiva={handleToggleAtiva}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal add/edit */}
            {modalOpen && (
                <DividaModal
                    divida={editingDivida}
                    onSave={handleSave}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingDivida(null);
                    }}
                />
            )}

            {/* Modal fixa add/edit */}
            {modalFixaOpen && (
                <DividaFixaModal
                    divida={editingFixa}
                    onSave={handleSaveFixa}
                    onClose={() => { setModalFixaOpen(false); setEditingFixa(null); }}
                />
            )}

            {/* Modal confirm delete fixa */}
            {deleteFixaId !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="text-4xl mb-3">🗑️</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Excluir dívida fixa?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteFixaId(null)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition text-sm cursor-pointer">Cancelar</button>
                            <button onClick={handleDeleteFixaConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteConfirmId !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="text-4xl mb-3">🗑️</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Excluir dívida?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition text-sm cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
