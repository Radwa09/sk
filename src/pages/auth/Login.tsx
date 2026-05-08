import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export function Login({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { login } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsAuthenticating(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            const role = email.toLowerCase().includes('admin') ? 'admin' : email.toLowerCase().endsWith('@clinical.com') ? 'pharmacist' : 'dashboard';
            onNavigate(role);
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            className="max-w-md mx-auto py-20"
        >
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#4A3C31] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                        <ShieldCheck className="w-8 h-8 text-stone-100" />
                    </div>
                    <h2 className="text-3xl font-serif text-[#3B302B] dark:text-stone-100 mb-2">Welcome Back</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-light">
                        Access your clinical dermal profile
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-2">Client Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="clinical@example.com"
                            className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C7A6E]/50 focus:border-[#8C7A6E] transition-all dark:text-stone-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center pl-2">
                            <label htmlFor="password" className="text-xs font-bold text-stone-400 uppercase tracking-widest">Protocol Key</label>
                            <button
                                type="button"
                                onClick={() => onNavigate('forgot-password')}
                                className="text-xs text-[#8C7A6E] font-medium hover:text-[#4A3C31] transition-colors"
                            >
                                Reset Access
                            </button>
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Enter your secure key"
                            className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8C7A6E]/50 focus:border-[#8C7A6E] transition-all dark:text-stone-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-4 bg-[#4A3C31] hover:bg-[#3B302B] text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-[#4A3C31]/20 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAuthenticating ? 'Authenticating...' : 'Authenticate'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-800 text-center">
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                        New to our clinical network?{' '}
                        <button
                            onClick={() => onNavigate('signup')}
                            className="font-bold text-[#4A3C31] dark:text-stone-300 hover:text-[#8C7A6E] transition-colors"
                        >
                            Request Access
                        </button>
                    </p>
                </div>

                <button
                    onClick={() => onNavigate('home')}
                    className="mt-8 flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-[#3B302B] mx-auto transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> Return to Platform
                </button>
            </div>
        </motion.div>
    );
}
