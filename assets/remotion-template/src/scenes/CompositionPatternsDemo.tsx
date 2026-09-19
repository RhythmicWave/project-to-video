import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Agent, Archive, Label} from '../visual/Systems';
import {InstanceSelection, OverviewDetail, ParallelLanes} from '../visual/Scenes';
import {Transfer} from '../visual/Behaviors';
import {c} from '../visual/theme';

const Overview = () => <g>
  <rect x={20} y={20} width={980} height={490} rx={24} fill={c.surface} stroke={c.line} strokeWidth={3}/>
  <Label x={55} y={67} anchor="start" size={28}>应用</Label>
  <rect x={80} y={190} width={190} height={120} rx={15} fill="#233A4C" stroke={c.blue}/>
  <Label x={175} y={260} size={28}>请求入口</Label>
  <Agent x={515} y={245} r={65} label="处理阶段"/>
  <Archive x={840} y={245} scale={.75} label="结果存储"/>
  <Transfer points={[[270,245],[440,245]]} time={-1} start={0} end={1}/>
  <Transfer points={[[590,245],[745,245]]} time={-1} start={0} end={1}/>
</g>;

export const CompositionPatternsDemo = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), time = frame / fps;
  return <AbsoluteFill style={{background:c.bg,fontFamily:'"Microsoft YaHei",sans-serif'}}>
    <svg viewBox="0 0 1280 720">
      {time<7?<>
        <Label x={55} y={65} size={31} anchor="start">候选集合 → 选中实例 → 输入送达</Label>
        <g transform="translate(130 160)"><InstanceSelection time={time} selectAt={2} selectedId="worker-b" instances={[
          {id:'worker-a',label:'处理器 A',state:'空闲'},
          {id:'worker-b',label:'处理器 B',state:time<4?'空闲':'处理中'},
          {id:'worker-c',label:'处理器 C',state:'空闲'},
        ]}/></g>
        <Transfer points={[[75,220],[95,220],[95,317],[125,317]]} time={time} start={2.5} end={4} label="请求"/>
      </>:time<17?<>
        <Label x={55} y={65} size={31} anchor="start">保持全景位置，再进入处理阶段</Label>
        <OverviewDetail time={time-7} start={1} duration={2} source={{x:0,y:0,width:1020,height:550}} full={{x:50,y:100,width:1180,height:560}} mini={{x:35,y:145,width:335,height:200}} detailBox={{x:440,y:150,width:800,height:480}} focus={[515,245]} overview={<Overview/>} title="处理阶段 · 内部步骤" detail={<g>
          <Label x={50} y={70} anchor="start" size={26} color={c.blue}>解析输入</Label>
          <Label x={490} y={70} anchor="start" size={26} color={c.teal}>生成结果</Label>
          <Transfer points={[[180,65],[475,65]]} time={time-7} start={4} end={6} label="已校验数据"/>
          <Agent x={355} y={220} r={45} label="处理者"/>
        </g>}/>
      </>:<>
        <Label x={55} y={65} size={31} anchor="start">各自推进 → 全部分支完成后汇合</Label>
        <g transform="translate(105 170)"><ParallelLanes time={time-17} branches={[
          {id:'a',label:'数据读取',start:0,end:3},
          {id:'b',label:'规则加载',start:.5,end:5},
          {id:'c',label:'权限查询',start:1,end:4},
        ]}/></g>
      </>}
    </svg>
  </AbsoluteFill>;
};
