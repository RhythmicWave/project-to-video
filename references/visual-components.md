# 可直接复用的视觉组件

从 `assets/remotion-template/src/visual/` 复制所需实现及 `theme.ts` 到目标项目，或者复制整个模板。组件均在父级 SVG 中使用；坐标、时间与业务标签由调用者提供。颜色集中在 theme.ts，可按项目调整。

按实际 imports 复制依赖。使用节奏组件时带上 `pacing.ts`；档位和局部覆盖见[节奏与阅读时间](pacing-and-timing.md)。

## 系统表达

[Systems.tsx](../assets/remotion-template/src/visual/Systems.tsx) 提供以下组件。`x/y` 是局部原点；尺寸用 `scale` 或机器人 `r` 控制。文字使用父级字体。

| 组件 | 表示什么 | 关键参数与边界 |
| --- | --- | --- |
| Agent | 机器人头部形象的执行参与者 | r、label、phase、paused；统一使用头部轮廓，phase 由时间推导，paused 为等待表情，不代表业务锁 |
| Model | 计算/模型服务 | scale、active、label；点阵亮度只帮助识别活动，不表达真实并发 |
| Terminal | 输入与结果界面 | scale、typed、status；最多三行，长内容应拆节拍 |
| Archive | 文件夹中的记录文件 | scale、label、count；count 控制 0–6 条可见记录，不是实际数据总量 |
| DataStore | 抽象持久化容器 | kind=`database`/`archive`/`graph`；state=`idle`/`read`/`write`/`error`；operation=`query`/`insert`/`update`/`upsert`。database 用圆柱表达结构化记录，archive 用文件归档，graph 用节点关系；不绑定 SQLite/Neo4j 品牌 |
| Paper | 结构化载荷或文档 | scale、label、lines、color；字段归属需要调用者另行嵌套 |
| Toolbox | 可调用的工具能力 | scale、open、label；open 使用 0–1，表示打开程度 |
| Beacon | 事件来源或广播点 | pulse、label；pulse 使用 0–1 周期，相邻对象和线路说明实际消费关系 |
| Payload | 沿链路传递的载荷 | label、small、color、opacity、minWidth；短标签可调小最小宽度，默认188兼容旧画面；small 只显示标记 |
| Label | SVG 文字 | size、color、anchor；不自动排版，长文本要缩短或自行换行。固定宽度文本优先使用 `WrappedLabel` |

机器人、文件夹、数据库和工具箱提供可辨识的形象；是否使用拟物图标根据项目和画面密度选择。不要仅凭形象推断进程、持久化保证或自主决策能力。面板布局使用 `panelRegions` 预留 header/content/footer 安全区。

## 行为模式

有顺序、并发或状态提交的执行动画优先使用[因果时间轴](causal-timeline.md)：`causal-timeline.mjs` 编译依赖，`CausalMotion.tsx` 提供传输、参与者、结果与镜头绑定，`CausalTimelineDemo` 演示顺序/分叉/汇合。后续步骤等前置完成，路径仅点亮已传输前缀；字幕和导出采样共用同一事件时间。

后端应用实例、事件片段、快照、租约与事务写集合见[后端状态资源](backend-resources.md)，实现位于`BackendResources.tsx`，带有独立的中性演示。它们表示资源与状态，消息传递、接管、降级和共同提交的时序由场景控制。

[Behaviors.tsx](../assets/remotion-template/src/visual/Behaviors.tsx) 使用显式时间，不读取真实时钟。

**Transfer**：`points` 为折线坐标；`time/start/end` 使用同一时间单位，且 end > start。轨迹、箭头与载荷共享路径，避免线和移动方向分离。载荷到达后的状态变化由调用场景控制；传递结束后不会自行生成响应。`showPath=false` 可以复用已有线路。

**Connect**：以两个节点的 `Box + Side + fraction` 作为端点，内部调用 `routeOrthogonal` 生成正交路径；反馈或回流路径使用 `channelY`/`channelX`，不要手写穿过节点的折线。

**AwaitResume**：提供 `start < waitAt < resumeAt < end`、当前 time、task、other、signal 和 width。上方任务停在等待点，下方旁路继续，恢复信号使任务继续推进。它只适合源码明确允许旁路工作的机制；顺序调用用紧凑时间条即可，不能靠该组件虚构并发。等待区的横向距离是教学时间，不是性能数据。

**PhaseLoop**：`phases` 列出阶段 id/label；`beats` 显式指定 at/phaseId，time 控制当前高亮。再次进入某阶段必须再给一个 beat，不无限自动转动。阶段 id 唯一，beat 引用已存在阶段；阶段名宜短、通常 3–5 个。`children` 可放循环主体；需要讲清输入输出时搭配 Transfer 与状态变化。

```tsx
<AwaitResume time={frame / fps} start={0} waitAt={2} resumeAt={5} end={8}
  task="请求处理" other="其他请求" signal="I/O 完成" />
```

## 其他资源

本页维护 Systems.tsx 与 Behaviors.tsx 的接口。后端状态、架构地图、导航、组合场景和递进因果从[资源选择](visual-library.md#按讲解任务查接口)按任务进入；新增组件沿用该页的风格约定。

## 演示与检查

[VisualLibraryDemo.tsx](../assets/remotion-template/src/scenes/VisualLibraryDemo.tsx) 注册了 `VisualLibraryDemo`：前 8 秒为图标，中间 8 秒为等待恢复，后 8 秒为循环与层级组合。[演示视频](../assets/previews/visual-library.mp4)用于快速挑选表达；其业务标签仅为中性示例。

这些形状由仓库中的 SVG 代码生成，预览从同一演示工程渲染，不依赖外部图标服务。字体由使用环境提供；部署或分发时按所选字体的许可处理。

复制模板后运行 `npm ci`、`npm run check`，再运行 `npx remotion render src/index.tsx VisualLibraryDemo out/visual-library.mp4`。复用到项目后仍检查实际标签长度、边界、箭头端点及进入/等待/恢复的时序。优先复用已有能力；缺少适合的语义时在项目中扩展，不为了套模板改变事实。
