import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login({ email, senha });
            authLogin(res.access_token);
            navigate('/');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('401') || msg.includes('404') || msg.toLowerCase().includes('not found')) {
                setError('E-mail não cadastrado ou senha incorreta.');
            } else {
                setError(msg || 'Erro ao fazer login');
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
                        <span className="text-3xl">💳</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Controle de Dívidas</h1>
                    <p className="text-gray-500 mt-1 text-sm">Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            placeholder="••••••••"
                        />
                        <div className="text-right mt-1">
                            <Link to="/recuperar-senha" className="text-xs text-indigo-600 hover:underline">
                                Esqueceu a senha?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm cursor-pointer"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Não tem conta?{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
