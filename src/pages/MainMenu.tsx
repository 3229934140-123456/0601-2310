import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Users,
  FolderOpen,
  ScrollText,
  UserRound,
  Package,
  Settings,
  Star,
  Swords,
  ChevronRight
} from 'lucide-react';
import { StarField } from '../components/StarField';
import { Button } from '../components/ui/Button';
import { TopBar } from '../components/HUD/TopBar';
import { useGameStore } from '../store/useGameStore';
import { useBattleStore } from '../store/battleStore';
import { useUIGlobalStore } from '../store/useUIGlobalStore';

const ShipLeftSVG = () => (
  <svg
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-56 h-40 md:w-72 md:h-48 opacity-70 animate-float"
  >
    <defs>
      <linearGradient id="shipGlowLeft" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
        <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <g stroke="url(#shipGlowLeft)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M180 60 L130 30 L90 35 L50 20 L20 45 L30 60 L20 75 L50 100 L90 85 L130 90 Z" />
      <path d="M50 45 L70 60 L50 75" />
      <path d="M90 40 L110 60 L90 80" />
      <path d="M130 35 L155 60 L130 85" />
      <path d="M180 60 L195 55 M180 60 L195 65 M180 60 L195 60" />
      <circle cx="70" cy="60" r="4" fill="#00D4FF" stroke="none" opacity="0.8" />
      <circle cx="110" cy="60" r="5" fill="#4A9EFF" stroke="none" opacity="0.8" />
      <circle cx="155" cy="60" r="3" fill="#9D6CFF" stroke="none" opacity="0.8" />
    </g>
  </svg>
);

const ShipRightSVG = () => (
  <svg
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-56 h-40 md:w-72 md:h-48 opacity-70 animate-float"
    style={{ animationDelay: '1.5s' }}
  >
    <defs>
      <linearGradient id="shipGlowRight" x1="100%" y1="50%" x2="0%" y2="50%">
        <stop offset="0%" stopColor="#00D4FF" stopOpacity="0" />
        <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <g stroke="url(#shipGlowRight)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 60 L70 30 L110 35 L150 20 L180 45 L170 60 L180 75 L150 100 L110 85 L70 90 Z" />
      <path d="M150 45 L130 60 L150 75" />
      <path d="M110 40 L90 60 L110 80" />
      <path d="M70 35 L45 60 L70 85" />
      <path d="M20 60 L5 55 M20 60 L5 65 M20 60 L5 60" />
      <circle cx="130" cy="60" r="4" fill="#00D4FF" stroke="none" opacity="0.8" />
      <circle cx="90" cy="60" r="5" fill="#4A9EFF" stroke="none" opacity="0.8" />
      <circle cx="45" cy="60" r="3" fill="#9D6CFF" stroke="none" opacity="0.8" />
    </g>
  </svg>
);

export function MainMenu() {
  const navigate = useNavigate();
  const profile = useGameStore((s) => s.profile);
  const battleArchive = useGameStore((s) => s.battleArchive);
  const { id: battleId, finished: battleFinished, stageId: battleStageId } = useBattleStore();
  const { openSettingsModal } = useUIGlobalStore();

  useEffect(() => {
    const handleKeyPress = () => {
      navigate('/starmap');
    };
    window.addEventListener('keydown', handleKeyPress, { once: true });
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const canContinue = battleId && !battleFinished && battleStageId;
  const hasSave = battleArchive.length > 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <StarField />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="absolute top-0 left-0 right-0">
          <TopBar />
        </div>

        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 rounded-full bg-space-900/60 backdrop-blur-md border border-energy-cyan/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-energy-cyan/40 to-energy-purple/40 border border-energy-cyan/60 flex items-center justify-center">
              <UserRound className="w-4 h-4 text-energy-cyan" />
            </div>
            <span className="font-display font-bold text-sm text-white">Lv.{profile.level}</span>
          </div>
          <div className="h-4 w-px bg-ship-dark" />
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-danger-yellow fill-danger-yellow/40" />
            <span className="font-display font-bold text-sm text-danger-yellow">
              {profile.starCoins.toLocaleString()}
            </span>
          </div>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20">
          <div className="relative w-full max-w-6xl flex items-center justify-center gap-4 md:gap-8 mb-12">
            <div className="hidden md:block shrink-0">
              <ShipLeftSVG />
            </div>

            <div className="flex flex-col items-center text-center min-w-0">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-energy-cyan/20 rounded-full scale-150" />
                <h1
                  className="relative font-display font-black text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-energy-cyan to-energy-blue text-glow tracking-wider"
                  style={{
                    textShadow:
                      '0 0 30px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.35), 0 4px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  星陨战术
                </h1>
              </div>
              <div className="mt-3 md:mt-5">
                <span className="font-display font-semibold text-sm md:text-lg tracking-[0.4em] text-ship-silver/80">
                  STAR FALL TACTICS
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-energy-cyan/50" />
                <Swords className="w-4 h-4 text-energy-cyan/70" />
                <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-energy-cyan/50" />
              </div>
            </div>

            <div className="hidden md:block shrink-0">
              <ShipRightSVG />
            </div>
          </div>

          <div className="relative z-20 flex flex-col sm:flex-row gap-4 mb-10">
            <Button
              size="lg"
              variant="primary"
              className="!px-10 !py-5 !text-lg animate-pulse-glow"
              onClick={() => navigate('/starmap')}
            >
              <Play className="w-5 h-5 mr-2" />
              开始游戏
            </Button>

            <Button
              size="lg"
              variant="primary"
              className="!px-10 !py-5 !text-lg"
              onClick={() => navigate('/fleet')}
            >
              <Users className="w-5 h-5 mr-2" />
              舰队编成
            </Button>

            <Button
              size="lg"
              variant="primary"
              disabled={!canContinue}
              className="!px-10 !py-5 !text-lg"
              onClick={() => {
                if (canContinue) {
                  navigate(`/battle/${battleStageId}`);
                }
              }}
            >
              <FolderOpen className="w-5 h-5 mr-2" />
              继续游戏
            </Button>

            <Button
              size="lg"
              variant="primary"
              className="!px-10 !py-5 !text-lg"
              onClick={() => navigate('/missions')}
            >
              <ScrollText className="w-5 h-5 mr-2" />
              任务日志
            </Button>
          </div>

          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            <button
              onClick={() => navigate('/crew')}
              className="group relative w-12 h-12 rounded-lg bg-space-800/70 backdrop-blur-md border border-energy-cyan/30 hover:border-energy-cyan hover:bg-energy-cyan/15 hover:shadow-glow transition-all flex items-center justify-center"
              title="舰员培养"
            >
              <UserRound className="w-5 h-5 text-ship-silver group-hover:text-energy-cyan transition-colors" />
              <ChevronRight className="w-3 h-3 text-energy-cyan opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-1 top-1" />
            </button>

            <button
              onClick={() => navigate('/warehouse')}
              className="group relative w-12 h-12 rounded-lg bg-space-800/70 backdrop-blur-md border border-energy-cyan/30 hover:border-energy-cyan hover:bg-energy-cyan/15 hover:shadow-glow transition-all flex items-center justify-center"
              title="装备仓库"
            >
              <Package className="w-5 h-5 text-ship-silver group-hover:text-energy-cyan transition-colors" />
              <ChevronRight className="w-3 h-3 text-energy-cyan opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-1 top-1" />
            </button>

            <button
              onClick={openSettingsModal}
              className="group relative w-12 h-12 rounded-lg bg-space-800/70 backdrop-blur-md border border-energy-cyan/30 hover:border-energy-cyan hover:bg-energy-cyan/15 hover:shadow-glow transition-all flex items-center justify-center"
              title="设置"
            >
              <Settings className="w-5 h-5 text-ship-silver group-hover:text-energy-cyan transition-colors" />
              <ChevronRight className="w-3 h-3 text-energy-cyan opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute right-1 top-1" />
            </button>
          </div>
        </main>

        <footer className="relative z-10 w-full pb-6 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs md:text-sm">
            <div className="font-display tracking-wider text-ship-gray/70">
              v1.0.0 · Star Fall Tactics
            </div>
            <div className="flex items-center gap-2 text-energy-cyan/80 animate-blink">
              <div className="w-1.5 h-1.5 rounded-full bg-energy-cyan shadow-[0_0_8px_#00D4FF]" />
              <span className="font-display tracking-wide">按任意键开始</span>
            </div>
            <div className="font-display tracking-wider text-ship-gray/70">
              © 2847 Galactic Federation
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


