# 选择视觉资源与保持风格

先确定画面要解释的职责、数据或状态后果，再选资源。图标负责识别对象，载荷与状态变化负责解释行为；现有能力不合适时在项目中组合或新增，不为套用组件改变事实。

## 按讲解任务查接口

| 当前要表现什么 | 可选能力 | 参数与示例入口 |
| --- | --- | --- |
| 参与者、存储、工具与数据 | Agent、Model、Archive、DataStore、Toolbox、Paper、Terminal、Payload | [基础对象与行为](visual-components.md) |
| 后端职责、事件批次、快照、租约或事务 | BackendGlyph、WorkerRack、EventRail、SnapshotStack、LeaseBadge、AtomicWriteSet | [后端对象与状态](backend-resources.md) |
| 全景、缩略图与真实连接 | ArchitectureMap | [同源架构地图](architecture-map.md) |
| 到达、执行、提交、返回与汇合 | CausalActor、CausalTransfer、CausalReady；依赖编译器 | [因果时间轴](causal-timeline.md) |
| 多实例选择、全景进入局部、并行泳道 | InstanceSelection、OverviewDetail、ParallelLanes | [组合场景](composition-patterns.md) |
| 两层以上局部的持续定位 | FocusTrail；或小地图、区域高亮等一种主要导航 | [聚焦导航](focus-navigation.md) |
| 条件分支与前后结构变化 | ProgressiveReveal、CausalStep、DecisionGate、ContextTransform | [递进因果](progressive-causal.md) |
| 等待恢复、阶段循环、纯结构连接 | AwaitResume、PhaseLoop、Transfer、Connect | [基础对象与行为](visual-components.md#行为模式) |

接口文档提供实现、参数、边界和中性预览；只读本次需要的资源。资源按四种职责组合：基础绘制（形状、文字、几何），系统表达（对象与状态），行为模式（多个对象如何协作），讲解场景（怎样连续展开）。颜色、字体与线型跨层共享，业务名称、路线和证据留在项目数据中；这些分类不强制目录或固定版式。

## 形象与系统语义

嵌套、连接和排队必须对应事实。真实包含、调用展开和讲解窗口用不同标题或边界区分；函数创建一个对象，不说明它拥有全部共享依赖。外部服务保留在实际进程边界之外，字段嵌在所属载荷或记录中。

请求、响应、事件与持久化保持稳定的方向和线型。不同下行/上行通道连接实际端点，再以相同 ID 关联。等待显示暂停点与恢复者；没有业务队列就不画成排队，只有实际并发才能让旁路同时推进。需要解释 Future 本身时，再展开 pending/resolved 状态。

项目中设计的新资源先验证再使用；普通制作不改写共享库。状态动画有业务含义，不以持续脉冲或粒子代替因果变化。

## 新组件接入现有风格

先看资源演示、Systems.tsx 和 theme.ts，再决定复用、局部适配或新增。新组件对齐当前项目的字体层级、主色/状态色、描边粗细、圆角、阴影强度、视角和运动节奏；优先复用 Label、Transfer、端口函数及现有材质。

不同对象应有可辨识轮廓，同类对象保持相同结构。不要混用写实图、表情字符、不同风格图标库与线稿，除非场景明确需要这种区分。颜色配合文字、形状或线型，避免只靠颜色表达状态。

新增图标只实现当前语义需要的状态，并检查大图与缩略图。把图形、状态和时序分开：图形识别职责，执行环来自处理事件，聚焦用区域或外部轮廓。状态动画必须有含义；不为所有对象加入持续转动或脉冲。

参数化只保留当前语义需要的输入。连线端口、标签区和缩略图检查见[布局契约](layout-validation.md)；镜头的详略与可见后果见[讲解质量](explanation-quality.md)。
