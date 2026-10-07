import {BackendGlyph,type BackendGlyphKind} from './BackendGlyphs';
import {CausalTransfer} from './CausalMotion';
import {assertOrthogonalRoute,type Box,type Point} from './geometry';
import type {Timeline,Phase} from './causal-timeline.mjs';
import {c} from './theme';

export type MapNode={id:string;x:number;y:number;kind:BackendGlyphKind;label:string;shortLabel?:string;scale?:number;color?:string;serviceMark?:string};
export type MapEdge={id:string;from:string;to:string;points:Point[];relation:'call'|'data'|'event'|'observation';color?:string};
export type MapRegion={id:string;label:string;box:Box};
export type ArchitectureModel={bounds:Box;nodes:MapNode[];edges:MapEdge[];regions?:MapRegion[]};

/** Stable identity/topology is shared by full and miniature views. No implicit execution. */
export function validateArchitectureModel(model:ArchitectureModel){
 const ids=new Set<string>(),edgeIds=new Set<string>();
 const boxValid=(b:Box)=>[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0;
 if(!boxValid(model.bounds))throw new Error('Invalid architecture bounds');
 const regionIds=new Set<string>();
 for(const region of model.regions??[]){if(!region.id||regionIds.has(region.id)||!region.label||!boxValid(region.box))throw new Error(`Invalid region: ${region.id}`);regionIds.add(region.id);}
 if(!model.nodes.length)throw new Error('Architecture needs nodes');
 for(const n of model.nodes){
  if(!n.id||ids.has(n.id))throw new Error(`Missing or duplicate node: ${n.id}`);
  if(!n.label||![n.x,n.y,n.scale??1].every(Number.isFinite)||(n.scale??1)<=0)throw new Error(`Invalid node: ${n.id}`);
  ids.add(n.id);
 }
 for(const e of model.edges){
  if(!e.id||edgeIds.has(e.id))throw new Error(`Missing or duplicate edge: ${e.id}`);
  if(!ids.has(e.from)||!ids.has(e.to))throw new Error(`Unknown endpoint: ${e.id}`);
  if(e.points.length<2||e.points.some(p=>p.length!==2||!p.every(Number.isFinite)))throw new Error(`Invalid route: ${e.id}`);
  assertOrthogonalRoute(e.points);
  if(!e.points.slice(1).some((p,i)=>p[0]!==e.points[i][0]||p[1]!==e.points[i][1]))throw new Error(`Zero-length route: ${e.id}`);
  edgeIds.add(e.id);
 }
 return model;
}

/** Map transfers must lead to a receiver task depending on arrival, including return routes. */
export function validateMapBindings(model:ArchitectureModel,timeline:Timeline){
 const edges=new Map(model.edges.map(e=>[e.id,e]));
 const dependsOn=(id:string,target:string):boolean=>timeline.get(id).after?.some(dep=>dep===target||dependsOn(dep,target))??false;
 for(const e of timeline.events.filter(e=>e.route)){
  const edge=edges.get(e.route!);if(!edge||e.kind!=='transfer')throw new Error(`Unknown transfer route: ${e.id}`);
  const receiver=e.reverse?edge.from:edge.to;
  if(!timeline.events.some(task=>task.kind==='task'&&task.actor===receiver&&dependsOn(task.id,e.id)))throw new Error(`Receiver must wait for arrival: ${e.id} → ${receiver}`);
 }
}

export const ArchitectureMap=({model,focus=[],timeline,time=0,compact=false}:{model:ArchitectureModel;focus?:string[];timeline?:Timeline;time?:number;compact?:boolean})=>{
 const selected=new Set(focus);
 return <g data-map-view={compact?'mini':'full'}>
  {model.regions?.map(region=><g key={region.id}>
   <rect {...region.box} rx={16} fill="#18303B" fillOpacity={.4} stroke={c.line} strokeWidth={1}/>
   <text x={region.box.x+region.box.width/2} y={region.box.y+30} fontSize={24} fill={c.muted} textAnchor="middle">{region.label}</text>
  </g>)}
  {model.edges.map(edge=><path key={edge.id} data-edge={edge.id} d={edge.points.map((p,i)=>`${i?'L':'M'}${p.join(' ')}`).join(' ')} stroke={c.line} strokeWidth={2} fill="none" strokeDasharray={edge.relation==='event'?'6 9':edge.relation==='observation'?'2 8':undefined} opacity={selected.size&&!selected.has(edge.from)&&!selected.has(edge.to)?.18:.6}/>)}
  {timeline&&model.edges.map(edge=>{
   const matches=timeline.events.filter(e=>e.route===edge.id);
   const event=matches.find(e=>timeline.phase(e.id,time)==='running')??[...matches].reverse().find(e=>timeline.done(e.id,time));
   if(!event)return null;
   return <CausalTransfer key={edge.id} points={event.reverse?[...edge.points].reverse():edge.points} timeline={timeline} event={event.id} time={time} color={edge.color??c.blue} topology={false}/>;
  })}
  {model.nodes.map(node=>{
   const tasks=timeline?.events.some(e=>e.kind==='task'&&e.actor===node.id);
   const phase:Phase|undefined=tasks?timeline!.actorPhase(node.id,time):timeline?'pending':undefined;
   const scale=node.scale??1,focused=selected.has(node.id),context=selected.size&&!focused?.25:1;
   return <g key={node.id} data-node={node.id} data-phase={phase??'structure'} opacity={context*(phase==='pending'?.35:1)}>
    {focused&&<rect data-focus={node.id} x={node.x-92*scale} y={node.y-88*scale} width={184*scale} height={170*scale} rx={14} fill="none" stroke={c.gold} strokeWidth={2}/ >}
    <BackendGlyph x={node.x} y={node.y} kind={node.kind} label={compact?(node.shortLabel??node.label):node.label} scale={scale} color={node.color??c.blue} serviceMark={node.serviceMark} labelSize={compact?26:27} active={phase==='running'}/>
   </g>;
  })}
 </g>;
};
