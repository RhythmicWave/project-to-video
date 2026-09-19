import type {ReactNode} from 'react';
import {c} from './theme';
import {wrapText} from './geometry';

export const Label=({x,y,children,size=24,color=c.text,anchor='middle'}:{x:number;y:number;children:ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end'})=><text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size}>{children}</text>;

/** 需要固定宽度时显式换行；调用者仍应通过布局检查限制 maxLines。 */
export const WrappedLabel = ({x, y, text, maxWidth, size = 24, lineHeight = size * 1.25, color = c.text, anchor = 'start', maxLines}: {
  x: number;
  y: number;
  text: string;
  maxWidth: number;
  size?: number;
  lineHeight?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  maxLines?: number;
}) => <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size}>
  {wrapText(text, maxWidth, size).slice(0, maxLines ?? Number.POSITIVE_INFINITY).map((line, index) => <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>)}
</text>;

// 消息是可携带类型与内容的载荷，移动时保留它的视觉身份。
export const Payload=({x,y,label='任务',small=false,color=c.gold,opacity=1}:{x:number;y:number;label?:string;small?:boolean;color?:string;opacity?:number})=>{
  const half=Math.max(94,[...label].reduce((w,char)=>w+(/[\u2e80-\uffff]/.test(char)?23:13.5),0)/2+23);
  return <g transform={`translate(${x} ${y})`} opacity={opacity}>
  <path d={small?'M-22 -15 H14 L24 -5 V15 H-22 Z':`M${-half} -27 H${half-17} L${half} -10 V27 H${-half} Z`} fill={color} stroke={color} strokeWidth={2}/>
  {small?<path d="M-12 -4 H10 M-12 4 H3" stroke={c.bg} strokeWidth={3}/>:<Label x={0} y={8} size={23} color={c.bg}>{label}</Label>}
</g>;
};

export const Terminal=({x,y,scale=1,typed='',status='TUI / CLI'}:{x:number;y:number;scale?:number;typed?:string;status?:string})=>{
  const rows=[''];let width=0;
  for(const char of typed){const w=/[\u2e80-\uffff]/.test(char)?24:13;
    if(char==='\n'||width+w>246){rows.push('');width=0;if(char==='\n')continue;}
    rows[rows.length-1]+=char;width+=w;
  }
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
  <path d="M0 0 H310 Q328 0 328 18 V194 H0 Z" fill="#213845" stroke={c.muted} strokeWidth={2}/>
  <path d="M12 14 H316 V176 H12 Z" fill="#0B131C"/><circle cx={26} cy={26} r={4} fill={c.teal}/><circle cx={41} cy={26} r={4} fill={c.gold}/><circle cx={56} cy={26} r={4} fill={c.red}/>
  <Label x={25} y={70} anchor="start" size={24} color={c.teal}>❯</Label>
  {rows.slice(0,3).map((row,i)=><Label key={i} x={53} y={70+i*35} anchor="start" size={24}>{row}</Label>)}
  <path d="M118 194 L105 224 H223 L210 194 M55 225 H273" stroke={c.muted} strokeWidth={4} fill="none"/>
  <Label x={164} y={263} size={26}>{status}</Label>
</g>;
};

// Agent 只保留头部；眼睛与天线状态灯表达运行/等待。
export const Agent=({x,y,r=85,phase=0,label='Agent',paused=false,small=false}:{x:number;y:number;r?:number;phase?:number;label?:string;paused?:boolean;small?:boolean})=>{
  const color=paused?c.gold:c.blue;
  const look=paused?0:Math.sin(phase*Math.PI*2)*3;
  return <g transform={`translate(${x} ${y})`}>
    <g transform={'scale(' + r/64 + ') translate(0 20)'}>
      <path d="M0 -48 V-65" stroke="#AFC3D8" strokeWidth={5}/><circle cy={-68} r={7} fill={color}/>
      <rect x={-46} y={-48} width={92} height={66} rx={20} fill="#CFDAE5" stroke="#EBF1F6" strokeWidth={2}/>
      <rect x={-35} y={-36} width={70} height={40} rx={12} fill="#152233"/>
      <g transform={'translate(' + look + ' 0)'} fill={color}>{paused?<><rect x={-20} y={-23} width={9} height={18} rx={3}/><rect x={11} y={-23} width={9} height={18} rx={3}/></>:<><circle cx={-17} cy={-17} r={7}/><circle cx={17} cy={-17} r={7}/><path d="M-7 -3 Q0 2 7 -3" fill="none" stroke={color} strokeWidth={2}/></>}</g>
    </g>
    <Label x={0} y={r+22} size={small?25:31}>{label}</Label>
  </g>;
};

export const Model=({x,y,active=0,label='LLM Provider',scale=1}:{x:number;y:number;active?:number;label?:string;scale?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
  <rect x={-76} y={-65} width={152} height={130} rx={18} fill="#202B44" stroke={c.blue} strokeWidth={3}/>
  {[0,1,2,3,4].map(i=><g key={i} stroke={c.blue} strokeWidth={3}><path d={`M${-52+i*26} -82 V-65 M${-52+i*26} 65 V82 M-94 ${-48+i*24} H-76 M76 ${-48+i*24} H94`}/></g>)}
  {Array.from({length:16},(_,i)=><circle key={i} cx={-43+(i%4)*29} cy={-41+Math.floor(i/4)*27} r={6} fill={c.blue} opacity={.2+((i+Math.floor(active*8))%4)*.23}/>)}
  <Label x={0} y={121} size={27}>{label}</Label>
</g>;

// 文件夹、叠页与逐行记录共同表示持久化文件；count 只控制可见记录数。
export const Archive=({x,y,label='记录文件',count=4,scale=1}:{x:number;y:number;label?:string;count?:number;scale?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
  <ellipse cy={108} rx={112} ry={10} fill="#080F17" opacity={.5}/>
  <path d="M-110 -50 Q-110 -62 -98 -62 H-45 L-27 -43 H99 Q111 -43 111 -30 V92 H-110 Z" fill="#294663" stroke={c.blue} strokeWidth={2}/>
  <rect x={-70} y={-78} width={142} height={157} rx={8} fill="#223D58" stroke="#6386A7" transform="rotate(-7)"/>
  <path d="M-75 -78 Q-75 -87 -66 -87 H45 L80 -52 V76 H-75 Z" fill="#D9E5EF" stroke="#F2F7FA" strokeWidth={2}/>
  <path d="M45 -87 V-52 H80" fill="#91B1CC" stroke="#577895" strokeWidth={2}/>
  {Array.from({length:Math.max(0,Math.min(6,Math.floor(count)))},(_,i)=><g key={i} transform={`translate(0 ${-44+i*18})`}>
    <rect x={-54} y={-5} width={8} height={8} rx={2} fill="#527C9C"/>
    <path d={`M-35 0 H${i%2?35:54}`} stroke="#527C9C" strokeWidth={4} strokeLinecap="round"/>
  </g>)}
  <path d="M-113 41 Q-113 30 -102 30 H-40 L-23 44 H112 L99 105 H-101 Z" fill="#355A7B" stroke={c.blue} strokeWidth={2}/>
  <rect x={-31} y={62} width={62} height={24} rx={6} fill="#182F47"/>
  <path d="M-15 74 H15" stroke="#B4D1EB" strokeWidth={3} strokeLinecap="round"/>
  <Label x={0} y={152} size={26}>{label}</Label>
</g>;

export type DataStoreKind = 'database' | 'archive' | 'graph';
export type DataStoreState = 'idle' | 'read' | 'write' | 'error';
export type DataStoreOperation = 'query' | 'insert' | 'update' | 'upsert';

const dataStoreColor = (state: DataStoreState) => state === 'error' ? c.red : state === 'write' ? c.gold : state === 'read' ? c.teal : c.blue;
const dataStoreDefaultLabel = (kind: DataStoreKind) => kind === 'database' ? 'Database' : kind === 'graph' ? 'Graph' : 'Archive';

/** 用统一语义区分结构化数据库、文件归档和关系图；不绑定具体数据库品牌。 */
export const DataStore = ({
  x,
  y,
  kind = 'database',
  state = 'idle',
  operation,
  label,
  scale = 1,
}: {
  x: number;
  y: number;
  kind?: DataStoreKind;
  state?: DataStoreState;
  operation?: DataStoreOperation;
  label?: string;
  scale?: number;
}) => {
  const accent = dataStoreColor(state);
  const title = label ?? dataStoreDefaultLabel(kind);
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {kind === 'database' && <g>
      <path d="M-86 -48 V58 C-86 78 86 78 86 58 V-48" fill="#1D3A4D" stroke={accent} strokeWidth={3}/>
      <ellipse cy={-48} rx={86} ry={24} fill="#294C62" stroke={accent} strokeWidth={3}/>
      <path d="M-86 -14 C-86 6 86 6 86 -14 M-86 22 C-86 42 86 42 86 22" fill="none" stroke={accent} strokeWidth={2} opacity={.75}/>
      <ellipse cy={58} rx={86} ry={20} fill="#24465A" stroke={accent} strokeWidth={3}/>
      <circle cx={57} cy={-48} r={7} fill={accent}/>
    </g>}
    {kind === 'archive' && <g>
      <path d="M-98 -34 Q-98 -48 -84 -48 H-38 L-20 -31 H84 Q98 -31 98 -17 V67 H-98 Z" fill="#294663" stroke={accent} strokeWidth={3}/>
      <path d="M-98 12 Q-98 -1 -84 -1 H-38 L-20 12 H100 L87 76 H-88 Z" fill="#355A7B" stroke={accent} strokeWidth={3}/>
      <path d="M-58 -4 H58 M-58 17 H42 M-58 38 H28" stroke="#B4D1EB" strokeWidth={5} strokeLinecap="round" opacity={.8}/>
    </g>}
    {kind === 'graph' && <g>
      <path d="M-54 -26 L0 -62 L57 -22 M-54 -26 L-35 46 M57 -22 L35 47 M-35 46 H35" fill="none" stroke={accent} strokeWidth={4} opacity={.8}/>
      <circle cx={-54} cy={-26} r={20} fill="#3E3154" stroke={accent} strokeWidth={3}/>
      <circle cx={0} cy={-62} r={20} fill="#294663" stroke={accent} strokeWidth={3}/>
      <circle cx={57} cy={-22} r={20} fill="#3A4730" stroke={accent} strokeWidth={3}/>
      <circle cx={-35} cy={46} r={20} fill="#294663" stroke={accent} strokeWidth={3}/>
      <circle cx={35} cy={47} r={20} fill="#3E3154" stroke={accent} strokeWidth={3}/>
    </g>}
    {operation && <g>
      <rect x={-52} y={88} width={104} height={26} rx={13} fill={`${accent}20`} stroke={accent} strokeWidth={1.5}/>
      <Label x={0} y={106} size={16} color={accent}>{operation}</Label>
    </g>}
    <Label x={0} y={operation ? 151 : 137} size={26}>{title}</Label>
  </g>;
};

export const Toolbox=({x,y,open=0,label='Tools',scale=1}:{x:number;y:number;open?:number;label?:string;scale?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
  <path d="M-90 -9 H90 V94 H-90 Z" fill="#493B2B" stroke={c.gold} strokeWidth={2}/>
  <g transform={`translate(0 ${-open*55}) rotate(${-open*9})`}><path d="M-99 -41 H99 V-9 H-99 Z M-31 -41 V-62 H31 V-41" fill="#604A2D" stroke={c.gold} strokeWidth={3}/></g>
  <g transform={`translate(0 ${-open*30})`} stroke={c.gold} strokeWidth={7} fill="none"><path d="M-46 54 V-20 M-59 -18 L-46 -5 L-33 -18 M23 57 L62 -23 M51 -31 L72 -20"/></g>
  <rect x={-14} y={4} width={28} height={25} rx={4} fill={c.gold}/>
  <Label x={0} y={148} size={27}>{label}</Label>
</g>;

export const Paper=({x,y,label='messages',lines=5,color=c.blue,scale=1}:{x:number;y:number;label?:string;lines?:number;color?:string;scale?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
  <path d="M-66 -78 H37 L66 -49 V84 H-66 Z M37 -78 V-49 H66" fill="#203449" stroke={color} strokeWidth={2}/>
  {Array.from({length:Math.max(0,Math.floor(lines))},(_,i)=><path key={i} d={`M-44 ${-38+i*19} H${i%2?24:43}`} stroke={color} opacity={.55} strokeWidth={4}/>)}
  <Label x={0} y={125} size={24}>{label}</Label>
</g>;

export const Beacon=({x,y,pulse=0,label='事件源'}:{x:number;y:number;pulse?:number;label?:string})=><g transform={`translate(${x} ${y})`}>
  {[0,1,2].map(i=><circle key={i} r={22+(pulse+i/3)%1*75} fill="none" stroke={c.purple} strokeWidth={2} opacity={.7*(1-(pulse+i/3)%1)}/>)}
  <path d="M-9 0 V90 M9 0 V90 M-47 91 H47" fill="none" stroke={c.purple} strokeWidth={4}/><circle r={17} fill={c.purple}/>
  <Label x={0} y={137} size={27}>{label}</Label>
</g>;
