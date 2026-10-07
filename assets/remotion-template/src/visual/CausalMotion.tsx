import type {ReactNode} from 'react';
import type {Timeline,Phase} from './causal-timeline.mjs';
import {assertOrthogonalRoute,type Point} from './geometry';
import {Payload} from './Systems';
import {c} from './theme';

export const CausalActor=({timeline,actor,time,children}:{timeline:Timeline;actor:string;time:number;children:(phase:Phase)=>ReactNode})=>{
 const phase=timeline.actorPhase(actor,time);
 return <g data-actor={actor} data-phase={phase} opacity={phase==='pending'?.32:1}>{children(phase)}</g>;
};
export const CausalReady=({timeline,event,time,children,context=true}:{timeline:Timeline;event:string;time:number;children:ReactNode;context?:boolean})=><g data-ready={event} opacity={timeline.done(event,time)?1:context?.25:0}>{children}</g>;

export const Reveal=({timeline,event,time,children}:{timeline:Timeline;event:string;time:number;children:ReactNode})=>{
 const p=timeline.progress(event,time),v=p*p*(3-2*p);
 return <g opacity={v} transform={`translate(0 ${12*(1-v)})`}>{children}</g>;
};

/** Future topology is neutral. A colored prefix stops at the payload; the arrow appears on arrival. */
export const CausalTransfer=({timeline,event,time,points,color=c.blue,label,topology=true,payloadMinWidth=188}:{timeline:Timeline;event:string;time:number;points:Point[];color?:string;label?:string;topology?:boolean;payloadMinWidth?:number})=>{
 const e=timeline.get(event);if(e.kind!=='transfer')throw new Error(`Expected transfer: ${event}`);
 assertOrthogonalRoute(points);
 if(points.length<2)throw new Error('Transfer needs at least two points');
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);
 if(total===0)throw new Error('Zero-length transfer route');
 const phase=timeline.phase(event,time),p=timeline.progress(event,time),d=points.map((v,i)=>`${i?'L':'M'}${v.join(' ')}`).join(' ');
 let distance=p*total,pos=points[0];
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const q=lengths[i]?distance/lengths[i]:0;pos=[points[i][0]+(points[i+1][0]-points[i][0])*q,points[i][1]+(points[i+1][1]-points[i][1])*q];break;}distance-=lengths[i];}
 const last=points.at(-1)!,previous=[...points.slice(0,-1)].reverse().find(v=>v[0]!==last[0]||v[1]!==last[1])!;
 const angle=Math.atan2(last[1]-previous[1],last[0]-previous[0])*180/Math.PI;
 return <g data-event={event} data-phase={phase}>
  {topology&&<path d={d} stroke={c.line} strokeWidth={2} fill="none" opacity={.5}/>}
  {phase!=='pending'&&<path d={d} stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" strokeDasharray={`${p*total} ${total+1}`} opacity={phase==='running'?1:.24}/>}
  {phase==='done'&&<path d="M-10 -6 L0 0 L-10 6" transform={`translate(${last.join(' ')}) rotate(${angle})`} fill="none" stroke={color} strokeWidth={3} opacity={.32}/>}
  {phase==='running'&&<Payload x={pos[0]} y={pos[1]} label={label} small={!label} color={color} minWidth={payloadMinWidth}/>}
 </g>;
};
