import type {ReactNode} from 'react';
import {Label,Payload} from './Systems';
import {assertOrthogonalRoute,routeOrthogonal} from './geometry';
import type {Box, Side} from './geometry';
import {c} from './theme';

type Point=[number,number];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));

/** SVG 折线及可选载荷；时间单位由调用者统一，出发和到达必须满足 end > start。 */
export const Transfer=({points,time,start,end,label,color=c.blue,showPath=true,opacity=1,routing='orthogonal'}:{points:Point[];time:number;start:number;end:number;label?:string;color?:string;showPath?:boolean;opacity?:number;routing?:'orthogonal'|'free'})=>{
  if(routing==='orthogonal')assertOrthogonalRoute(points);
  if(points.length<2||end<=start)return null;
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  const total=lengths.reduce((a,b)=>a+b,0);
  if(total===0)return null;
  let distance=clamp((time-start)/(end-start))*total;
  let pos=points[0];
  for(let i=0;i<lengths.length;i++){
    if(distance<=lengths[i]||i===lengths.length-1){const q=lengths[i]?distance/lengths[i]:0;pos=[points[i][0]+(points[i+1][0]-points[i][0])*q,points[i][1]+(points[i+1][1]-points[i][1])*q];break;}
    distance-=lengths[i];
  }
  const last=points[points.length-1],previous=[...points.slice(0,-1)].reverse().find(p=>p[0]!==last[0]||p[1]!==last[1])!;
  const angle=Math.atan2(last[1]-previous[1],last[0]-previous[0])*180/Math.PI;
  return <g opacity={opacity}>
    {showPath&&<><path d={points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ')} stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round"/><path d="M-10 -6 L0 0 L-10 6" transform={`translate(${last.join(' ')}) rotate(${angle})`} fill="none" stroke={color} strokeWidth={3}/></>}
    {time>=start&&time<=end&&<Payload x={pos[0]} y={pos[1]} label={label} small={!label} color={color}/>}
  </g>;
};

type ConnectionEndpoint = {box: Box; side: Side; fraction?: number};

/** 从节点边界端口生成正交连线；反馈路径可指定专用 channel 避开其它节点。 */
export const Connect = ({from, to, time, start, end, label, color = c.blue, channelY, channelX, showPath = true, opacity = 1}: {
  from: ConnectionEndpoint;
  to: ConnectionEndpoint;
  time: number;
  start: number;
  end: number;
  label?: string;
  color?: string;
  channelY?: number;
  channelX?: number;
  showPath?: boolean;
  opacity?: number;
}) => <Transfer
  points={routeOrthogonal({
    fromBox: from.box,
    fromSide: from.side,
    fromFraction: from.fraction,
    toBox: to.box,
    toSide: to.side,
    toFraction: to.fraction,
    channelY,
    channelX,
  })}
  time={time}
  start={start}
  end={end}
  label={label}
  color={color}
  showPath={showPath}
  opacity={opacity}
  routing="orthogonal"
/>;

/** 挂起的任务、可继续工作的旁路与恢复信号；绝不自动推断项目是否具备并发。 */
export const AwaitResume=({time,start,waitAt,resumeAt,end,task='任务',other='其他工作',signal='结果到达',width=820}:{time:number;start:number;waitAt:number;resumeAt:number;end:number;task?:string;other?:string;signal?:string;width?:number})=>{
  if(!(start<waitAt&&waitAt<resumeAt&&resumeAt<end))return null;
  const x=(t:number)=>150+(width-190)*clamp((t-start)/(end-start));
  const waiting=time>=waitAt&&time<resumeAt;
  const cursor=time<waitAt?x(time):waiting?x(waitAt):x(time);
  return <g>
    <Label x={0} y={48} anchor="start" size={22}>{task}</Label>
    <Label x={0} y={160} anchor="start" size={22} color={c.muted}>{other}</Label>
    <path d={`M150 40 H${width-40} M150 152 H${width-40}`} stroke={c.line} strokeWidth={3}/>
    <path d={`M${x(waitAt)} 40 H${x(resumeAt)}`} stroke={c.gold} strokeWidth={5} strokeDasharray="5 7"/>
    <Label x={(x(waitAt)+x(resumeAt))/2} y={14} size={21} color={c.gold}>{time>=resumeAt?'恢复':'等待'}</Label>
    {time>=start&&<><circle cx={cursor} cy={40} r={10} fill={waiting?c.gold:c.teal}/><circle cx={x(time)} cy={152} r={8} fill={c.blue}/></>}
    <path d={`M${x(resumeAt)} 210 V50`} stroke={c.teal} strokeWidth={2} strokeDasharray="5 6" opacity={time>=resumeAt?1:.3}/>
    <path d={`M${x(resumeAt)-6} 58 L${x(resumeAt)} 49 L${x(resumeAt)+6} 58`} stroke={c.teal} fill="none"/>
    <Label x={x(resumeAt)} y={240} size={22} color={time>=resumeAt?c.teal:c.muted}>{signal}</Label>
  </g>;
};

type Phase={id:string;label:string};
type Beat={at:number;phaseId:string};
/** 按调用者给出的阶段序列强调循环；重复阶段需显式给出，结束后不自行循环。 */
export const PhaseLoop=({phases,beats,time,radius=145,children}:{phases:Phase[];beats:Beat[];time:number;radius?:number;children?:ReactNode})=>{
  if(phases.length<2)return null;
  const active=[...beats].filter(b=>b.at<=time).sort((a,b)=>a.at-b.at).at(-1)?.phaseId;
  const positions=phases.map((_,i)=>{const angle=-Math.PI/2+i*2*Math.PI/phases.length;return [Math.cos(angle)*radius,Math.sin(angle)*radius] as Point;});
  return <g>
    {positions.map((p,i)=>{const next=positions[(i+1)%positions.length];const dx=next[0]-p[0],dy=next[1]-p[1],len=Math.hypot(dx,dy);const from:[number,number]=[p[0]+dx/len*49,p[1]+dy/len*49],to:[number,number]=[next[0]-dx/len*49,next[1]-dy/len*49];return <Transfer key={i} points={[from,to]} time={-1} start={0} end={1} color={c.line}/>;})}
    {phases.map((phase,i)=><g key={phase.id} transform={`translate(${positions[i].join(' ')})`}>
      <circle r={47} fill={phase.id===active?'#294A50':'#192D3D'} stroke={phase.id===active?c.teal:c.line} strokeWidth={3}/>
      <Label x={0} y={7} size={21} color={phase.id===active?c.teal:c.muted}>{phase.label}</Label>
    </g>)}
    {children}
  </g>;
};
