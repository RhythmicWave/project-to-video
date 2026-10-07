import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compileTimeline,resolveCues,timelineWindows,resolveChapter} from '../src/visual/causal-timeline.mjs';

test('a slower predecessor shifts transfer, receiver, state and caption together',()=>{
 const make=d=>compileTimeline([
  {id:'source',kind:'task',at:0,duration:d,actor:'source'},
  {id:'wire',kind:'transfer',after:['source'],at:1,duration:.8},
  {id:'receive',kind:'task',after:['wire'],duration:.5,actor:'destination'},
  {id:'commit',kind:'state',after:['receive'],duration:0},
 ]);
 const a=make(.5),b=make(2);
 assert.equal(a.start('wire'),1);assert.equal(b.start('wire'),2);
 assert.equal(b.start('receive'),b.end('wire'));
 assert.equal(b.actorPhase('destination',b.end('wire')-1/30),'pending');
 assert.equal(b.actorPhase('destination',b.end('wire')),'running');
 assert.equal(b.done('commit',b.end('receive')-1/30),false);
 assert.equal(b.done('commit',b.end('receive')),true);
 assert.equal(resolveCues([[0,'Committed',{event:'commit',edge:'end'}]],b)[0][0],b.end('receive'));
});

test('explicit fork overlaps; join waits for all branches and their returns',()=>{
 const q=compileTimeline([
  {id:'fork',kind:'task',at:0,duration:.5},
  {id:'a',kind:'task',after:['fork'],duration:.7},
  {id:'b',kind:'task',after:['fork'],with:'a',duration:1.3},
  {id:'return-a',kind:'transfer',after:['a'],duration:.5},
  {id:'return-b',kind:'transfer',after:['b'],duration:.5},
  {id:'join',kind:'join',after:['return-a','return-b'],duration:0},
 ]);
 assert.equal(q.start('a'),q.start('b'));
 assert.equal(q.start('join'),q.end('return-b'));
 assert.equal(q.done('join',q.end('return-b')-1/30),false);
});

test('compile rejects missing dependencies, cycles, invalid times, false forks and zero transfers',()=>{
 const root={id:'r',kind:'task',at:0,duration:1};
 for(const specs of [
  [{...root,duration:-1}], [{...root,at:-1}], [root,{...root}],
  [{...root,after:['missing']}], [{...root,after:['x']},{id:'x',kind:'task',after:['r'],duration:1}],
  [root,{id:'wire',kind:'transfer',after:['r'],duration:0}],
  [root,{id:'late',kind:'task',after:['r'],with:'r',duration:1}],
  [{id:'loose',kind:'task',duration:1}],
 ])assert.throws(()=>compileTimeline(specs));
});

test('frames use half-open execution intervals and arrival is exactly the end frame',()=>{
 const q=compileTimeline([{id:'t',kind:'transfer',at:.1,duration:.25}]);
 const e=q.get('t');assert.equal(e.startFrame,3);assert.equal(e.endFrame,11);
 assert.equal(q.phase('t',10/30),'running');assert.equal(q.progress('t',10/30),7/8);
 assert.equal(q.phase('t',11/30),'done');assert.equal(q.progress('t',11/30),1);
 assert.equal(q.phase('t',2/30),'pending');
});

test('sampling includes delayed transfers, state boundaries and presentation movement',()=>{
 const q=compileTimeline([
  {id:'long',kind:'task',at:0,duration:5},
  {id:'late',kind:'transfer',after:['long'],duration:1},
  {id:'state',kind:'state',after:['late'],duration:0},
  {id:'view',kind:'presentation',after:['state'],duration:.7},
 ]);
 const windows=timelineWindows(q,8,[0]);
 const covered=f=>windows.some(([a,b])=>f>=Math.round(a*30)&&f<Math.round(b*30));
 for(let f=150;f<=201;f++)assert.ok(covered(f));
 assert.equal(covered(90),false,'unmoving long work only needs boundaries');
});

test('chapter checks prevent captions escaping the graph or chapter',()=>{
 const events=[{id:'root',kind:'presentation',at:0,duration:.5}];
 assert.throws(()=>resolveChapter({id:'bad',duration:1,events:[{...events[0],duration:2}],cues:[[0,'a']]}));
 assert.throws(()=>resolveChapter({id:'bad',duration:1,events,cues:[[0,'a'],[0,'b']]}));
 assert.throws(()=>resolveChapter({id:'bad',duration:1,events,cues:[[0,'a',{event:'missing'}]]}));
});
