import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {Agent,Beacon,DataStore,Label,Model,Paper,Terminal,Toolbox} from '../visual/Systems';
import {AwaitResume,PhaseLoop,Transfer} from '../visual/Behaviors';
import {c} from '../visual/theme';
import {FocusTrail} from './FocusTrail';

export const VisualLibraryDemo=()=>{
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),time=frame/fps;
  return <AbsoluteFill style={{background:c.bg,fontFamily:'"Microsoft YaHei",sans-serif'}}><svg viewBox="0 0 1280 720">
    {time<8?<>
      <Label x={55} y={62} anchor="start" size={31}>系统表达 · 同一套视觉语言</Label>
      <Agent x={160} y={210} r={55} phase={time/8} label="执行者"/>
      <Model x={440} y={200} scale={.65} label="计算服务"/>
      <Toolbox x={735} y={192} scale={.65} open={time>3?.6:0} label="工具能力"/>
      <DataStore x={1050} y={198} scale={.65} kind="database" state={time > 4 ? 'write' : 'read'} operation={time > 4 ? 'upsert' : 'query'} label="结构化数据库"/>
      <Terminal x={66} y={425} scale={.7} typed="提交任务\n结果就绪" status="客户端"/>
      <Paper x={563} y={498} scale={.65} label="结构化内容"/>
      <Beacon x={862} y={452} pulse={time/4%1} label="事件来源"/>
    </>:time<16?<>
      <Label x={55} y={62} anchor="start" size={31}>等待与恢复 · 旁路仍可推进</Label>
      <g transform="translate(100 230)"><AwaitResume time={time-8} start={0} waitAt={2} resumeAt={5} end={8} task="任务 A" other="任务 B" signal="I/O 完成" width={1040}/></g>
    </>:<>
      <Label x={55} y={62} anchor="start" size={31}>循环与层级 · 根据当前机制组合</Label>
      <FocusTrail time={time-16} x={75} y={220} path={[{id:'app',label:'应用'},{id:'task',label:'任务处理',enterAt:1},{id:'iteration',label:'迭代阶段',enterAt:2}]}/>
      <g transform="translate(815 365)"><PhaseLoop phases={[{id:'decide',label:'决策'},{id:'execute',label:'执行'},{id:'observe',label:'观察'}]} beats={[{at:0,phaseId:'decide'},{at:2,phaseId:'execute'},{at:4,phaseId:'observe'},{at:6,phaseId:'decide'}]} time={time-16}><Agent x={0} y={0} r={29} label=""/></PhaseLoop></g>
      <Transfer points={[[340,400],[430,400],[430,365],[565,365]]} time={time-16} start={2} end={4} label="进入局部"/>
    </>}
  </svg></AbsoluteFill>;
};
