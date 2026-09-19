import type {ReactNode} from 'react';
import {Label} from './Systems';
import {Transfer} from './Behaviors';
import {fitBox, mapPoint, port} from './geometry';
import type {Box, Point} from './geometry';
import {c} from './theme';
import {pacing} from './pacing';

export type Instance = {id: string; label: string; state?: string; icon?: ReactNode};

/** 先给候选集合，再显示选择；实例状态由调用者提供，不由选中态推导。 */
export const InstanceSelection = ({instances, selectedId, time, selectAt, width = 900, rowHeight = 78, label = '可用实例'}: {
  instances: Instance[]; selectedId?: string; time: number; selectAt: number;
  width?: number; rowHeight?: number; label?: string;
}) => <g>
  <Label x={0} y={26} size={25} anchor="start">{label}</Label>
  {instances.map((item, i) => {
    const selected = time >= selectAt && item.id === selectedId;
    return <g key={item.id} transform={`translate(0 ${52 + i * rowHeight})`}>
      <rect width={width} height={rowHeight - 12} rx={12} fill={selected ? '#29413F' : c.surface} stroke={selected ? c.teal : c.line} strokeWidth={selected ? 3 : 1.5}/>
      <path d="M15 23 L25 33 L42 15" stroke={c.teal} strokeWidth={4} fill="none" opacity={selected ? 1 : 0}/>
      <g transform="translate(77 28)">{item.icon}</g>
      <Label x={item.icon ? 123 : 62} y={37} size={23} anchor="start">{item.label}</Label>
      <Label x={width - 190} y={37} size={19} anchor="end" color={c.muted}>{item.state ?? ''}</Label>
      <Label x={width - 20} y={37} size={20} anchor="end" color={selected ? c.teal : c.muted}>{selected ? '本次选择' : ''}</Label>
    </g>;
  })}
</g>;

/** 同一全景连续缩入角落，锚点转换后引出局部窗口；连线表示讲解定位。 */
export const OverviewDetail = ({time, start, duration = pacing.focus, overview, detail, source, full, mini, detailBox, focus, title = '局部展开'}: {
  time: number; start: number; duration?: number; overview: ReactNode; detail: ReactNode;
  source: Box; full: Box; mini: Box; detailBox: Box; focus: Point; title?: string;
}) => {
  const linear = duration > 0 ? Math.max(0, Math.min(1, (time - start) / duration)) : Number(time >= start);
  const p = linear * linear * (3 - 2 * linear);
  const a = fitBox(source, full), b = fitBox(source, mini);
  const transform = {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, scale: a.scale + (b.scale - a.scale) * p};
  const anchor = mapPoint(focus, transform), target = port(detailBox, 'left', .13);
  const miniEdge = mini.x + mini.width;
  const opacity = Math.max(0, (p - .8) / .2);
  return <g>
    <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>{overview}</g>
    <g opacity={opacity}>
      <circle cx={anchor[0]} cy={anchor[1]} r={13} fill="none" stroke={c.gold} strokeWidth={3}/>
      <Transfer points={[anchor, [miniEdge + 20, anchor[1]], [target[0] - 22, target[1]], target]} time={-1} start={0} end={1} color={c.gold}/>
      <rect {...detailBox} rx={16} fill={c.bg} stroke={c.line} strokeWidth={2}/>
      <Label x={detailBox.x + 22} y={detailBox.y + 35} size={24} anchor="start">{title}</Label>
      <g transform={`translate(${detailBox.x + 22} ${detailBox.y + 65})`}>{detail}</g>
    </g>
  </g>;
};

export type Branch = {id: string; label: string; start: number; end: number};

/** 重叠泳道明确表达独立推进；all 模式在最晚完成后汇合，independent 不生成屏障。 */
export const ParallelLanes = ({branches, time, join = 'all', width = 1000, rowHeight = 85}: {
  branches: Branch[]; time: number; join?: 'all' | 'independent'; width?: number; rowHeight?: number;
}) => {
  if (!branches.length) return null;
  if (branches.some(b => !Number.isFinite(b.start) || !Number.isFinite(b.end) || b.end <= b.start)) throw new Error('Branch end must follow start');
  const begin = Math.min(...branches.map(b => b.start)), finish = Math.max(...branches.map(b => b.end));
  const x = (t: number) => 185 + (width - 375) * Math.max(0, Math.min(1, (t - begin) / (finish - begin)));
  const done = branches.every(b => time >= b.end);
  const bottom = 45 + (branches.length - 1) * rowHeight;
  return <g>
    {branches.map((branch, i) => {
      const started = time >= branch.start, finished = time >= branch.end;
      return <g key={branch.id} transform={`translate(0 ${i * rowHeight})`}>
        <Label x={0} y={53} size={23} anchor="start">{branch.label}</Label>
        <path d={`M${x(branch.start)} 45 H${x(branch.end)}`} stroke={c.line} strokeWidth={12} strokeLinecap="round"/>
        {started && <path d={`M${x(branch.start)} 45 H${x(Math.min(time, branch.end))}`} stroke={finished ? c.teal : c.blue} strokeWidth={8} strokeLinecap="round"/>}
        <Label x={width - 170} y={53} size={20} color={finished ? c.teal : c.muted}>{finished ? '完成' : started ? '执行中' : '待开始'}</Label>
      </g>;
    })}
    {join === 'all' && <g>
      {branches.map((b,i)=><path key={b.id} d={`M${width-115} ${45+i*rowHeight} H${width-65}`} stroke={time>=b.end?c.teal:c.line} strokeWidth={2}/>)}
      <path d={`M${width-65} 45 V${bottom+45}`} stroke={done?c.teal:c.line} strokeWidth={3}/>
      <Label x={width-170} y={bottom+90} size={22} color={done?c.teal:c.gold}>{done?'全部完成 → 继续':'等待所有分支'}</Label>
    </g>}
    <Label x={185} y={bottom + 90} size={18} anchor="start" color={c.muted}>时间比例示意</Label>
  </g>;
};
