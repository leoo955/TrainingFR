import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, Crosshair, Zap, 
  ArrowRight, Activity, Flame,
  Loader2
} from 'lucide-react';
import type { FTData } from '../types';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'lookup'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [playerData, setPlayerData] = useState<FTData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (searchQuery.length < 3) {
        setPlayerData(null);
        return;
      }
      
      setLoading(true);
      try {
        // Utilisation du proxy Vite (/api redirige vers localhost:3001)
        const response = await axios.get(`/api/lookup/${searchQuery}`);
        setPlayerData(response.data);
      } catch (err) {
        console.error("DATA_LINK_FAILURE", err);
        setPlayerData(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPlayer, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono relative overflow-hidden">
      {/* SCANNING LINES */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>

      {/* HUD HEADER */}
      <header className="h-16 border-b-3 border-foreground flex items-center justify-between px-8 bg-black z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="ping-status"></div>
            <span className="font-black text-xl italic glitch-text">TRAINING <span className="text-brand">FR</span></span>
          </div>
          <div className="h-8 w-1 bg-brand opacity-20 hidden md:block"></div>
          <div className="hidden md:flex gap-6 text-[10px] font-bold opacity-50">
            <span>UPLINK: ACTIVE</span>
            <span>FREQ: 2.4GHZ</span>
          </div>
        </div>
        
        <nav className="flex gap-4 h-full">
          <HUDNavLink active={activeView === 'overview'} onClick={() => setActiveView('overview')} label="SYSTEM_OVERVIEW" />
          <HUDNavLink active={activeView === 'lookup'} onClick={() => setActiveView('lookup')} label="TACTICAL_LOOKUP" />
        </nav>

        <button className="brutalist-button py-2 px-4 text-xs">
          AUTH_USER
        </button>
      </header>

      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* TOP STATS HUD */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <HUDStatCard label="HANDSHAKES_24H" value="1,284" />
                <HUDStatCard label="ACTIVE_MODES" value="06" color="text-brand" />
                <HUDStatCard label="CORE_LATENCY" value="12MS" />
                <HUDStatCard label="SYSTEM_STABILITY" value="99.9%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LIVE FEED */}
                <div className="lg:col-span-8 space-y-6">
                  <h2 className="text-lg font-black flex items-center gap-3">
                    <Activity size={20} className="text-brand"/> LIVE_DATA_STREAM
                  </h2>
                  <div className="brutalist-border bg-black/50 p-2 space-y-1">
                    <StreamRow user1="CHOCOIG" user2="PLAYER_01" mode="SWORD" status="SUCCESS" />
                    <StreamRow user1="DJBRUHDY" user2="STEVE" mode="AXE" status="SUCCESS" />
                    <StreamRow user1="CUTIESAD" user2="GHOST_X" mode="POT" status="FAILURE" color="text-error" />
                    <StreamRow user1="FROXSY" user2="ROOKIE" mode="UHC" status="SUCCESS" />
                  </div>
                </div>

                {/* RANKINGS */}
                <div className="lg:col-span-4 space-y-6">
                  <h2 className="text-lg font-black flex items-center gap-3 italic">
                    <Flame size={20} className="text-brand"/> TOP_EXECUTORS
                  </h2>
                  <div className="brutalist-card space-y-4">
                    <RankingItem rank="01" name="CHOCOIG" points="355" tier="HT1" />
                    <RankingItem rank="02" name="DJBRUHDY" points="202" tier="HT1" />
                    <RankingItem rank="03" name="CUTIESAD" points="196" tier="HT1" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'lookup' && (
            <motion.div
              key="lookup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-12 pb-20"
            >
              {/* SCANNER INPUT */}
              <div className="relative group">
                <div className="absolute -top-6 left-0 text-[10px] font-black opacity-50 tracking-[0.5em]">SCANNING_INPUT_MODULE</div>
                <input 
                  type="text"
                  placeholder="IDENTIFIER_REQUIRED..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black brutalist-border p-10 text-5xl font-black focus:border-brand outline-none transition-all placeholder:opacity-10"
                />
                <Search className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20" size={48} />
              </div>

              {searchQuery ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                  {/* ASSET_DUMP (SKIN) */}
                    <div className="brutalist-card relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] bg-black">
                      {loading && (
                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-4">
                          <Loader2 className="animate-spin text-brand" size={64} />
                          <span className="text-xs font-black animate-pulse">EXTRACTING_VISUALS...</span>
                        </div>
                      )}
                      <img 
                        src={playerData?.avatar_url || `https://mc-heads.net/body/${searchQuery}/400`} 
                        alt="Visual_Dump" 
                        className="h-[500px] object-contain relative z-10 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                      />
                      <div className="absolute bottom-0 w-full bg-brand text-black p-4 text-center font-black italic text-xl border-t-3 border-foreground">
                        GLOBAL_RANK: #{playerData?.global_rank || '---'}
                      </div>
                    </div>

                    {/* DATA_BLOCKS */}
                    <div className="space-y-8">
                      <div className="p-8 bg-black brutalist-border brutalist-shadow">
                        <h3 className="text-7xl font-black italic glitch-text leading-none text-brand">{playerData?.pseudo || searchQuery}</h3>
                        <div className="flex justify-between items-end mt-6 border-t-2 border-white/10 pt-4 opacity-50">
                          <span className="text-xs font-black uppercase tracking-widest">PVP_CAPACITY_RATING</span>
                          <span className="text-3xl font-black">{playerData?.total_points || 0} PTS</span>
                        </div>
                      </div>

                      {/* TIERS DISPLAY - MASSIVE & AGGRESSIVE */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black opacity-40 tracking-[0.4em]">ACTIVE_COMBAT_TIERS</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {playerData?.tiers && Object.entries(playerData.tiers)
                            .filter(([, data]) => data.tier !== 'N/A')
                            .map(([key, data]) => (
                              <div key={key} className="brutalist-border bg-zinc-900/50 p-6 flex justify-between items-center group hover:border-brand transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-black brutalist-border flex items-center justify-center">
                                    <Zap size={20} className="text-brand" />
                                  </div>
                                  <span className="text-xl font-black italic">{key.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-8">
                                  <div className="text-right">
                                    <div className="text-[10px] font-black opacity-30 uppercase">PEAK: {data.peak_tier}</div>
                                    <div className="text-sm font-black opacity-50">{data.points} POINTS</div>
                                  </div>
                                  <div className="text-6xl font-black text-brand italic drop-shadow-[4px_4px_0px_#fff]">{data.tier}</div>
                                </div>
                              </div>
                            ))}
                          
                          {/* N/A Tiers simplified */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 opacity-20 mt-4">
                             {playerData?.tiers && Object.entries(playerData.tiers)
                                .filter(([, data]) => data.tier === 'N/A')
                                .map(([key]) => (
                                  <div key={key} className="border border-white/10 p-2 text-[10px] font-bold text-center italic">
                                    {key} (N/A)
                                  </div>
                                ))
                             }
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => window.open(`https://francetiers.fr/profil.php?pseudo=${searchQuery}`, '_blank')}
                        className="brutalist-button w-full justify-between text-2xl py-8 mt-4"
                      >
                        OPEN_FRANCETIERS_INTEL <ArrowRight size={32}/>
                      </button>
                    </div>
                </div>
              ) : (
                <div className="h-96 brutalist-border border-dashed opacity-20 flex items-center justify-center">
                  <span className="text-2xl font-black tracking-[1em]">SYSTEM_IDLE...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const HUDNavLink: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-8 h-full flex items-center text-xs font-black tracking-widest border-l-3 border-foreground transition-all ${active ? 'bg-brand text-black' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
  >
    {label}
  </button>
);

const HUDStatCard: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = "text-foreground" }) => (
  <div className="brutalist-border p-6 bg-black/40">
    <div className="text-[10px] font-black opacity-40 mb-2">{label}</div>
    <div className={`text-4xl font-black ${color}`}>{value}</div>
  </div>
);

const StreamRow: React.FC<{ user1: string, user2: string, mode: string, status: string, color?: string }> = ({ user1, user2, mode, status, color = "text-brand" }) => (
  <div className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 group transition-all">
    <div className="flex items-center gap-8">
      <div className="w-10 h-10 brutalist-border flex items-center justify-center bg-black group-hover:border-brand">
        <Crosshair size={18} className="opacity-30 group-hover:opacity-100 group-hover:text-brand" />
      </div>
      <span className="text-sm font-black italic tracking-tight">
        <span className="text-brand">{user1}</span> <span className="mx-2 opacity-20">||</span> {user2}
      </span>
    </div>
    <div className="flex items-center gap-10 text-[10px] font-black">
      <span className="opacity-30 italic">{mode}</span>
      <span className={`border border-current px-2 py-1 ${color}`}>{status}</span>
    </div>
  </div>
);

const RankingItem: React.FC<{ rank: string, name: string, points: string, tier: string }> = ({ rank, name, points, tier }) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
    <div className="flex items-center gap-4">
      <span className="text-zinc-700 font-black italic">{rank}</span>
      <span className="font-black italic">{name}</span>
    </div>
    <div className="text-right">
      <div className="text-brand font-black italic">{points} PTS</div>
      <div className="text-[9px] font-bold opacity-30 tracking-[0.3em] uppercase">{tier}</div>
    </div>
  </div>
);

export default Dashboard;
