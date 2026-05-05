import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { solicitarRecuperacao, redefinirSenha } from '../api/auth';

export function RecuperarSenhaPage() {
    const [email, setEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (novaSenha !== confirmar) {
            setError('As senhas nao coincidem.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await solicitarRecuperacao(email);
            if (!res?.token) {
                setError('E-mail não cadastrado.');
                return;
            }
            await redefinirSenha(res.token, novaSenha);
            setSucesso(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
                setError('E-mail não cadastrado.');
            } else {
                setError(msg || 'Erro ao redefinir senha');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:justify-start sm:p-12 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/andre-taissin-5OUMf1Mr5pU-unsplash.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
                    <p className="text-gray-500 mt-1 text-sm">Informe seu e-mail e defina uma nova senha</p>
                </div>
                {sucesso && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 text-center font-medium">
                        ✅ Senha alterada com sucesso! Redirecionando...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail cadastrado</label>
                        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="seu@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                        <input type="password" required minLength={6} maxLength={20} autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="Minimo 6 caracteres" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                        <input type="password" required minLength={6} maxLength={20} autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="Repita a senha" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer">
                        {loading ? 'Salvando...' : 'Redefinir senha'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link to="/login" className="text-indigo-600 hover:underline font-medium">← Voltar ao login</Link>
                </p>
            </div>
        </div>
    );
}
