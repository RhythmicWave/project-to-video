import type {ReactNode} from 'react';
import {c} from './theme';
const T=({x,y,children,size=28,color=c.text,anchor='start',weight=400}: {x:number;y:number;children:ReactNode;size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number})=><text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} fontWeight={weight}>{children}</text>;
export type BackendGlyphKind='client'|'gateway'|'service'|'repository'|'database'|'redis'|'kafka'|'consumer'|'clock'|'heap'|'script';
export const BackendGlyph=({x,y,kind,label,labelLines,symbol,scale=1,color=c.blue,active=false,labelSize=27,serviceMark='API'}: {x:number;y:number;kind:BackendGlyphKind;label:string;labelLines?:string[];symbol?:string;scale?:number;color?:string;active?:boolean;labelSize?:number;serviceMark?:string})=><g transform={`translate(${x} ${y}) scale(${scale})`}>
 <g fill={c.surface} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
  {kind==='client'&&<><rect x={-76} y={-53} width={152} height={99} rx={10}/><path d="M-20 47 V70 M20 47 V70 M-44 70 H44"/><path d="M-48 -21 l12 10 l-12 10 M-18 2 H40"/><circle cx={-57} cy={-38} r={3} fill={c.red} stroke="none"/></>}
  {kind==='gateway'&&<><path d="M-68 58 V-48 H68 V58 M-45 58 V-25 H45 V58"/><path d="M-10 -34 l10 -8 l10 8 v20 q-10 17 -20 0z" fill={color}/><path d="M-94 26 H-49 M49 26 H94"/><path d="M79 16 l15 10 l-15 10"/></>}
  {kind==='service'&&<><path d="M-42 -62 H42 L75 -25 V29 L42 62 H-42 L-75 29 V-25Z"/><rect x={-43} y={-30} width={86} height={60} rx={9} fill="#203C50"/><path d="M-58 -12 H-43 M43 -12 H58 M-58 12 H-43 M43 12 H58"/><T x={0} y={10} size={28} anchor="middle" color={color}>{serviceMark}</T></>}
  {kind==='repository'&&<><path d="M0 -62 L67 -24 V47 L0 72 L-67 47 V-24Z"/><path d="M0 -35 V-2 M0 -2 H-37 V35 M0 -2 H37 V35"/><circle cy={-35} r={8} fill={color}/><ellipse cx={-37} cy={38} rx={17} ry={9}/><rect x={20} y={24} width={35} height={24} rx={5}/></>}
  {kind==='database'&&<><path d="M-76 -38 V58 C-76 78 76 78 76 58 V-38"/><ellipse cy={-38} rx={76} ry={23} fill="#284C61"/><path d="M-76 -7 C-76 14 76 14 76 -7 M-76 25 C-76 46 76 46 76 25"/><ellipse cy={58} rx={76} ry={18}/></>}
  {kind==='redis'&&<>{[35,8,-20].map((y,i)=><path key={i} d={`M-76 ${y} L0 ${y-31} L76 ${y} L0 ${y+31} Z`} fill={['#4B3547','#67435A','#87546D'][i]}/>)}<path d="M-20 -18 H20 M0 -30 V-6" stroke={color}/></>}
  {kind==='kafka'&&<><circle r={22}/><circle cx={-58} cy={-43} r={16}/><circle cx={58} cy={-43} r={16}/><circle cx={58} cy={43} r={16}/><circle cx={-58} cy={43} r={16}/><path d="M-42 -31 L-20 -13 M42 -31 L20 -13 M42 31 L20 13 M-42 31 L-20 13"/></>}
  {kind==='consumer'&&<><path d="M-75 -48 H75 L28 18 V61 H-28 V18Z"/><rect x={-49} y={-28} width={19} height={22} rx={3} fill={color}/><rect x={-9} y={-28} width={19} height={22} rx={3} fill={color}/><rect x={30} y={-28} width={19} height={22} rx={3} fill={color}/><path d="M-15 39 l11 11 l23 -25"/></>}
  {kind==='clock'&&<><circle r={63}/><path d="M0 -40 V0 L30 16"/><path d="M-8 -82 H8 M0 -82 V-65 M50 -56 L60 -67"/>{[0,1,2,3].map(i=><path key={i} d="M0 -55 V-46" transform={`rotate(${i*90})`}/>)}</>}
  {kind==='heap'&&<><path d="M0 -22 V3 H-46 V27 M0 3 H46 V27"/><circle cy={-38} r={20}/><circle cx={-46} cy={45} r={20}/><circle cx={46} cy={45} r={20}/></>}
  {kind==='script'&&<><path d="M-54 -63 H30 L54 -39 V63 H-54Z M30 -63 V-39 H54"/><path d="M-20 -13 l-14 13 l14 13 M20 -13 l14 13 l-14 13 M5 -20 L-5 20"/></>}
 </g>
 {active&&<circle r={90} fill="none" stroke={color} strokeWidth={2} strokeDasharray="7 7"/>}
 {(labelLines??[label]).map((line,i)=><T key={i} x={0} y={108+i*29} size={labelSize} color={color} anchor="middle" weight={600}>{line}</T>)}
 {symbol&&<T x={0} y={142+((labelLines?.length??1)-1)*29} size={20} color={c.muted} anchor="middle">{symbol}</T>}
</g>;
