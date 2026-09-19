# 多实例、全景展开与并行模式

[Scenes.tsx](../assets/remotion-template/src/visual/Scenes.tsx) 提供三个可选 SVG 组合组件，与 Systems、Behaviors 和 theme 配合使用。[演示](../assets/previews/composition-patterns.mp4)时长 25 秒，对应源码 [CompositionPatternsDemo.tsx](../assets/remotion-template/src/scenes/CompositionPatternsDemo.tsx)。这些是表达能力，不是默认视频模板。

## InstanceSelection：从集合选中一个

传入 `instances`（稳定 id、label、可选 state 与 icon）、selectedId、time、selectAt。先展示集合，到指定时刻才出现选中标记。state 独立传入，选择一个对象不会自动把它标成忙或创建任务。未选中对象仍保留，便于理解多实例。

局部坐标原点是标题左上；width 默认 900，rowHeight 默认 78。第 i 行从 y=52+i×rowHeight 开始，高度 rowHeight−12；调用者可据此确定输入连接端口。icon 是以该行 (77,28) 为原点的 SVG 内容，应保持小尺寸。实例很多时只展示代表性集合或局部窗口，不无限堆行。

## OverviewDetail：同一全景缩小，指向局部展开

overview 是稳定的全景 ReactNode，source 定义它的坐标范围；full、mini 分别为展开前和缩略后的视口。time/start/duration 控制等比缩放。focus 使用全景本地坐标，经过同一变换后得到屏幕锚点，连接到 detailBox。

detail 是局部 SVG 内容，原点为 detailBox 左上角加 (22,65)，标题由 title 提供。内容应放在剩余宽高之内；组件不推导架构、不自动排版或裁剪。局部到转场尾部才出现，方便先定位再讲解。回退可传入反向教学时间，但调用者需同步内部内容状态。

连线表达“正在展开这里”，与业务数据流区分。focus 必须指向真实的讲解对象；全景与局部沿用同一身份、名称、颜色或轮廓。复杂网络不适合树形时，保留全景区域高亮即可。

## ParallelLanes：独立推进与汇合

branches 每项包含唯一 id、短 label、start/end，要求 end > start；time 与它们使用相同单位。条带按共同时间范围布局，重叠区间表示可同时推进，完成状态按各自 end 更新。

join=`all` 时，所有分支完成才显示“全部完成 → 继续”；join=`independent` 时不生成汇合屏障。只适合这两种语义。遇到任一完成、取消竞争、重试或失败短路时，应在项目中扩展相应分支，不把 all 直接套用。横轴是教学时间，不证明多个 CPU 核同时执行。

width 默认 1000、rowHeight 默认 85；包含底部状态预留。一般展示 2–4 条关键分支。并行片段突出整体关系后，再聚焦一条分支，避免同时出现大量新信息。

## geometry：图形端口与变换

[geometry.ts](../assets/remotion-template/src/visual/geometry.ts) 提供 `port(box, side, fraction)`、`fitBox(source, viewport)` 与 `mapPoint(point, transform)`。以这些函数建立共享几何来源，避免移动了图标却忘记连线。box 是图形边界，标签区和避障路径仍由项目安排。
