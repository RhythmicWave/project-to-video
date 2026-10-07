# Remotion 起始工程

复制到目标项目的 `.project-to-video/remotion/` 使用。此模板提供中性表达资源，正式视频按项目事实实现并注册；默认成片为1080p/30fps，示例为720p/30fps。

| Composition | 时长 | 用途 / 导出命令 |
| --- | --- | --- |
| ArchitectureMapDemo | 21s | 同源架构与机制展开；npm run render:map |
| CausalTimelineDemo | 12s | 顺序、分叉、汇合；npm run render:causal |
| BackendGlyphsDemo | 8s | 十一种参与者轮廓；npm run render:glyphs |
| BackendResourcesDemo | 24s | 进程、消息、快照、租约、事务；npm run render:backend |
| FocusTrailDemo | 7s | 逐层定位；npm run render |
| VisualLibraryDemo | 24s | 对象、等待恢复与循环 |
| CompositionPatternsDemo | 25s | 候选选择、全景展开与并行 |
| ProgressiveCausalDemo | 25s | 递进步骤、条件门和结构转换；npm run render:progressive |

```text
npm ci
npm run check
npm run check:layout
npm run check:timeline
npm run check:map
npm run check:pacing
npm run dev
```

`check:layout` 核对基础与因果示例，并从架构模型生成 layout.map.json 检查全景和局部。实际项目登记自己的长标签、容器、端口及线路。模板与 Skill 根目录的 check-layout.mjs 使用同一契约，维护时同步。

`src/index.tsx` 保留 registerRoot，Composition 在 src/Root.tsx 注册。每个正式镜头使用纯帧函数，可独立重建；事实、名称、布局和证据作为项目数据。字体来自使用环境，中文及状态符号需要实渲染检查。

按需复制 src/visual 的实现及其 imports：BackendGlyphs/BackendResources 识别对象与状态，ArchitectureMap 保持拓扑身份，causal-timeline/CausalMotion 绑定执行，Scenes/FocusTrail 处理可选镜头及导航。参数和限制见[视觉资源](../../references/visual-library.md)、[架构地图](../../references/architecture-map.md)与[因果时间轴](../../references/causal-timeline.md)。

`pacing-budget.mjs` 为无配音字幕估算阅读预算，并在压缩已经证明相同的图像段时保留必要时间；它不负责证明图像相同。编排与编码后检查见[节奏说明](../../references/pacing-and-timing.md)。

示例不能证明项目使用同样的架构、并发或回填方式。用户已定义的技术层级、关键条件及执行顺序按项目核实。新组件留在项目目录；共享维护需用户要求。

正式导出使用真实 Composition ID，例如已注册 Architecture 时：

```text
npx remotion render src/index.tsx Architecture ../output/architecture.mp4 --codec=h264
```

离屏渲染可使用 `--browser-executable=<已安装浏览器路径>`；这是动画工具，不改变用户浏览器的选择。纯 SVG 可按[原生渲染](../../references/native-svg-rendering.md)使用 resvg + sharp；不需要所有项目额外安装这些库。
