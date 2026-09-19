# 可选场景模式：逐层聚焦导航

**用途**：全景与细节之间切换时，显示当前讲解路径。主画面展开一个子流程，导航同步追加或高亮该层，返回时收回。它帮助观看者知道“正在讲哪里、从哪里进入”。

这是讲解场景层的可选资源。需要反复进入两层以上局部、对象之间存在清楚的包含或调用路径时，可以使用。短视频、单层流程、网状关系或高频跨区跳转，可选择面包屑、全局小地图、区域高亮、调用栈视图等表达；依据项目和画面空间判断，不要求同时采用所有导航。

## 语义规则

- 导航默认表示当前讲解的聚焦路径。它不是仓库目录，也不自动等于类继承、资源所有权或线程关系。
- 项目若把它用于真实模块树，应先有包含关系证据。调用路径与包含关系不同，必要时明确标记视图类型。
- 当前路径和活动节点随镜头实际展开推进；后续节点不能提前获得高亮。
- 跨分支时更新路径，保留共同的上层；可以回退，不能为了树形外观虚构父子关系。
- 短标签、缩进、连接枝与当前层高亮即可；主画面承担流程与行为，导航负责位置。
- 导航不依赖固定边栏位置、颜色或缩进大小。根据字幕区、语言和画面密度调整；没有收益时省略。

## 可运行资源

- [FocusTrail.tsx](../assets/remotion-template/src/scenes/FocusTrail.tsx)：SVG 导航组件，不依赖项目或 Remotion 时钟。
- [FocusTrailDemo.tsx](../assets/remotion-template/src/scenes/FocusTrailDemo.tsx)：7 秒演示 Composition，按镜头时间逐层聚焦。
- [示例视频](../assets/previews/focus-trail.mp4)：展示导航与主画面同步展开。

在 SVG 内使用，字体由父级设置。必需参数是 `path` 与 `time`；`time` 和 `enterAt` 使用相同单位，通常为秒。路径按祖先到当前层排序，`enterAt` 按展示次序递增。

```tsx
<FocusTrail
  path={[
    {id: 'service', label: '服务', enterAt: 0},
    {id: 'request', label: '请求处理', enterAt: 2},
    {id: 'storage', label: '结果存储', enterAt: 4},
  ]}
  time={frame / fps}
  x={60}
  y={180}
/>
```

| 参数 | 含义 |
| --- | --- |
| path | 每项有稳定 id、显示 label 和可选 enterAt |
| time | 调用者提供的当前时间；支持任意位置重新计算 |
| activeId | 可选；默认最后一个已出现节点 |
| x / y | 导航起点 |
| indent / rowGap / fontSize | 缩进、行高和字号 |
| color / activeColor / lineColor | 默认文字、活动节点与枝线颜色 |

组件不负责自动换行、滚动或推导项目关系。长路径应先折叠不重要祖先、缩短标签或更换表达。生成后检查长中文标签、跨分支、回退和章节起始状态。

在模板目录运行：

```text
npx tsc --noEmit
npx remotion render src/index.tsx FocusTrailDemo out/focus-trail.mp4
```
