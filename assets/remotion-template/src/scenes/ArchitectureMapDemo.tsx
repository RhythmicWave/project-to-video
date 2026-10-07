import {useCurrentFrame} from 'remotion';
import {ArchitectureMap,validateArchitectureModel,validateMapBindings,type ArchitectureModel} from '../visual/ArchitectureMap';
import {BackendGlyph} from '../visual/BackendGlyphs';
import {SnapshotStack} from '../visual/BackendResources';
import {CausalActor,CausalTransfer,CausalReady} from '../visual/CausalMotion';
import {compileTimeline,type EventSpec} from '../visual/causal-timeline.mjs';
import {OverviewDetail} from '../visual/Scenes';
import {c} from '../visual/theme';

export const mapExample:ArchitectureModel=validateArchitectureModel({
 bounds:{x:0,y:0,width:1250,height:550},
 regions:[
  {id:'handler-layer',label:'Handler',box:{x:230,y:75,width:180,height:455}},
  {id:'service-layer',label:'Service',box:{x:430,y:75,width:195,height:455}},
  {id:'repository-layer',label:'Repository',box:{x:645,y:75,width:215,height:455}},
 ],
 nodes:[
  {id:'client',x:110,y:210,kind:'client',label:'客户端',scale:.64},
  {id:'handler',x:320,y:210,kind:'gateway',label:'RequestHandler',shortLabel:'Handler',scale:.64},
  {id:'service',x:525,y:210,kind:'service',label:'ResourceService',shortLabel:'Service',scale:.64},
  {id:'repo',x:750,y:210,kind:'repository',label:'CachedRepository',shortLabel:'Repository',scale:.64,color:c.teal},
  {id:'db',x:1070,y:210,kind:'database',label:'持久化数据库',scale:.64},
  {id:'cache',x:1070,y:425,kind:'redis',label:'共享缓存',scale:.64,color:c.teal},
 ],
 edges:[
  {id:'client-handler',from:'client',to:'handler',relation:'call',points:[[160,210],[272,210]]},
  {id:'handler-service',from:'handler',to:'service',relation:'call',points:[[368,210],[477,210]]},
  {id:'service-repo',from:'service',to:'repo',relation:'call',points:[[573,210],[702,210]]},
  {id:'repo-cache',from:'repo',to:'cache',relation:'data',color:c.teal,points:[[793,230],[895,230],[895,405],[1021,405]]},
  {id:'repo-db',from:'repo',to:'db',relation:'data',points:[[793,210],[1021,210]]},
 ],
});
const events:EventSpec[]=[
 {id:'start',kind:'task',at:0,duration:.3,actor:'client'},
 {id:'to-handler',kind:'transfer',after:['start'],duration:.6,route:'client-handler'},
 {id:'handle',kind:'task',after:['to-handler'],duration:.25,actor:'handler'},
 {id:'to-service',kind:'transfer',after:['handle'],duration:.6,route:'handler-service'},
 {id:'service',kind:'task',after:['to-service'],duration:.25,actor:'service'},
 {id:'to-repo',kind:'transfer',after:['service'],duration:.6,route:'service-repo'},
 {id:'repo',kind:'task',after:['to-repo'],duration:.3,actor:'repo'},
 {id:'get-cache',kind:'transfer',after:['repo'],duration:.6,route:'repo-cache'},
 {id:'miss',kind:'task',after:['get-cache'],duration:.3,actor:'cache'},
 {id:'miss-return',kind:'transfer',after:['miss'],duration:.6,route:'repo-cache',reverse:true},
 {id:'fallback',kind:'task',after:['miss-return'],duration:.25,actor:'repo'},
 {id:'get-db',kind:'transfer',after:['fallback'],duration:.6,route:'repo-db'},
 {id:'query',kind:'task',after:['get-db'],duration:.4,actor:'db'},
 {id:'db-return',kind:'transfer',after:['query'],duration:.6,route:'repo-db',reverse:true},
 {id:'result',kind:'task',after:['db-return'],duration:.3,actor:'repo'},
 {id:'fill',kind:'transfer',after:['result'],duration:.6,route:'repo-cache'},
 {id:'write',kind:'task',after:['fill'],duration:.3,actor:'cache'},
 {id:'written',kind:'transfer',after:['write'],duration:.6,route:'repo-cache',reverse:true},
 {id:'reply',kind:'task',after:['written'],duration:.25,actor:'repo'},
 {id:'to-service-return',kind:'transfer',after:['reply'],duration:.5,route:'service-repo',reverse:true},
 {id:'service-response',kind:'task',after:['to-service-return'],duration:.2,actor:'service'},
 {id:'to-handler-return',kind:'transfer',after:['service-response'],duration:.5,route:'handler-service',reverse:true},
 {id:'http-response',kind:'task',after:['to-handler-return'],duration:.2,actor:'handler'},
 {id:'to-client',kind:'transfer',after:['http-response'],duration:.5,route:'client-handler',reverse:true},
 {id:'received',kind:'task',after:['to-client'],duration:.2,actor:'client'},
];
export const mapTimeline=compileTimeline([...events,
 {id:'overview-hold',kind:'presentation',after:['received'],duration:.5},
 {id:'camera',kind:'presentation',after:['overview-hold'],duration:1.5},
],30);validateMapBindings(mapExample,mapTimeline);
const local=compileTimeline([
 {id:'entry',kind:'task',at:mapTimeline.end('camera'),duration:.4,actor:'repo'},
 {id:'cache-call',kind:'transfer',after:['entry'],duration:.6},
 {id:'cache-miss',kind:'task',after:['cache-call'],duration:.3,actor:'cache'},
 {id:'miss-return',kind:'transfer',after:['cache-miss'],duration:.5},
 {id:'fallback',kind:'task',after:['miss-return'],duration:.25,actor:'repo'},
 {id:'db-call',kind:'transfer',after:['fallback'],duration:.6},
 {id:'db-query',kind:'task',after:['db-call'],duration:.4,actor:'db'},
 {id:'db-return',kind:'transfer',after:['db-query'],duration:.6},
 {id:'prepare-fill',kind:'task',after:['db-return'],duration:.25,actor:'repo'},
 {id:'fill-call',kind:'transfer',after:['prepare-fill'],duration:.6},
 {id:'cache-fill',kind:'task',after:['fill-call'],duration:.4,actor:'cache'},
 {id:'return',kind:'transfer',after:['cache-fill'],duration:.5},
 {id:'combine',kind:'task',after:['return'],duration:.4,actor:'repo'},
 {id:'ready',kind:'state',after:['combine'],duration:0},
],30);
const text=(x:number,y:number,value:string,size=23,color:string=c.text)=><text x={x} y={y} fontSize={size} fill={color}>{value}</text>;
export const ArchitectureMapFrame=({frame}:{frame:number})=>{
 const time=frame/30,zoom=time>=mapTimeline.start('camera');
 const actor=(id:string,x:number,y:number,kind:'repository'|'redis'|'database',label:string,symbol:string)=><CausalActor timeline={local} actor={id} time={time}>{phase=><BackendGlyph x={x} y={y} kind={kind} label={label} symbol={symbol} scale={.63} color={id==='db'?c.blue:c.teal} active={phase==='running'}/>}</CausalActor>;
 const detail=<>
  <CausalTransfer timeline={local} event="cache-call" time={time} points={[[123,65],[285,65]]} color={c.teal} label="#42" payloadMinWidth={80}/>
  <CausalTransfer timeline={local} event="miss-return" time={time} points={[[285,65],[123,65]]} color={c.teal} label="miss" payloadMinWidth={80}/>
  <CausalTransfer timeline={local} event="db-call" time={time} points={[[80,25],[80,-8],[600,-8],[600,18]]} label="#42" payloadMinWidth={80}/>
  <CausalTransfer timeline={local} event="db-return" time={time} points={[[551,65],[450,65],[450,185],[180,185],[180,92],[123,92]]} label="v2" payloadMinWidth={80}/>
  <CausalTransfer timeline={local} event="fill-call" time={time} points={[[123,65],[285,65]]} color={c.teal} label="v2" payloadMinWidth={80}/>
  <CausalTransfer timeline={local} event="return" time={time} points={[[285,65],[123,65]]} color={c.teal} label="完成" payloadMinWidth={80}/>
  {actor('repo',80,65,'repository','CachedRepository','Get(id)')}
  {actor('cache',335,65,'redis','共享缓存','GET / SET')}
  {actor('db',600,65,'database','数据库','SELECT id')}
  <CausalReady timeline={local} event="ready" time={time} context={false}><SnapshotStack x={25} y={245} width={570} scale={.52} label="请求 #42 · 结果归属" generation="Result v2" rows={['id: 42 · 内容: v2','DB 返回 → 缓存回填 → 返回调用者']}/></CausalReady>
  {text(25,220,local.done('cache-fill',time)?'缓存：#42 → v2':local.done('cache-miss',time)?'缓存 miss → 仓储查询数据库':'等待缓存查询',22,c.teal)}
 </>;
 return <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" style={{fontFamily:'"Microsoft YaHei",sans-serif'}}>
  <rect width="1280" height="720" fill={c.bg}/>
  {text(54,60,zoom?'从全景进入机制：同一个对象，同一个请求':'全景：分层、状态归属与真实连接',34)}
  <OverviewDetail time={time} start={mapTimeline.start('camera')} duration={mapTimeline.end('camera')-mapTimeline.start('camera')} source={mapExample.bounds} full={{x:15,y:105,width:1250,height:550}} mini={{x:35,y:185,width:375,height:180}} detailBox={{x:460,y:140,width:780,height:470}} focus={[750,210]} title="局部展开 · Cache Aside" overview={<ArchitectureMap model={mapExample} timeline={zoom?undefined:mapTimeline} time={time} focus={zoom?['repo','db','cache']:[]} compact={zoom}/>} detail={detail}/>
  {text(54,681,zoom?'保持请求 #42；miss 返回仓储后，查询 DB，再回填缓存。':'全景保留层级与代表类型；方法和字段在需要解释机制时展开。',25)}
 </svg>;
};
export const ArchitectureMapDemo=()=>{const frame=useCurrentFrame();return <ArchitectureMapFrame frame={frame}/>;};
