# 同源架构地图

跨模块、共享状态或主线多次回到同一系统时使用。它承担“系统怎样组成、当前在哪”的定位任务，执行变化由因果时间轴承担；具体方法、字段与条件在局部场景展开。单一短流程可直接保留共同对象，无须增加缩略图。

## 资源与接口

实现：[ArchitectureMap.tsx](../assets/remotion-template/src/visual/ArchitectureMap.tsx)。组合 [BackendGlyph](backend-resources.md)、[CausalTransfer](causal-timeline.md) 及已有几何，不维护第二套图标或时钟。

| 输入 | 内容及用途 |
| --- | --- |
| model.bounds | 地图本地坐标范围，供 OverviewDetail / fitBox 缩放 |
| model.nodes | 稳定 id、中心 x/y、kind、label；可选 shortLabel、scale、color、serviceMark |
| model.edges | 稳定 id、from/to、正交 points、relation=call/data/event/observation；可选 color |
| model.regions | 可选区域 id、label、box；表示真实层级或边界，不等同于运行实例 |
| focus | 当前镜头关联的节点 ID；外部方框定位，其他范围降调，不触发执行 |
| timeline / time | 可选因果时间轴及秒；task.actor 对应节点，transfer.route 对应边，reverse 表示返回 |
| compact | 缩略显示使用 shortLabel；保持相同 ID、位置与连接 |

```tsx
const model = validateArchitectureModel({bounds, nodes, edges, regions});
validateMapBindings(model, timeline);
<ArchitectureMap model={model} timeline={timeline} time={frame/fps}/>
// 在局部保留同一模型，由父级等比缩小；范围定位与业务执行独立。
<ArchitectureMap model={model} compact focus={['repository', 'database']}/>
```

先写稳定模型，再用同一模型生成全景和缩略图；局部使用同 ID 对应对象，必要时显示全景简称与实现名的对应。缩略图可只表达定位，执行仍在局部推进。自动布局、避障、接线事实及对象所属范围由项目核实；组件不推导分层，也不强制使用 Handler/Service/Repository。

`validateArchitectureModel` 检查唯一身份、端点引用及线路几何；`validateMapBindings` 检查 route 引用，并要求接收者任务依赖载荷到达，包括反向返回。它们在模型编排后调用；运行区间、join及状态检查继续使用因果时间轴。区域、标签、线路登记布局 manifest，重点查看缩放后的长标签和交叉路径。

## 中性示例

[ArchitectureMapDemo.tsx](../assets/remotion-template/src/scenes/ArchitectureMapDemo.tsx) 用一条资源读取请求展示分层和缓存/数据库关系，再将同一地图缩到侧面，展开请求 #42 的 miss、DB 返回与回填。示例是教学编排；不同项目按其同步/异步回填与错误边界调整，不能据此宣称源码采用相同实现。

[可播放预览](../assets/previews/architecture-map.mp4)为 720p、30fps、21秒。它展示技术细节在需要的镜头进入画面，样式与章节顺序可按项目替换。

```text
npm ci
npm run check
npm run check:map
npm run check:layout
npm run render:map
```

所有形状来自本模板 SVG；字体由使用环境提供。复制或局部适配时保留语义：区域定位、状态执行、数据提交各自拥有输入，未走到的边仍是灰色结构。
