import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {FocusTrail} from './FocusTrail';

// 无项目依赖的示例；左侧为讲解聚焦路径，右侧为正在展开的区域。
export const FocusTrailDemo=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps;
  const step=time<2?0:time<4?1:2;
  const labels=['应用','请求处理','结果存储'];
  return <AbsoluteFill style={{background:'#101923',fontFamily:'"Microsoft YaHei", sans-serif'}}>
    <svg viewBox="0 0 1280 720" width="100%" height="100%">
      <text x={60} y={76} fill="#E9F1F0" fontSize={32}>逐层聚焦</text>
      <FocusTrail path={labels.map((label,i)=>({id:String(i),label,enterAt:i*2}))} time={time} x={65} y={225} rowGap={66} indent={20} fontSize={27}/>
      {labels.slice(0,step+1).map((label,i)=><g key={label} opacity={Math.min(1,Math.max(0,(time-i*2)/.5))}>
        <rect x={400+i*50} y={145+i*90} width={790-i*100} height={485-i*140} rx={15} fill={i===step?'#1D3040':'#14232E'} stroke={i===step?'#F4C576':'#35505D'} strokeWidth={2}/>
        <text x={428+i*50} y={192+i*90} fill={i===step?'#F4C576':'#97AFB9'} fontSize={27}>{label}</text>
      </g>)}
    </svg>
  </AbsoluteFill>;
};
