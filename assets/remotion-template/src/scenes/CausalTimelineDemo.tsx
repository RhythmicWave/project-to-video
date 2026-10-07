import {useCurrentFrame} from 'remotion';
import {compileTimeline,type EventSpec} from '../visual/causal-timeline.mjs';
import {CausalTransfer,CausalActor,CausalReady,Reveal} from '../visual/CausalMotion';
import {WorkerRack} from '../visual/BackendResources';
import {c} from '../visual/theme';

const events:EventSpec[]=[
 {id:'request',kind:'task',at:0,duration:1.1,actor:'request'},
 {id:'to-coordinator',kind:'transfer',after:['request'],duration:.8},
 {id:'fork',kind:'task',after:['to-coordinator'],duration:.4,actor:'coordinator'},
 {id:'left-call',kind:'transfer',after:['fork'],duration:.8},
 {id:'right-call',kind:'transfer',after:['fork'],with:'left-call',duration:.8},
 {id:'left-work',kind:'task',after:['left-call'],duration:1,actor:'left'},
 {id:'right-work',kind:'task',after:['right-call'],duration:2,actor:'right'},
 {id:'left-return',kind:'transfer',after:['left-work'],duration:.9},
 {id:'right-return',kind:'transfer',after:['right-work'],duration:.9},
 {id:'join',kind:'join',after:['left-return','right-return'],duration:0},
 {id:'combine',kind:'task',after:['join'],duration:.45,actor:'result'},
 {id:'publish',kind:'transfer',after:['combine'],duration:.8},
 {id:'ready',kind:'state',after:['publish'],duration:0},
 {id:'recap',kind:'presentation',after:['ready'],at:8.5,duration:.6},
];
export const causalDemoTimeline=compileTimeline(events,30);
const label=(x:number,y:number,text:string,color:string=c.text,size=24)=><text x={x} y={y} fontSize={size} fill={color} textAnchor="middle">{text}</text>;
export const CausalDemoFrame=({frame}:{frame:number})=>{
 const time=frame/30,q=causalDemoTimeline;
 const worker=(id:string,x:number,y:number,name:string)=><CausalActor timeline={q} actor={id} time={time}>{phase=><WorkerRack x={x} y={y} scale={.6} label={name} state={phase==='running'?'active':phase==='done'?'done':'idle'}/>}</CausalActor>;
 const caption=q.started('recap',time)?'修改前段时长，后续传输、处理、状态和字幕一起移动':q.done('join',time)?'两路返回全部到达，再汇合与发布结果':q.started('left-call',time)?'显式分叉：两路可以并行，汇合等待较慢的一路':'顺序：前一步完成 → 发出传输 → 到达后开始处理';
 return <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" style={{fontFamily:'"Microsoft YaHei",sans-serif'}}>
  <rect width="1280" height="720" fill={c.bg}/>
  {label(640,64,'因果时序：到达，再处理，完成后继续',c.text,34)}
  {label(640,107,'灰线展示结构 · 亮线跟随载荷 · 执行状态读取同一份事件依赖',c.muted,20)}
  {worker('request',130,290,'入口处理')}{worker('coordinator',430,290,'协调者')}
  {worker('left',775,215,'分支 A')}{worker('right',775,460,'分支 B')}{worker('result',1120,330,'汇合结果')}
  <CausalTransfer timeline={q} event="to-coordinator" time={time} points={[[190,290],[370,290]]} label="请求"/>
  <CausalTransfer timeline={q} event="left-call" time={time} points={[[490,270],[590,270],[590,215],[715,215]]} color={c.teal}/>
  <CausalTransfer timeline={q} event="right-call" time={time} points={[[490,310],[590,310],[590,460],[715,460]]} color={c.gold}/>
  <CausalTransfer timeline={q} event="left-return" time={time} points={[[835,215],[965,215],[965,310],[1060,310]]} color={c.teal}/>
  <CausalTransfer timeline={q} event="right-return" time={time} points={[[835,460],[965,460],[965,350],[1060,350]]} color={c.gold}/>
  <CausalTransfer timeline={q} event="publish" time={time} points={[[1120,375],[1120,590],[905,590]]} color={c.teal} label="发布"/>
  <CausalReady timeline={q} event="ready" time={time}>
   <rect x={400} y={558} width={505} height={64} rx={16} fill={c.surface} stroke={c.teal} strokeWidth={2}/>
   {label(650,600,q.done('ready',time)?'Result = ready':'Result = pending',c.teal,28)}
  </CausalReady>
  <Reveal timeline={q} event="recap" time={time}>{label(200,560,'after = 完成后',c.muted,21)}{label(200,592,'with = 同时开始',c.muted,21)}</Reveal>
  <path d="M64 635 H1216" stroke={c.line}/>{label(640,681,caption,c.text,26)}
 </svg>;
};
export const CausalTimelineDemo=()=>{const frame=useCurrentFrame();return <CausalDemoFrame frame={frame}/>;};
