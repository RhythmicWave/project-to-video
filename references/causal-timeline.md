# 因果时间轴

节点、移动载荷、状态字段、字幕涉及先后或并发时使用。手写若干相邻时间无法保证前一动作拉长后，后一动作仍等它完成。

## 最小模型

实现：`assets/remotion-template/src/visual/causal-timeline.mjs` 和 `.d.mts`。编排使用秒，`compileTimeline(events, fps)` 将全部时间量化为整数帧；运行区间为 `[startFrame,endFrame)`。任意帧由纯函数重建，不使用 wall clock、setTimeout、上帧状态或 CSS 自运行动画。

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定的事件标识，画面和字幕引用它 |
| `kind` | `task` 处理、`transfer` 传输、`state` 状态提交、`join` 汇合、`presentation` 镜头动作 |
| `duration` | 动作时长；传输至少一帧，状态/汇合可为零 |
| `after` | 等待所列事件全部**完成**；可用于顺序链和汇合 |
| `with` | 与指定事件同时**开始**，显式表达分叉 |
| `at` | 最早呈现时间；有依赖时不能提前越过依赖 |
| `actor` | task 对应的参与者，供执行状态绑定 |
| `motion` | 可覆盖采样策略；传输和镜头动作默认全区间采样，静态处理默认只采边界 |

```ts
const timeline = compileTimeline([
  {id: 'prepare', kind: 'task', at: 0, duration: 1, actor: 'sender'},
  {id: 'send', kind: 'transfer', after: ['prepare'], duration: .8},
  {id: 'receive', kind: 'task', after: ['send'], duration: .5, actor: 'receiver'},
  {id: 'commit', kind: 'state', after: ['receive'], duration: 0},
]);
// 改 prepare.duration 后，其余事件随依赖移动。
const value = timeline.done('commit', time) ? 'ready' : 'pending';
```

并发分支可让两个发送事件都依赖 fork 完成，并让第二个 `with` 第一个；分支内部仍各自用 after。join 等待全部返回事件。不能以某一路“看起来快结束了”或字幕切换代替汇合。允许真实的异步发送、续约和心跳与主体并行，先核实项目边界再声明依赖。

## 绑定画面

实现：`src/visual/CausalMotion.tsx`。

- `CausalTransfer` 接受同一份 timeline、event、time、points。传输前展示灰色拓扑；传输中彩色前缀只到载荷位置；箭头尖端在到达后出现，已完成路径降低强调。路径、载荷和尖端使用同一组点。短标签可通过 payloadMinWidth 减小最小宽度（默认188兼容旧画面），实际宽度仍容纳文字；载荷体积和沿途标签留白一起复核。
- `CausalActor` 用 actorPhase 驱动参与者的等待、执行、完成；children 接收 phase。参与者正常可见与正在执行分开，不能用章节聚焦代替执行状态。
- `CausalReady` 在事件**完成**后显示新结果；context 控制之前是否保留低强调身份。字段值也必须由 done 派生，不能先写入结果再仅降低整体透明度。
- `Reveal` 是 presentation 的可见性插值；展示对象的名称不意味着对象已收到请求。执行环、提交勾、成功值都绑定 task/transfer/state 的实际边界。

字幕以 `[0, text, {event, edge: 'start' | 'end'}]` 绑定事件；第一项只是兼容旧调用的后备值。新制作的流程字幕都给引用，不另写一套触发时间。用 `resolveChapter` 统一生成有效字幕和 `motionWindows`。左侧导航可用可选的 `navigation: eventId[]` 绑定相同事件。

## 与导出采样的契约

`timelineWindows` 返回动作区间及开始、结束和字幕/导航的边界；导出器按它采样，而不是每条字幕后固定拍几秒。场景时间始终保持真实 frame/fps。任务持续但画面不变时可以复用图片；任务自身的进度条、倒计时、旋转等会变化时，设置 motion=true 或给其独立 presentation 事件。

缩短停顿只能合并相邻、完全相同的图像，并同步字幕及实际章节索引。检查每个未采样区间首、中、尾的源 SVG/像素是否一致，避免采样优化冻结延迟发生的后续动作。

## 验证与例子

中性示例：`src/scenes/CausalTimelineDemo.tsx`；预览：[causal-timeline.mp4](../assets/previews/causal-timeline.mp4)。包含顺序发送、显式分叉、较慢分支、汇合和结果发布。

```text
npm run check
npm run check:timeline
npm run render:causal
```

编译拒绝缺失依赖、循环、非法时间、无法同时开始的 fork 和章节/字幕越界。单元测试修改前置时长，确认传输、接收、结果及字幕一起移动；检验双分支汇合和整数帧边界。

项目还要检查：每条亮线引用 transfer；接收 task 依赖该传输完成；成功状态等待相应处理/提交；事件前一帧、开始、结束前一帧、结束帧正确；顺序没有重叠，实际并发保留。抽帧复核全景和复杂分支。引擎只能执行已声明的依赖，不能替代源码事实及依赖语义的审阅。

旧 Transfer/Connect 可继续用于纯结构示意；迁移执行动画时将独立 start/end 换成事件引用，参与者状态、字幕和采样一起迁移，避免同时维护两套时钟。
