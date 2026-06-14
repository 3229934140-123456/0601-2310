import { useNavigate } from 'react-router-dom';
import { Home, Settings, Volume2, VolumeX, Star, User } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useUIGlobalStore } from '@/store/useUIGlobalStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tooltip } from '@/components/ui/Tooltip';

export function TopBar() {
  const navigate = useNavigate();
  const profile = useGameStore((s) => s.profile);
  const { openSettingsModal, soundEnabled, toggleSound } = useUIGlobalStore();

  const handleHome = () => {
    navigate('/');
  };

  return (
    <header className="relative z-40 w-full px-4 py-3 bg-gradient-to-r from-space-950/90 via-space-900/90 to-space-950/90 backdrop-blur-xl border-b border-energy-cyan/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-energy-cyan/60 to-transparent" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-energy-cyan/30 to-energy-purple/30 border border-energy-cyan/50 flex items-center justify-center shadow-glow">
              <User className="w-5 h-5 text-energy-cyan" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-base truncate">
                  {profile.name}
                </span>
                <span className="px-2 py-0.5 text-xs font-display font-semibold text-energy-cyan bg-energy-cyan/10 rounded border border-energy-cyan/30">
                  Lv.{profile.level}
                </span>
              </div>
              <div className="w-48 mt-1">
                <ProgressBar
                  value={profile.exp}
                  max={profile.maxExp}
                  color="energy"
                  height="sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-800/80 border border-danger-yellow/30">
            <Star className="w-5 h-5 text-danger-yellow fill-danger-yellow/30" />
            <span className="font-display font-bold text-danger-yellow text-base">
              {profile.starCoins.toLocaleString()}
            </span>
          </div>

          <div className="h-8 w-px bg-ship-dark mx-1" />

          <Tooltip content="返回主菜单">
            <button
              onClick={handleHome}
              className="p-2.5 rounded-lg text-ship-silver hover:text-white hover:bg-energy-cyan/10 hover:border-energy-cyan/40 border border-transparent transition-all"
            >
              <Home className="w-5 h-5" />
            </button>
          </Tooltip>

          <Tooltip content="设置">
            <button
              onClick={openSettingsModal}
              className="p-2.5 rounded-lg text-ship-silver hover:text-white hover:bg-energy-cyan/10 hover:border-energy-cyan/40 border border-transparent transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </Tooltip>

          <Tooltip content={soundEnabled ? '关闭音效' : '开启音效'}>
            <button
              onClick={toggleSound}
              className="p-2.5 rounded-lg text-ship-silver hover:text-white hover:bg-energy-cyan/10 hover:border-energy-cyan/40 border border-transparent transition-all"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}


