import {wrapText} from '../visual/geometry';
export type FocusEntry={id:string;label:string;enterAt?:number};
export type FocusTrailProps={
  path:FocusEntry[];time:number;activeId?:string;x?:number;y?:number;
  indent?:number;rowGap?:number;fontSize?:number;
  color?:string;activeColor?:string;lineColor?:string;
  maxWidth?:number;
};

/** 可选的讲解路径导航。时间与业务路径由调用者提供。放在 SVG 内使用。 */
export const FocusTrail=({path,time,activeId,x=0,y=0,indent=16,rowGap=48,fontSize=24,color='#97AFB9',activeColor='#F4C576',lineColor='#35505D',maxWidth}:FocusTrailProps)=>{
  const shown=path.filter(entry=>time>=(entry.enterAt??0));
  const active=activeId??shown.at(-1)?.id;
  let offset=0;
  return <g transform={`translate(${x} ${y})`} aria-label="当前讲解路径">
    {shown.map((entry,i)=>{
      const progress=Math.max(0,Math.min(1,(time-(entry.enterAt??0))/.4));
      const size=entry.id===active?fontSize+3:fontSize;
      const lines=maxWidth?wrapText(entry.label,maxWidth-i*indent,size):[entry.label];
      const base=offset;offset+=rowGap+(lines.length-1)*(fontSize+7);
      return <g key={entry.id} opacity={progress} transform={`translate(${i*indent} ${base+6*(1-progress)})`}>
        {i>0&&<path d={`M${-indent} ${-rowGap+12} V-8 H-5`} stroke={lineColor} strokeWidth={2} fill="none"/>}
        <text y={0} fill={entry.id===active?activeColor:color} fontSize={size}>{lines.map((line,j)=><tspan key={j} x={0} dy={j?fontSize+7:0}>{line}</tspan>)}</text>
      </g>;
    })}
  </g>;
};
