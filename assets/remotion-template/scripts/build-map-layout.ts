import fs from 'node:fs';
import {mapExample} from '../src/scenes/ArchitectureMapDemo';
const xOffset=15,yOffset=105;
const nodes=mapExample.nodes.map(n=>{const s=n.scale??1;return {id:n.id,bounds:{x:n.x+xOffset-94*s,y:n.y+yOffset-90*s,width:188*s,height:180*s}};});
const textBlocks=mapExample.nodes.map(n=>{const s=n.scale??1;return {id:n.id+'-label',text:n.label,fontSize:27*s,maxLines:1,lineHeight:32*s,box:{x:n.x+xOffset-100,y:n.y+yOffset+88*s,width:200,height:35*s}};});
const routes=mapExample.edges.map(e=>({id:e.id,points:e.points.map(([x,y])=>[x+xOffset,y+yOffset]),allowThrough:[e.from,e.to]}));
const baseX=482,baseY=205;
const localNodes=[{id:'repo',x:80,y:65},{id:'cache',x:335,y:65},{id:'db',x:600,y:65}].map(n=>({id:n.id,bounds:{x:baseX+n.x-94*.63,y:baseY+n.y-90*.63,width:188*.63,height:180*.63}}));
const localRoutes=[
 {id:'cache-call',p:[[123,65],[285,65]],allowThrough:['repo','cache']},
 {id:'db-call',p:[[80,25],[80,-8],[600,-8],[600,18]],allowThrough:['repo','db']},
 {id:'db-return',p:[[551,65],[450,65],[450,185],[180,185],[180,92],[123,92]],allowThrough:['db','repo']},
].map(r=>({id:r.id,points:r.p.map(([x,y])=>[baseX+x,baseY+y]),allowThrough:r.allowThrough}));
const title={id:'title',text:'从全景进入机制：同一个对象，同一个请求',fontSize:34,maxLines:1,lineHeight:44,box:{x:54,y:23,width:1180,height:50}};
const caption={id:'caption',text:'全景保留层级与代表类型；方法和字段在需要解释机制时展开。',fontSize:25,maxLines:1,lineHeight:33,box:{x:54,y:654,width:1180,height:42}};
fs.writeFileSync('layout.map.json',JSON.stringify({canvas:{width:1280,height:720},scenes:[
 {id:'architecture-full',nodes,routes,textBlocks:[...textBlocks,title,caption]},
 {id:'architecture-local',nodes:localNodes,routes:localRoutes,textBlocks:[title,caption]},
]},null,2)+'\n');
console.log('Architecture full/local geometry manifest written.');
