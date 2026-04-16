import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Activity as ActivityIcon, Clock, ShieldCheck, User, Shield, Settings } from 'lucide-react';

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function DashboardOverview({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { history, activities } = useAuth();
    const latestScan = history[0];

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="mb-10">
                <h2 className="text-4xl font-serif text-[#3B302B] dark:text-stone-100 mb-2">Clinical <span className="text-[#8C7A6E] italic">Overview</span></h2>
                <p className="text-stone-500 font-light">Your dermal biometrics and clinical history at a glance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                    <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center text-[#4A3C31] dark:text-stone-300 mb-6 shadow-sm">
                        <ActivityIcon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Latest Scan</div>
                    <div className="text-2xl font-serif text-[#3B302B] dark:text-stone-100">{latestScan?.type || 'No Data'}</div>
                </motion.div>

                <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                    <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center text-[#4A3C31] dark:text-stone-300 mb-6 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Skin Health Score</div>
                    <div className="text-2xl font-serif text-[#3B302B] dark:text-stone-100">{latestScan ? `${latestScan.score}/100` : 'N/A'}</div>
                </motion.div>

                <motion.div variants={itemVariants} className="p-8 rounded-[2rem] bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                    <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center text-[#4A3C31] dark:text-stone-300 mb-6 shadow-sm">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Total Analyses</div>
                    <div className="text-2xl font-serif text-[#3B302B] dark:text-stone-100">{history.length}</div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="p-10 rounded-[2.5rem] bg-[#4A3C31] text-white shadow-2xl shadow-stone-900/20 mt-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-stone-100/40 mb-2">Priority Action</h3>
                        <div className="text-2xl font-serif text-stone-50 mb-2">Initiate New Scan</div>
                        <p className="text-sm text-stone-300 font-light max-w-sm">Keep your protocol updated with a new dermal analysis.</p>
                    </div>
                    <button
                        onClick={() => onNavigate('dashboard/analysis')}
                        className="px-8 py-4 bg-white text-[#4A3C31] rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        Start Analysis
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-stone-100/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            </motion.div>

            <motion.div variants={itemVariants} className="p-8 rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm mt-8 relative">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center border border-stone-100 dark:border-stone-700">
                            <ActivityIcon className="w-5 h-5 text-[#8C7A6E]" />
                        </div>
                        <h3 className="font-bold text-[#3B302B] dark:text-stone-200 text-lg">System <span className="text-[#8C7A6E] italic">Activity Log</span></h3>
                    </div>
                    {/* English Version (Technical Prompt) requirement: Filtered by user_id is handled in AuthContext */}
                </div>

                <div className="space-y-4">
                    {useAuth().loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-8 h-8 border-4 border-stone-200 border-t-[#4A3C31] rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Fetching Synchronized Logs...</span>
                        </div>
                    ) : activities.length > 0 ? (
                        activities.slice(0, 10).map((item, i) => {
                            const Icon = item.icon === 'User' ? User :
                                        item.icon === 'Shield' ? Shield :
                                        item.icon === 'Settings' ? Settings : ActivityIcon;
                            
                            return (
                                <motion.div 
                                    key={item.id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-6 py-5 border-b border-stone-100 dark:border-stone-800 last:border-0 last:pb-0 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:bg-[#4A3C31] group-hover:text-white transition-all shadow-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-sm font-bold text-[#3B302B] dark:text-stone-200">{item.title}</h4>
                                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-stone-50 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-100 dark:border-stone-700">
                                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 font-light">{item.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-stone-400 italic font-light">No activity logs synchronized in this clinical session.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
