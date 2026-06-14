import { useState, useMemo, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Star,
  Check,
  Lock,
  Eye,
  ScrollText,
  BookOpen,
  Trophy,
  Package,
  Zap,
  ChevronRight,
  Play
} from 'lucide-react';
import { TopBar } from '../components/HUD/TopBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../store/useGameStore';
import { useUIGlobalStore } from '../store/useUIGlobalStore';
import { cn } from '../lib/utils';
import type { Mission, StoryNode, MissionType } from '../types';

type TabKey = 'main' | 'side' | 'story';

const MISSION_TYPE_LABEL: Record<MissionType, string> = {
  main: '主线',
  side: '支线',
  daily: '每日'
};

const TRACK_TYPE_LABEL: Record<string, string> = {
  stage_cleared: '关卡通关',
  ship_destroyed: '击毁敌舰',
  crew_recruited: '招募舰员',
  star_coins_earned: '星币获取',
  battle_won: '战斗胜利'
};

function ProgressBar({
  value,
  max,
  color = 'cyan'
}: {
  value: number;
  max: number;
  color?: 'cyan' | 'green' | 'yellow';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap: Record<string, string> = {
    cyan: 'from-energy-cyan to-energy-blue',
    green: 'from-life-green to-life-teal',
    yellow: 'from-danger-yellow to-danger-orange'
  };
  return (
    <div className="relative w-full h-2.5 rounded-full bg-space-800 overflow-hidden border border-space-600">
      <div
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-display font-bold text-white/90 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] tracking-wider">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}

function MissionCard({
  mission,
  onClaim
}: {
  mission: Mission;
  onClaim: () => void;
}) {
  const isMain = mission.type === 'main';
  const canClaim = mission.completed && !mission.claimed;

  return (
    <div
      className={cn(
        'relative hud-panel p-4 transition-all overflow-hidden',
        isMain && 'border-l-4 border-l-energy-cyan/70',
        mission.claimed && 'opacity-70',
        canClaim && 'animate-pulse-glow cursor-pointer hover:scale-[1.01]'
      )}
      onClick={canClaim ? onClaim : undefined}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10"
        style={{
          background: isMain
            ? 'radial-gradient(circle, #00D4FF 0%, transparent 70%)'
            : 'radial-gradient(circle, #9D6CFF 0%, transparent 70%)'
        }}
      />

      <div className="flex items-start justify-between gap-3 mb-3 relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-display font-bold tracking-wider',
                isMain
                  ? 'bg-energy-cyan/15 text-energy-cyan border border-energy-cyan/40'
                  : 'bg-energy-purple/15 text-energy-purple border border-energy-purple/40'
              )}
            >
              {MISSION_TYPE_LABEL[mission.type]}
            </span>
            {mission.claimed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display text-life-green bg-life-green/10 border border-life-green/40">
                <Check className="w-3 h-3" />
                已领取
              </span>
            )}
            {!mission.claimed && mission.completed && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display text-danger-yellow bg-danger-yellow/15 border border-danger-yellow/40 animate-blink">
                <Trophy className="w-3 h-3" />
                可领取
              </span>
            )}
          </div>
          <h4
            className={cn(
              'font-display font-black text-base tracking-wide truncate',
              mission.completed
                ? 'text-life-green text-glow'
                : 'text-white'
            )}
          >
            {mission.title}
          </h4>
        </div>
        {canClaim && (
          <div className="shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-danger-yellow/40 to-danger-orange/40 border border-danger-yellow/60 flex items-center justify-center shadow-[0_0_15px_rgba(255,201,60,0.4)]">
              <Package className="w-4 h-4 text-danger-yellow" />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-ship-silver/80 leading-relaxed mb-4">
        {mission.description}
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-energy-cyan" />
            <span className="text-[10px] font-display text-energy-cyan tracking-wider">
              {TRACK_TYPE_LABEL[mission.trackType] || mission.trackType}
            </span>
          </div>
          <span className="text-[10px] font-display text-ship-gray">
            {Math.floor((mission.progress / mission.target) * 100)}%
          </span>
        </div>
        <ProgressBar
          value={mission.progress}
          max={mission.target}
          color={mission.completed ? 'green' : 'cyan'}
        />
      </div>

      <div className="border-t border-energy-cyan/15 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3 h-3 text-danger-yellow shrink-0" />
          <span className="text-[10px] font-display text-ship-gray tracking-wider">
            任务奖励
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mission.rewards.starCoins && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-danger-yellow/10 border border-danger-yellow/30">
              <Star className="w-3 h-3 text-danger-yellow fill-danger-yellow/30" />
              <span className="text-[11px] font-display font-semibold text-danger-yellow">
                {mission.rewards.starCoins}
              </span>
            </div>
          )}
          {mission.rewards.exp && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-life-green/10 border border-life-green/30">
              <Zap className="w-3 h-3 text-life-green" />
              <span className="text-[11px] font-display font-semibold text-life-green">
                EXP {mission.rewards.exp}
              </span>
            </div>
          )}
          {mission.rewards.materials && mission.rewards.materials.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-energy-blue/10 border border-energy-blue/30">
              <Package className="w-3 h-3 text-energy-blue" />
              <span className="text-[11px] font-display font-semibold text-energy-blue">
                材料×{mission.rewards.materials.length}
              </span>
            </div>
          )}
          {mission.rewards.equipmentId && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-energy-purple/10 border border-energy-purple/30">
              <Zap className="w-3 h-3 text-energy-purple" />
              <span className="text-[11px] font-display font-semibold text-energy-purple">
                装备
              </span>
            </div>
          )}
          {mission.storyUnlock && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-danger-orange/10 border border-danger-orange/30">
              <BookOpen className="w-3 h-3 text-danger-orange" />
              <span className="text-[11px] font-display font-semibold text-danger-orange">
                解锁剧情
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryCard({
  story,
  onClick
}: {
  story: StoryNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={story.unlocked ? onClick : undefined}
      className={cn(
        'relative hud-panel p-4 transition-all overflow-hidden',
        story.unlocked && 'cursor-pointer hover:border-energy-cyan/50 hover:bg-energy-cyan/5',
        !story.unlocked && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {story.viewed ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display text-ship-silver bg-space-800 border border-ship-dark">
                <Eye className="w-3 h-3" />
                已观看
              </span>
            ) : story.unlocked ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display text-danger-yellow bg-danger-yellow/10 border border-danger-yellow/40 animate-blink">
                <Play className="w-3 h-3 fill-danger-yellow" />
                新剧情
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display text-ship-gray bg-space-800 border border-ship-dark">
                <Lock className="w-3 h-3" />
                未解锁
              </span>
            )}
          </div>
          <h4 className="font-display font-black text-lg text-white tracking-wide mb-1.5">
            {story.title}
          </h4>
          {story.speaker && (
            <p className="text-[11px] font-display text-ship-gray tracking-wider mb-2">
              旁白：{story.speaker}
            </p>
          )}
          <p className="text-xs text-ship-silver/80 leading-relaxed line-clamp-3 mb-3">
            {story.content[0]}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-display text-ship-gray tracking-wider">
              {story.content.length} 段剧情
            </span>
            {story.unlocked && (
              <span className="flex items-center gap-0.5 text-[10px] font-display text-energy-cyan">
                点击查看
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          {story.unlocked ? (
            <div
              className={cn(
                'w-12 h-12 rounded-lg border-2 flex items-center justify-center',
                story.viewed
                  ? 'border-ship-dark/60 bg-space-800/80'
                  : 'border-danger-yellow/50 bg-danger-yellow/10 shadow-[0_0_15px_rgba(255,201,60,0.25)]'
              )}
            >
              <BookOpen
                className={cn(
                  'w-6 h-6',
                  story.viewed ? 'text-ship-gray' : 'text-danger-yellow'
                )}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg border-2 border-dashed border-ship-gray/50 bg-space-900/60 flex items-center justify-center">
              <Lock className="w-5 h-5 text-ship-gray/60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Missions() {
  const navigate = useNavigate();
  const missions = useGameStore((s) => s.missions);
  const stories = useGameStore((s) => s.stories);
  const claimMission = useGameStore((s) => s.claimMission);
  const { openStoryModal, setCurrentStoryId } = useUIGlobalStore();

  const [activeTab, setActiveTab] = useState<TabKey>('main');

  const mainMissions = useMemo(
    () => missions.filter((m) => m.type === 'main'),
    [missions]
  );
  const sideMissions = useMemo(
    () => missions.filter((m) => m.type === 'side' || m.type === 'daily'),
    [missions]
  );

  const totalCompleted = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;

  const handleOpenStory = (story: StoryNode) => {
    setCurrentStoryId(story.id);
    openStoryModal(story.id);
  };

  const tabs: { key: TabKey; label: string; icon: ComponentType<{ className?: string }>; count: number }[] = [
    { key: 'main', label: '主线任务', icon: ScrollText, count: mainMissions.length },
    { key: 'side', label: '支线任务', icon: Trophy, count: sideMissions.length },
    { key: 'story', label: '剧情回放', icon: BookOpen, count: stories.length }
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-space overflow-hidden">
      <TopBar />

      <div className="relative z-10 p-4 md:p-6 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white text-glow tracking-wider mb-1">
              任务日志
            </h2>
            <p className="text-sm text-ship-silver/80 font-display tracking-wide">
              已完成 <span className="text-life-green font-semibold">{totalCompleted}</span> / {totalCount} 任务
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回主菜单
          </Button>
        </div>

        <div className="hud-panel p-1.5 mb-5 inline-flex">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative px-5 py-2.5 rounded-md font-display text-sm tracking-wider transition-all flex items-center gap-2',
                    isActive
                      ? 'bg-gradient-to-r from-energy-cyan/30 to-energy-blue/30 text-white border border-energy-cyan/50 shadow-glow'
                      : 'text-ship-silver hover:text-white hover:bg-energy-cyan/10 border border-transparent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-bold',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-space-800 text-ship-gray'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="animate-fade-in">
          {activeTab !== 'story' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(activeTab === 'main' ? mainMissions : sideMissions).map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onClaim={() => claimMission(mission.id)}
                />
              ))}
              {(activeTab === 'main' ? mainMissions : sideMissions).length === 0 && (
                <div className="md:col-span-2">
                  <Card>
                    <div className="py-16 text-center">
                      <ScrollText className="w-16 h-16 mx-auto text-ship-gray/40 mb-4" />
                      <p className="font-display text-ship-gray/60 tracking-wide">
                        暂无{activeTab === 'main' ? '主线' : '支线'}任务
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeTab === 'story' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => handleOpenStory(story)}
                />
              ))}
              {stories.length === 0 && (
                <div className="md:col-span-2 xl:col-span-3">
                  <Card>
                    <div className="py-16 text-center">
                      <BookOpen className="w-16 h-16 mx-auto text-ship-gray/40 mb-4" />
                      <p className="font-display text-ship-gray/60 tracking-wide">
                        暂无可播放的剧情
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hud-panel p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-energy-cyan/30 to-danger-yellow/30 border border-energy-cyan/50 flex items-center justify-center shadow-glow">
                <Trophy className="w-6 h-6 text-danger-yellow" />
              </div>
              <div>
                <div className="text-xs font-display text-ship-gray tracking-wider mb-1">
                  任务总进度
                </div>
                <div className="font-display font-black text-xl text-white tracking-wide">
                  已完成 {totalCompleted} / {totalCount} 任务
                </div>
              </div>
            </div>
            <div className="w-full sm:w-96">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-display text-ship-gray tracking-wider">
                <span>总进度</span>
                <span>{totalCount > 0 ? Math.floor((totalCompleted / totalCount) * 100) : 0}%</span>
              </div>
              <ProgressBar
                value={totalCompleted}
                max={Math.max(1, totalCount)}
                color="yellow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


