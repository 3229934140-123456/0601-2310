import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Coins, TrendingUp, Package, Award, RotateCcw, Home, Map, Users, Box, Scroll, ChevronRight, Sparkles, Trophy, Shield, Skull } from 'lucide-react';
import { StarField } from '../components/StarField';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MaterialItem } from '../components/MaterialItem';
import { useGameStore } from '../store/useGameStore';
import { useBattleStore } from '../store/battleStore';
import { getRarityColor } from '../utils/rarityColors';

export function BattleResult() {
  const navigate = useNavigate();
  const { lastBattleResult, stages, missions, updateMissionProgress, claimMission } = useGameStore();
  const { resetBattle } = useBattleStore();

  const result = lastBattleResult;
  const stage = useMemo(() => stages.find((s) => s.id === result?.stageId), [stages, result]);

  useEffect(() => {
    return () => {
      // 离开时清理战斗状态
    };
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen w-full bg-gradient-space relative">
        <StarField />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <Card className="max-w-md text-center p-8">
            <Skull className="w-16 h-16 mx-auto text-danger-red mb-4" />
            <h2 className="font-display font-black text-2xl text-white mb-3">没有找到战斗记录</h2>
            <p className="text-ship-silver mb-6">请先完成一场战斗再查看结算</p>
            <Button onClick={() => navigate('/starmap')}><Home className="w-4 h-4 mr-2" />返回星图</Button>
          </Card>
        </div>
      </div>
    );
  }

  const { victory, rewards, starRating, turns, totalDamageDealt, totalDamageTaken, enemiesDestroyed, totalEnemies, shipsSurvived, totalShips } = result;
  const autoClaimMissions = missions.filter((m) => m.completed && !m.claimed).slice(0, 3);

  const survivalRate = totalShips > 0 ? Math.round(shipsSurvived / totalShips * 100) : 0;
  const dmgScore = Math.min(5, Math.max(1, Math.floor(totalDamageDealt / 5000)));
  const survivalScore = survivalRate >= 100 ? 5 : survivalRate >= 75 ? 3 : survivalRate >= 50 ? 2 : 1;
  const turnScore = turns <= 5 ? 5 : turns <= 10 ? 3 : turns <= 15 ? 2 : 1;
  const totalScore = Math.round((dmgScore + survivalScore + turnScore + starRating) / 3);
  const ratingLetter = ['D', 'C', 'B', 'A', 'S'][Math.min(4, Math.max(0, totalScore - 1))];

  const handleRematch = () => {
    resetBattle();
    navigate(`/battle/${result.stageId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-space relative overflow-hidden">
      <StarField />

      {/* 顶部粒子/装饰 */}
      <div className="pointer-events-none absolute inset-0">
        {victory && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-30 animate-spin-slow">
            <div className="absolute inset-0 rounded-full border border-energy-cyan/30" />
            <div className="absolute inset-10 rounded-full border border-life-green/20" />
            <div className="absolute inset-20 rounded-full border border-danger-yellow/15" />
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* 顶部标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full mb-5 border ${
            victory ? 'border-life-green/50 bg-life-green/10' : 'border-danger-red/50 bg-danger-red/10'
          }`}>
            {victory ? (
              <Trophy className="w-6 h-6 text-danger-yellow animate-float" />
            ) : (
              <Skull className="w-6 h-6 text-danger-red" />
            )}
            <span className={`font-display font-black text-3xl tracking-wider ${
              victory ? 'text-life-green text-glow' : 'text-danger-red'
            }`}>
              {victory ? '战斗胜利' : '战斗失败'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                className={`w-12 h-12 transition-all duration-700 ${
                  i <= starRating
                    ? 'text-danger-yellow fill-danger-yellow drop-shadow-[0_0_12px_rgba(255,201,60,0.7)] scale-100'
                    : 'text-ship-gray/40 scale-90'
                }`}
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            {stage?.name || '未知区域'} · 第 {turns} 回合结束
          </h1>
        </div>

        {/* 奖励卡片 */}
        <Card className={`p-6 mb-6 animate-slide-up border-2 ${
          victory ? 'border-life-green/30' : 'border-danger-red/30'
        }`}>
          <div className="flex items-center gap-2 mb-5 border-b border-ship-dark pb-3">
            <Award className="w-6 h-6 text-energy-cyan" />
            <h3 className="font-display font-bold text-xl text-white">作战奖励</h3>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-6">
            {/* 星币 */}
            <div className="hud-panel p-5 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-danger-yellow/20 to-danger-orange/20 border border-danger-yellow/40 mb-3 animate-float">
                <Coins className="w-9 h-9 text-danger-yellow" />
              </div>
              <div className="text-xs text-ship-silver font-display tracking-wider mb-1">获得星币</div>
              <div className="font-display font-black text-4xl text-danger-yellow text-glow">
                +{rewards.starCoins.toLocaleString()}
              </div>
            </div>

            {/* 经验 */}
            <div className="hud-panel p-5 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-life-green/20 to-life-teal/20 border border-life-green/40 mb-3 animate-float" style={{ animationDelay: '0.3s' }}>
                <TrendingUp className="w-9 h-9 text-life-green" />
              </div>
              <div className="text-xs text-ship-silver font-display tracking-wider mb-1">获得经验</div>
              <div className="font-display font-black text-4xl text-life-green text-glow">
                +{rewards.exp.toLocaleString()}
              </div>
            </div>

            {/* 回合数 */}
            <div className="hud-panel p-5 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-energy-cyan/20 to-energy-blue/20 border border-energy-cyan/40 mb-3 animate-float" style={{ animationDelay: '0.6s' }}>
                <Shield className="w-9 h-9 text-energy-cyan" />
              </div>
              <div className="text-xs text-ship-silver font-display tracking-wider mb-1">作战回合</div>
              <div className="font-display font-black text-4xl text-energy-cyan text-glow">
                {turns}
              </div>
            </div>
          </div>

          {/* 材料掉落 */}
          {(rewards.materials.length > 0 || rewards.equipments.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-energy-purple" />
                <h4 className="font-display font-bold text-ship-silver">战利品</h4>
              </div>
              <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-space-900/60 border border-ship-dark/60">
                {rewards.materials.length > 0 && rewards.materials.map((m, i) => (
                  <div key={i} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <MaterialItem
                      material={{
                        id: m.id,
                        name: m.name,
                        rarity: (i % 4 + 1) as 1 | 2 | 3 | 4,
                        quantity: m.quantity,
                        icon: ['◆', '▲', '●', '■'][i % 4],
                        description: '',
                      }}
                      showName
                      size="md"
                    />
                    <div className="mt-1.5 font-display font-bold text-life-green">x{m.quantity}</div>
                  </div>
                ))}
                {rewards.equipments.map((eq, i) => (
                  <div
                    key={`eq_${i}`}
                    className="p-3 rounded-lg border flex flex-col items-center"
                    style={{ borderColor: getRarityColor(eq.rarity) }}
                  >
                    <Box className="w-10 h-10" style={{ color: getRarityColor(eq.rarity) }} />
                    <div className="text-xs font-display mt-1">{eq.name}</div>
                    <Sparkles className="w-4 h-4 text-life-green mt-1" />
                  </div>
                ))}
                {rewards.materials.length === 0 && rewards.equipments.length === 0 && (
                  <div className="text-ship-silver italic text-sm py-4 w-full text-center">本次战斗未掉落额外物资</div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* 任务完成提示 */}
        {autoClaimMissions.length > 0 && (
          <div style={{ animationDelay: '100ms' }}>
            <Card className="p-5 mb-6 border-2 border-life-green/30 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Scroll className="w-5 h-5 text-life-green" />
              <h3 className="font-display font-bold text-xl text-white">任务进度更新</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {autoClaimMissions.map((m) => (
                <div key={m.id} className="hud-panel p-3">
                  <div className="text-xs font-display text-energy-cyan mb-1">
                    {m.type === 'main' ? '主线任务' : m.type === 'side' ? '支线任务' : '每日任务'}
                  </div>
                  <div className="font-display font-bold text-white mb-1">{m.title}</div>
                  <div className="text-xs text-ship-silver mb-2 line-clamp-2">{m.description}</div>
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full"
                    onClick={() => { claimMission(m.id); }}
                  >
                    <Award className="w-3 h-3 mr-1" />领取奖励
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          </div>
        )}

        {/* 战损统计 */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-danger-yellow" />
            <h3 className="font-display font-bold text-xl text-white">战绩统计</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '击毁敌舰', value: `${enemiesDestroyed}/${totalEnemies}`, color: 'text-danger-red', icon: Skull },
              { label: '总伤害量', value: totalDamageDealt.toLocaleString(), color: 'text-danger-orange', icon: TrendingUp },
              { label: '舰队存活率', value: `${survivalRate}%`, color: 'text-life-green', icon: Shield },
              { label: '战术评分', value: ratingLetter, color: 'text-danger-yellow', icon: Award },
            ].map((item, i) => {
              const Ic = item.icon;
              return (
                <div key={i} className="text-center p-4 rounded-lg bg-space-900/60 border border-ship-dark/60">
                  <Ic className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                  <div className="text-xs text-ship-silver mb-0.5 font-display">{item.label}</div>
                  <div className={`font-display font-black text-2xl ${item.color}`}>{item.value}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button variant="ghost" onClick={() => navigate('/')}><Home className="w-4 h-4 mr-1" />主菜单</Button>
          <Button variant="ghost" onClick={() => navigate('/missions')}><Scroll className="w-4 h-4 mr-1" />任务日志</Button>
          <Button variant="ghost" onClick={() => navigate('/crew')}><Users className="w-4 h-4 mr-1" />舰员培养</Button>
          <Button variant="ghost" onClick={() => navigate('/warehouse')}><Box className="w-4 h-4 mr-1" />装备仓库</Button>
          <Button variant="primary" onClick={handleRematch}><RotateCcw className="w-4 h-4 mr-1" />再战一次</Button>
          <Button variant="success" onClick={() => navigate('/starmap')} className="animate-pulse-glow">
            <Map className="w-4 h-4 mr-1" />继续征程<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="text-center mt-8 text-xs text-ship-silver font-display tracking-wider">
          ⚠ 战斗档案已自动归档 · 可前往【任务日志 - 战斗历史】查看详情
        </div>
      </div>
    </div>
  );
}
