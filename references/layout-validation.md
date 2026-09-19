# 布局契约与静态检查

把画面布局当作可检查的数据，而不是只在渲染后靠截图找问题。正式场景至少为面板、文字块和跨节点连线登记以下信息：

```json
{
  "canvas": {
    "width": 1920,
    "height": 1080,
    "safeArea": {"left": 72, "right": 72, "top": 100, "bottom": 100}
  },
  "scenes": [{
    "id": "main-flow",
    "nodes": [{
      "id": "editor",
      "bounds": {"x": 90, "y": 390, "width": 430, "height": 420},
      "contentBox": {"x": 114, "y": 506, "width": 382, "height": 280}
    }],
    "textBlocks": [{
      "id": "editor-subtitle",
      "box": {"x": 118, "y": 438, "width": 360, "height": 28},
      "text": "用户正在编辑的目标容器",
      "fontSize": 17,
      "maxLines": 1
    }],
    "routes": [{
      "id": "editor-to-schema",
      "from": {"node": "editor", "side": "right", "fraction": 0.5},
      "to": {"node": "schema", "side": "left", "fraction": 0.5},
      "points": [[520, 600], [565, 600], [565, 600], [610, 600]]
    }]
  }]
}
```

## 布局规则

- `bounds` 是节点外框；`contentBox` 必须位于外框内，标题、副标题和页脚不得侵入内容区。
- 节点之间默认不得重叠。确有视觉叠加时，在 manifest 的 `allowOverlap` 中显式登记原因。
- 文字块必须提供固定宽度和高度；使用 `wrapText`/`WrappedLabel` 或缩短标签，不依赖 SVG 文本自动换行。
- 连线从端口出发并到达端口。用 `routeOrthogonal` 或 `Connect` 生成路径；反馈线为其预留 `channelY`/`channelX`，避免穿过其它节点。
- 路由默认必须由水平/垂直线段组成；斜线只有在确实表达方向或空间关系时才允许，并在 route 上设置 `allowDiagonal: true` 与 `reason`。不允许用 1–3px 的微小折点修补坐标，应该合并相邻线段；确有必要时显式设置 `allowShortSegments: true` 与 `reason`。
- 动态场景优先让同一组点同时驱动静态路径、箭头和载荷；不要分别手写三套坐标。模板 `geometry.ts` 的 `assertOrthogonalRoute` 可在渲染前拒绝斜线和微小折点。
- 路由点、文字块和关键节点保持在画布安全区内。安全区用于可读性，不改变系统语义。

## 检查命令

在 Skill 目录执行：

```text
node scripts/check-layout.mjs <path-to-layout-manifest.json>
```

仓库根目录的脚本用于维护和发布前检查；复制 `assets/remotion-template/` 到目标项目后，应使用模板内同名脚本。两份脚本保持同一套布局契约，避免目标项目只得到较弱的检查。

脚本只做可判定的结构检查：画布边界、节点/内容区、节点重叠、文字估算行数、端口端点和路线穿越。它不能判断颜色、字体观感或语义是否讲对；这些仍在渲染后的少量关键帧和完整动态片段中复核。

推荐顺序：

`布局 manifest → TypeScript 检查 → layout-check → Remotion 渲染 → ffprobe/章节检查 → 关键帧复核`

检查失败时先修 manifest 或组件接口，再渲染；不要用截图标注代替可重复的布局约束。检查通过也要在目标分辨率查看转角、箭头尖端和父级缩放后的线路；正交路径不会自动保证端点语义正确。
