import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Activity, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function PharmacistDashboard() {
    const { user, addActivity } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUser, setSearchedUser] = useState<any>(null);
    const [userHistory, setUserHistory] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!user || user.role !== 'pharmacist') return;
        fetchConsultations();
    }, [user]);

    const fetchConsultations = async () => {
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                id,
                question,
                answer,
                status,
                created_at,
                profiles:user_id ( id, name, email )
            `)
            .order('created_at', { ascending: false });
        
        if (data) setConsultations(data);
        if (error) console.error('Fetch Consultations Error:', error);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchedUser(null);
        setUserHistory([]);

        if (!searchQuery) return;

        // Search by email or UID
        const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.eq.${searchQuery},id.eq.${searchQuery}`)
            .single();

        if (profileData) {
            setSearchedUser(profileData);
            const { data: histData } = await supabase
                .from('analysis_history')
                .select('*')
                .eq('user_id', profileData.id)
                .order('date', { ascending: false });
            
            if (histData) setUserHistory(histData);
        }
    };

    const handleReply = async (id: string, userId: string) => {
        const answer = replyText[id];
        if (!answer || !user) return;

        const { error } = await supabase
            .from('consultations')
            .update({
                pharmacist_id: user.id,
                answer: answer,
                status: 'answered',
                answered_at: new Date().toISOString()
            })
            .eq('id', id);

        if (!error) {
            setReplyText(prev => ({ ...prev, [id]: '' }));
            fetchConsultations();
            
            // Log as pharmacist for audit
            addActivity({
                type: 'admin',
                title: 'Consultation Answered',
                description: `Pharmacist ${user.name} answered User ${userId}`,
                icon: 'MessageSquare'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto space-y-12 pb-24"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#4A3C31] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-serif text-[#3B302B] dark:text-stone-100">Clinical <span className="text-[#8C7A6E] italic">Workspace</span></h2>
                    <p className="text-sm font-light text-stone-500">Pharmacist Diagnostic Overview</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Pending Consultations */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif text-[#3B302B] dark:text-stone-100 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#8C7A6E]" /> Active Inquiries
                    </h3>
                    <div className="space-y-4">
                        {consultations.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl">
                                <p className="text-stone-500 text-sm">No pending consultations.</p>
                            </div>
                        ) : (
                            consultations.map(c => (
                                <div key={c.id} className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{c.profiles?.name || 'Unknown User'}</div>
                                            <div className="text-[10px] text-stone-500 mb-2">{c.profiles?.email}</div>
                                            <p className="text-sm text-[#3B302B] dark:text-stone-200">" {c.question} "</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {c.status}
                                        </div>
                                    </div>
                                    {c.status === 'pending' ? (
                                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex gap-2">
                                            <textarea
                                                className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-sm focus:outline-none dark:text-stone-200 resize-none h-20"
                                                placeholder="Provide clinical advice..."
                                                value={replyText[c.id] || ''}
                                                onChange={(e) => setReplyText({ ...replyText, [c.id]: e.target.value })}
                                            />
                                            <button
                                                onClick={() => handleReply(c.id, c.profiles?.id)}
                                                className="px-6 bg-[#4A3C31] text-white rounded-2xl shadow-md hover:bg-[#3B302B] transition-all flex flex-col items-center justify-center gap-1"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span className="text-[10px] tracking-widest uppercase font-bold">Reply</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                <CheckCircle2 className="w-3 h-3" /> Pharmacist Response
                                            </div>
                                            <p className="text-sm text-stone-600 dark:text-stone-400 font-light italic bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl">
                                                {c.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Patient Insights */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif text-[#3B302B] dark:text-stone-100 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#8C7A6E]" /> Patient Insights
                    </h3>
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm space-y-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by exact Email or User UID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3 text-sm focus:outline-none dark:text-stone-200"
                            />
                            <button type="submit" className="w-12 h-12 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-center text-[#4A3C31] dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                        </form>

                        {searchedUser ? (
                            <div className="space-y-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                                <div>
                                    <h4 className="text-sm font-bold text-[#3B302B] dark:text-stone-200">{searchedUser.name}</h4>
                                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{searchedUser.email} • Age: {searchedUser.dob ? Math.floor((new Date().getTime() - new Date(searchedUser.dob).getTime()) / 31536000000) : 'N/A'}</div>
                                    <div className="text-xs text-stone-500 mt-2 font-light">{searchedUser.bio || 'No context bio provided.'}</div>
                                </div>

                                <div>
                                    <h5 className="text-[10px] font-bold text-[#8C7A6E] uppercase tracking-widest mb-3">AI Diagnostic History</h5>
                                    <div className="space-y-3">
                                        {userHistory.length === 0 ? (
                                            <p className="text-xs text-stone-500 font-light">No analysis records found.</p>
                                        ) : (
                                            userHistory.map(h => (
                                                <div key={h.id} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700/50 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-bold text-[#3B302B] dark:text-stone-200 mb-1">{h.type}</div>
                                                        <div className="text-[10px] text-stone-500 font-light">{h.result}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-[#8C7A6E]">{h.score}% Precision</div>
                                                        <div className="text-[9px] text-stone-400 mt-1 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-stone-500 text-sm font-light">
                                Execute lookup to retrieve patient profile geometry.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
