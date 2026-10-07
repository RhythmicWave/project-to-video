import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {ArchitectureMap,validateArchitectureModel,validateMapBindings} from '../src/visual/ArchitectureMap';
import {compileTimeline} from '../src/visual/causal-timeline.mjs';
import {mapExample,mapTimeline,ArchitectureMapFrame} from '../src/scenes/ArchitectureMapDemo';

test('full view and miniature retain the same object and route identities',()=>{
 const full=renderToStaticMarkup(<ArchitectureMap model={mapExample}/>),mini=renderToStaticMarkup(<ArchitectureMap model={mapExample} compact focus={['repo']}/>);
 for(const n of mapExample.nodes){assert.ok(full.includes(`data-node="${n.id}"`));assert.ok(mini.includes(`data-node="${n.id}"`));}
 for(const e of mapExample.edges){assert.ok(full.includes(`data-edge="${e.id}"`));assert.ok(mini.includes(`data-edge="${e.id}"`));}
 assert.ok(mini.includes('data-focus="repo"'));
 assert.ok(!mini.includes('stroke-dasharray="7 7"'),'focus must not create an execution ring');
});
test('future participants wait for the packet, even when selected for focus',()=>{
 const end=mapTimeline.end('to-handler');
 const before=renderToStaticMarkup(<ArchitectureMap model={mapExample} timeline={mapTimeline} time={end-1/30} focus={['handler']}/>);
 const at=renderToStaticMarkup(<ArchitectureMap model={mapExample} timeline={mapTimeline} time={end}/>);
 assert.ok(before.includes('data-node="handler" data-phase="pending"'));
 assert.ok(at.includes('data-node="handler" data-phase="running"'));
 assert.ok(!before.includes('data-event="to-service"'),'future edge must remain structural');
});
test('unknown identities, diagonal routes and receiver steps without arrival dependencies fail',()=>{
 const dupe=structuredClone(mapExample);dupe.nodes[1].id=dupe.nodes[0].id;assert.throws(()=>validateArchitectureModel(dupe));
 const unknown=structuredClone(mapExample);unknown.edges[0].to='missing';assert.throws(()=>validateArchitectureModel(unknown));
 const diagonal=structuredClone(mapExample);diagonal.edges[0].points=[[0,0],[10,10]];assert.throws(()=>validateArchitectureModel(diagonal));
 const early=compileTimeline([{id:'send',kind:'transfer',at:0,duration:1,route:'client-handler'},{id:'receive',kind:'task',at:.2,duration:1,actor:'handler'}]);
 assert.throws(()=>validateMapBindings(mapExample,early));
});
test('reverse responses wait for arrival and the demo reconstructs independently at boundaries',()=>{
 validateMapBindings(mapExample,mapTimeline);
 for(const e of mapTimeline.events)for(const frame of [Math.max(0,e.startFrame-1),e.startFrame,e.endFrame-1,e.endFrame]){
  const svg=renderToStaticMarkup(<ArchitectureMapFrame frame={frame}/>);assert.ok(svg.startsWith('<svg'));assert.ok(!svg.includes('NaN'));
 }
});
