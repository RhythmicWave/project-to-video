import type {ReactNode} from 'react';
import {Label, WrappedLabel} from './Systems';
import {c} from './theme';
import {pacing} from './pacing';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

/** 按明确时刻逐步出现；调用者负责保证 time 与 at 使用同一单位。 */
export const ProgressiveReveal = ({time, at, duration = pacing.reveal, children, x = 0, y = 0}: {
  time: number;
  at: number;
  duration?: number;
  children: ReactNode;
  x?: number;
  y?: number;
}) => {
  const progress = ease((time - at) / Math.max(duration, 0.001));
  return <g opacity={progress} transform={'translate(' + x + ' ' + (y + (1 - progress) * 12) + ')'}>{children}</g>;
};

/** 固定边界的因果步骤卡；动作和状态分开显示，避免只剩一个模块名。 */
export const CausalStep = ({x, y, width = 230, height = 108, time, at, label, action, state = 'idle', icon, active = false}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  time: number;
  at: number;
  label: string;
  action?: string;
  state?: 'idle' | 'active' | 'waiting' | 'done' | 'error';
  icon?: ReactNode;
  active?: boolean;
}) => {
  const accent = active ? c.teal : stateColor(state);
  return <ProgressiveReveal time={time} at={at} x={x} y={y}>
    <rect width={width} height={height} rx={14} fill={active ? '#203C3C' : c.surface} stroke={accent} strokeWidth={active ? 3 : 2}/>
    {icon && <g transform={'translate(28 ' + height / 2 + ') scale(.42)'}>{icon}</g>}
    <WrappedLabel x={icon ? 62 : 20} y={35} text={label} maxWidth={width - (icon ? 80 : 40)} maxLines={2} size={24} color={c.text}/>
    {action && <WrappedLabel x={icon ? 62 : 20} y={height - 29} text={action} maxWidth={width - (icon ? 80 : 40)} maxLines={1} size={17} color={c.muted}/>}
    {state !== 'idle' && <Label x={width - 18} y={24} size={16} anchor="end" color={accent}>{state}</Label>}
  </ProgressiveReveal>;
};

const stateColor = (state: 'idle' | 'active' | 'waiting' | 'done' | 'error') => {
  if (state === 'active') return c.teal;
  if (state === 'waiting') return c.gold;
  if (state === 'done') return c.blue;
  if (state === 'error') return c.red;
  return c.line;
};

export type DecisionBranch = {id: string; label: string; side: 'left' | 'right' | 'bottom'; color?: string};

/** 条件菱形和分支标签；分支后果与连线由场景显式绘制。 */
export const DecisionGate = ({x, y, width = 190, height = 118, time, at, condition, activeBranch, branches = []}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  time: number;
  at: number;
  condition: string;
  activeBranch?: string;
  branches?: DecisionBranch[];
}) => <ProgressiveReveal time={time} at={at} x={x} y={y}>
  <path d={'M' + width / 2 + ' 0 L' + width + ' ' + height / 2 + ' L' + width / 2 + ' ' + height + ' L0 ' + height / 2 + ' Z'} fill="#26354B" stroke={c.gold} strokeWidth={3}/>
  <WrappedLabel x={width / 2} y={height / 2 - 8} text={condition} maxWidth={width - 42} maxLines={2} size={21} anchor="middle"/>
  {branches.map(branch => {
    const color = branch.color ?? c.blue;
    const selected = activeBranch === branch.id;
    const branchX = branch.side === 'left' ? -18 : branch.side === 'right' ? width + 18 : width / 2;
    const branchY = branch.side === 'bottom' ? height + 38 : height / 2;
    const anchor = branch.side === 'left' ? 'end' : branch.side === 'right' ? 'start' : 'middle';
    return <g key={branch.id} opacity={activeBranch === undefined || selected ? 1 : .42}>
      <circle cx={branchX} cy={branchY} r={selected ? 8 : 5} fill={color}/>
      <WrappedLabel x={branchX + (branch.side === 'left' ? -14 : branch.side === 'right' ? 14 : 0)} y={branchY + (branch.side === 'bottom' ? 31 : 7)} text={branch.label} maxWidth={190} maxLines={2} size={18} color={selected ? color : c.muted} anchor={anchor}/>
    </g>;
  })}
</ProgressiveReveal>;

const MessageStack = ({x, y, width, rows, color, highlight}: {x: number; y: number; width: number; rows: string[]; color: string; highlight?: string}) => <g>
  <rect x={x} y={y} width={width} height={Math.max(130, rows.length * 38 + 45)} rx={12} fill="#1B3042" stroke={color} strokeWidth={2}/>
  {rows.slice(0, 5).map((row, index) => <WrappedLabel key={row + '-' + index} x={x + 18} y={y + 32 + index * 34} text={row} maxWidth={width - 36} maxLines={1} size={18} color={row === highlight ? c.gold : c.text}/>)}
</g>;

/** 以 before、插入/改变、after 三个阶段展示上下文或数据结构变化。 */
export const ContextTransform = ({x, y, time, at, duration = pacing.transform, before, inserted, after, width = 265, title = '结构变化'}: {
  x: number;
  y: number;
  time: number;
  at: number;
  duration?: number;
  before: string[];
  inserted: string;
  after: string[];
  width?: number;
  title?: string;
}) => {
  const progress = ease((time - at) / Math.max(duration, .001));
  const insertion = progress >= .35;
  const afterVisible = progress >= .72;
  return <g opacity={progress}>
    <Label x={x + width} y={y - 24} size={24}>{title}</Label>
    <MessageStack x={x} y={y} width={width} rows={before} color={c.blue}/>
    <g opacity={insertion ? 1 : .25}>
      <rect x={x + width + 32} y={y + 45} width={150} height={43} rx={9} fill={insertion ? '#4A3B28' : c.surface} stroke={c.gold} strokeWidth={2}/>
      <WrappedLabel x={x + width + 107} y={y + 72} text={inserted} maxWidth={130} maxLines={2} size={18} color={c.gold} anchor="middle"/>
    </g>
    <MessageStack x={x + width + 214} y={y} width={width} rows={after} color={c.teal} highlight={afterVisible ? inserted : undefined}/>
    <path d={'M' + (x + width + 8) + ' ' + (y + 66) + ' H' + (x + width + 24)} stroke={c.blue} strokeWidth={3}/>
    <path d={'M' + (x + width + 190) + ' ' + (y + 66) + ' H' + (x + width + 206)} stroke={c.teal} strokeWidth={3}/>
    <Label x={x + width + 16} y={y + 108 + Math.max(before.length, after.length) * 34} size={17} color={c.muted}>前后对象由调用者保持关联</Label>
  </g>;
};
