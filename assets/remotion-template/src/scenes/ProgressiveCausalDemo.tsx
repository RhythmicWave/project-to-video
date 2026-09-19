import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Agent, Label, Model, Paper, Toolbox} from '../visual/Systems';
import {CausalStep, ContextTransform, DecisionGate} from '../visual/Progressive';
import {Transfer} from '../visual/Behaviors';
import {c} from '../visual/theme';

export const ProgressiveCausalDemo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  return <AbsoluteFill style={{background: c.bg, fontFamily: '"Microsoft YaHei", sans-serif'}}>
    <svg viewBox="0 0 1280 720">
      {time < 12 ? <g>
        <Label x={54} y={62} size={31} anchor="start">递进因果：检查 → 分支 → 结果</Label>
        <Agent x={120} y={280} r={54} label="执行者" phase={time / 5}/>
        <CausalStep x={240} y={226} time={time} at={1.2} label="能力注册表" action="查找可用操作" state={time > 2.5 ? 'done' : 'active'} active={time > 1.2} />
        <Transfer points={[[178,280],[226,280]]} time={time} start={.8} end={1.5} label="调用"/>
        <DecisionGate x={535} y={220} time={time} at={3.1} condition="需要额外检查？" activeBranch={time > 5 ? 'review' : undefined} branches={[
          {id: 'safe', label: '直接继续', side: 'right', color: c.teal},
          {id: 'review', label: '进入审批', side: 'bottom', color: c.gold},
        ]}/>
        <Transfer points={[[470,280],[525,280]]} time={time} start={2.7} end={3.5} label="检查"/>
        <CausalStep x={790} y={178} time={time} at={5.1} label="继续执行" action="结果返回" state={time > 8 ? 'done' : 'active'} active={time > 5.1} icon={<Toolbox x={0} y={0} scale={1}/>} />
        <CausalStep x={790} y={390} time={time} at={6.3} label="人工审批" action="批准 / 拒绝" state={time > 8.7 ? 'waiting' : 'idle'} active={time > 6.3} />
        <Transfer points={[[630,338],[740,432]]} time={time} start={5.6} end={6.7} label="高风险" routing="free"/>
        <Transfer points={[[740,432],[630,338],[470,280]]} time={time} start={9} end={10.5} label="重新规划" color={c.red} routing="free"/>
      </g> : <g>
        <Label x={54} y={62} size={31} anchor="start">前后对照：提醒被注入当前输入</Label>
        <Agent x={115} y={275} r={54} label="下一轮执行" phase={time / 8}/>
        <ContextTransform x={220} y={160} time={time} at={12.8} before={['用户目标', '历史结果']} inserted="提醒 / 约束" after={['用户目标', '提醒 / 约束', '历史结果']} title="输入结构变化" />
        <Transfer points={[[170,275],[205,275]]} time={time} start={12.4} end={13} label="准备"/>
        <Model x={1035} y={275} scale={.72} label="模型输入"/>
        <Transfer points={[[835,275],[955,275]]} time={time} start={16.5} end={18} label="送入模型" color={c.teal}/>
        <Paper x={1020} y={470} scale={.55} label="下一步结果" lines={3}/>
        <Transfer points={[[1035,350],[1035,415]]} time={time} start={19} end={20.2} label="结果" color={c.blue}/>
        <Label x={640} y={650} size={20} color={c.muted}>教学时间用于建立因果，不代表真实延迟</Label>
      </g>}
    </svg>
  </AbsoluteFill>;
};
