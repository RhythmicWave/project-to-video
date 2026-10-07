import {AbsoluteFill,useCurrentFrame,useVideoConfig} from 'remotion';
import {WorkerRack,EventRail,SnapshotStack,LeaseBadge,AtomicWriteSet} from '../visual/BackendResources';
import {c} from '../visual/theme';

/** 中性示例：资源状态由场景给出，所有时间使用秒。 */
export const BackendResourcesDemo=()=>{
 const time=useCurrentFrame()/useVideoConfig().fps;
 const section=Math.min(2,Math.floor(time/8)),local=time-section*8;
 const title=['执行参与者与消息片段','共享快照、副本与租约','事务写集合：提交或回滚'][section];
 const caption=['消息标记、执行状态、持久化结果使用不同输入。','时效与租约是资源状态；接管和降级由调用场景组织。','共同提交仅覆盖同一事务内的写入。'][section];
 const rows=[{label:'记录 A',before:'旧值',after:'新值'},{label:'记录 B',before:'旧值',after:'新值'}];
 return <AbsoluteFill style={{background:c.bg,fontFamily:'"Microsoft YaHei", sans-serif'}}><svg viewBox="0 0 1280 720" width="1280" height="720">
  <text x="60" y="65" fontSize="34" fontWeight="600" fill={c.text}>{title}</text>
  {section===0&&<>
   <WorkerRack x={245} y={280} label="处理进程" state={local<2?'idle':local<5?'active':'done'}/>
   <WorkerRack x={245} y={490} scale={.65} label="等待进程" state="blocked"/>
   <EventRail x={510} y={245} width={670} label="消息片段 · 可见条目" entries={[{id:'m1',label:'事件 A',state:local<3?'pending':'marked'},{id:'m2',label:'事件 B',state:local<3?'pending':'selected'},{id:'m3',label:'事件 C',state:'pending'}]}/>
  </>}
  {section===1&&<>
   <SnapshotStack x={100} y={240} width={340} label="缓存副本" generation={local<4?'本轮结果':'上一轮结果'} rows={['条目 A · 内容摘要','条目 B · 内容摘要','条目 C · 内容摘要']} freshness={local<4?'fresh':'expired'}/>
   <LeaseBadge x={730} y={250} width={360} label="更新租约" holder={local<6?'处理进程 A':'处理进程 B'} status={local>=5&&local<6?'expired':'held'} remaining={local<5?1-local/5:local<6?0:.9}/>
  </>}
  {section===2&&<>
   <AtomicWriteSet x={70} y={235} width={530} label="成功路径" rows={rows} phase={local<2?'before':local<4?'prepared':'committed'}/>
   <AtomicWriteSet x={680} y={235} width={530} label="失败路径" rows={rows} phase={local<2?'before':local<4?'prepared':'aborted'}/>
  </>}
  <rect x="60" y="621" width="1160" height="60" rx="15" fill={c.surface}/><text x="84" y="661" fontSize="24" fill={c.muted}>{caption}</text>
 </svg></AbsoluteFill>;
};
