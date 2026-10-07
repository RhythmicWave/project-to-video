import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {BackendGlyph,type BackendGlyphKind} from '../visual/BackendGlyphs';
import {c} from '../visual/theme';
const roles:[BackendGlyphKind,string][]=[['client','客户端'],['gateway','入口 / 校验'],['service','业务服务'],['repository','存储组合'],['database','数据库'],['redis','缓存'],['kafka','事件中间件'],['consumer','消费者'],['clock','调度时钟'],['heap','优先队列'],['script','脚本 / SQL']];
export const BackendGlyphsDemo=()=>{
 const t=useCurrentFrame()/useVideoConfig().fps;
 const selected=Math.min(roles.length-1,Math.floor(t/.65));
 return <AbsoluteFill style={{background:c.bg,fontFamily:'"Microsoft YaHei",sans-serif'}}><svg width="1280" height="720" viewBox="0 0 1280 720">
  <text x={65} y={62} fill={c.text} fontSize={32}>后端参与者：用轮廓区分职责</text>
  {roles.map(([kind,label],i)=>{const x=180+(i%4)*300,y=175+Math.floor(i/4)*175;return <g key={kind} opacity={Math.max(0,Math.min(1,(t-i*.17)/.4))}>
   {selected===i&&<rect x={x-78} y={y-60} width={156} height={165} rx={14} fill="none" stroke={c.gold} strokeWidth={2}/>}
   <BackendGlyph x={x} y={y} kind={kind} label={label} scale={.68} labelSize={30} color={['redis','repository'].includes(kind)?c.teal:['kafka','consumer'].includes(kind)?c.purple:c.blue}/>
  </g>;})}
  <text x={65} y={676} fill={c.muted} fontSize={22}>图标识别对象；连线、载荷和状态变化解释它的实际行为。</text>
 </svg></AbsoluteFill>;
};
