import {c} from './theme';

export type ResourceState = 'idle' | 'active' | 'blocked' | 'error' | 'done';
const accentFor = (state: ResourceState) => state === 'error' ? c.red : state === 'blocked' ? c.gold : state === 'done' ? c.teal : state === 'active' ? c.blue : c.muted;
const text = (x: number, y: number, value: string, size = 24, fill = c.text, anchor: 'start' | 'middle' | 'end' = 'middle') => <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}>{value}</text>;
type Position = {x: number; y: number; scale?: number};

/** 服务/执行进程。局部图形边界 [-100,-72,200,144]；标签另占 y=106。 */
export const WorkerRack = ({x, y, scale = 1, label, state = 'idle'}: Position & {label: string; state?: ResourceState}) => {
  const color = accentFor(state);
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-100} y={-72} width={200} height={144} rx={20} fill={c.surface} stroke={color} strokeWidth={3}/>
    {[0, 1, 2].map(i => <g key={i} transform={`translate(0 ${-48 + i * 48})`}>
      <rect x={-79} y={-15} width={158} height={30} rx={7} fill="#243C4C"/>
      <circle cx={-60} r={5} fill={color}/>
      <path d="M-42 0 H20 M38 -4 V4 M48 -4 V4 M58 -4 V4" stroke={color} strokeWidth={3} strokeLinecap="round"/>
    </g>)}
    {state === 'blocked' && <path d="M-9 -15 V15 M9 -15 V15" stroke={c.gold} strokeWidth={7}/>}
    {state === 'error' && <path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke={c.red} strokeWidth={6}/>}
    {text(0, 110, label, 26, color)}
  </g>;
};

export type StreamEntry = {id: string; label: string; state?: 'pending' | 'selected' | 'marked'};
/** 可见消息片段；marked 仅表示调用者给定的标记，不能推断持久化或 exactly-once。 */
export const EventRail = ({x, y, scale = 1, label, entries, width = 460}: Position & {label: string; entries: StreamEntry[]; width?: number}) => {
  if (entries.length > 5 || new Set(entries.map(e => e.id)).size !== entries.length) throw new Error('EventRail requires at most five entries with unique ids');
  const cell = (width - 32) / Math.max(1, entries.length);
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect width={width} height={144} rx={20} fill={c.surface} stroke={c.purple} strokeWidth={3}/>
    <path d={`M16 108 H${width - 16}`} stroke={c.purple} strokeWidth={2}/>
    {entries.map((e, i) => <g key={e.id} transform={`translate(${16 + cell * i} 18)`}>
      <rect width={cell - 10} height={76} rx={10} fill={e.state === 'selected' ? '#403350' : '#223445'} stroke={e.state === 'selected' ? c.gold : c.purple} strokeWidth={2}/>
      {text((cell - 10) / 2, 28, e.id, 20, c.purple)}
      {text((cell - 10) / 2, 58, e.label, 20)}
      {e.state === 'marked' && <path d={`M${cell / 2 - 16} 117 l8 8 l15 -19`} fill="none" stroke={c.teal} strokeWidth={3}/>} 
    </g>)}
    {text(width / 2, 183, label, 26, c.purple)}
  </g>;
};

/** 快照容器；fresh/expired 是时效状态，不生成缓存读取/降级行为。 */
export const SnapshotStack = ({x, y, scale = 1, label, generation, rows, freshness = 'fresh', width = 340}: Position & {label: string; generation: string; rows: string[]; freshness?: 'fresh' | 'expired'; width?: number}) => {
  if (rows.length > 4) throw new Error('SnapshotStack supports at most four visible rows');
  const color = freshness === 'fresh' ? c.teal : c.gold;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={16} y={-16} width={width} height={226} rx={16} fill="#1B303D" stroke={c.line} strokeWidth={2}/>
    <rect x={8} y={-8} width={width} height={226} rx={16} fill="#203A46" stroke={c.line} strokeWidth={2}/>
    <rect width={width} height={226} rx={16} fill={c.surface} stroke={color} strokeWidth={3}/>
    {text(22, 41, generation, 24, color, 'start')}
    <circle cx={width - 32} cy={32} r={12} fill="none" stroke={color} strokeWidth={2}/>
    <path d={`M${width - 32} 24 V32 L${width - 26} 36`} fill="none" stroke={color} strokeWidth={2}/>
    {rows.map((row, i) => <g key={i}>
      <rect x={20} y={61 + i * 36} width={width - 40} height={28} rx={6} fill="#233E4A"/>
      {text(32, 82 + i * 36, row, 21, c.text, 'start')}
    </g>)}
    {text(width / 2, 265, label, 26, color)}
  </g>;
};

/** 租约凭证；remaining 为 0..1。调用者提供 holder/status/时间，组件不提供互斥保证。 */
export const LeaseBadge = ({x, y, scale = 1, label, holder, remaining, status = 'held', width = 360}: Position & {label: string; holder: string; remaining: number; status?: 'held' | 'expired' | 'lost'; width?: number}) => {
  if (!Number.isFinite(remaining) || remaining < 0 || remaining > 1) throw new Error('LeaseBadge.remaining must be 0..1');
  const color = status === 'held' ? c.teal : status === 'lost' ? c.red : c.gold;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect width={width} height={180} rx={20} fill={c.surface} stroke={color} strokeWidth={3}/>
    <path d="M30 53 V37 C30 12 76 12 76 37 V53" fill="none" stroke={color} strokeWidth={4}/>
    <rect x={23} y={49} width={60} height={48} rx={10} fill="#254238" stroke={color} strokeWidth={3}/>
    <circle cx={53} cy={70} r={5} fill={color}/><path d="M53 70 V83" stroke={color} strokeWidth={3}/>
    {text(102, 47, label, 24, color, 'start')}
    {text(102, 84, holder, 26, c.text, 'start')}
    <rect x={24} y={118} width={width - 48} height={12} rx={6} fill={c.line}/>
    <rect x={24} y={118} width={(width - 48) * remaining} height={12} rx={6} fill={color}/>
    {text(width / 2, 159, status === 'held' ? '持有租约' : status === 'lost' ? '失去租约' : '租约过期', 21, color)}
  </g>;
};

export type WriteRow = {label: string; before: string; after: string};
/** 事务写集合：共同提交/回滚，只适用于同一事务边界内的写入。 */
export const AtomicWriteSet = ({x, y, scale = 1, label, rows, phase, width = 720}: Position & {label: string; rows: WriteRow[]; phase: 'before' | 'prepared' | 'committed' | 'aborted'; width?: number}) => {
  if (rows.length < 1 || rows.length > 4) throw new Error('AtomicWriteSet requires one to four rows');
  const color = phase === 'committed' ? c.teal : phase === 'aborted' ? c.red : c.gold;
  const height = 120 + rows.length * 74;
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect width={width} height={height} rx={22} fill={c.surface} stroke={color} strokeWidth={3}/>
    {text(28, 43, label, 28, color, 'start')}
    {rows.map((row, i) => <g key={i} transform={`translate(24 ${66 + i * 74})`}>
      <rect width={width - 48} height={58} rx={10} fill="#203746"/>
      {text(18, 37, row.label, 25, c.muted, 'start')}
      {text(width - 72, 37, phase === 'committed' || phase === 'prepared' ? row.after : row.before, 28, phase === 'committed' ? c.teal : c.text, 'end')}
    </g>)}
    {text(width / 2, height - 24, phase === 'committed' ? 'COMMIT · 共同生效' : phase === 'aborted' ? 'ROLLBACK · 保留原状态' : phase === 'prepared' ? '事务内写入 · 等待提交' : '写入前状态', 24, color)}
  </g>;
};
