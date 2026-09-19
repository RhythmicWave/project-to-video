# project-to-video

> 把项目主线做成一个动画，帮助你快速理解。

你有没有把一个项目写进简历，却在面试前不太敢让面试官继续追问？几个月后重新打开仓库，入口在这里，状态在另一个包，事件又绕到第三个模块。花了一晚上拼回调用链，第二天仍然担心一句“为什么这样设计？”就把整段讲解打乱。

代码和文档往往只给出局部线索。真正耗时的是把入口、模块、状态、数据流和设计取舍重新连成一张图。

`project-to-video` 帮你完成这件事。它从 README、源码和测试中梳理核心链路，用 Remotion 做成一段连续动画：先看全景，再跟着真实任务进入局部，看到对象怎样移动、等待、分支和恢复。看完后，你能沿着同一条主线讲清项目如何运行，再回到笔记和源码查原因与细节。它适合面试前快速回顾，也适合接手或研究陌生项目。

[先看效果](#先看效果) · [快速开始](#快速开始) · [可复用组件](references/visual-components.md) · [Remotion 模板](assets/remotion-template/README.md)

---

## 先看效果

下面的预览来自 Skill 自带的通用演示工程。
<video controls src="assets/previews/composition-patterns.mp4" title="Title"></video>


| 预览 | 展示什么 |
| --- | --- |
| [递进因果](assets/previews/progressive-causal.mp4) | 步骤、决策分支和上下文变化如何逐步出现 |
| [组合场景](assets/previews/composition-patterns.mp4) | 多实例选择、全景进入局部、并行推进与汇合 |
| [视觉组件](assets/previews/visual-library.mp4) | Agent、存储、终端、模型、工具，以及等待恢复和循环 |
| [逐层聚焦](assets/previews/focus-trail.mp4) | 从系统全景进入子流程时，怎样保留当前位置 |

如果当前页面不直接显示播放器，点击表格中的视频文件即可播放。

## 你可能正需要它，如果

- 简历上有项目，却只能讲功能，讲不清一次请求怎样穿过系统；
- 代码和文档都能找到，但读完之后仍然没有一张整体地图；
- 面试前需要快速找回状态、数据流和设计取舍；
- 接手一个新项目，需要先理解主线，再决定哪些细节值得深入。

## 它会帮你看清什么

动画把代码里分散的关系放回同一条时间线上：

- 一个请求或任务从哪里进入，经过哪些边界，最后把结果交给谁；
- 哪个对象持有状态，什么时候等待，什么事件让它继续；
- 哪些步骤真的并行，哪些只是先后发生；
- 一个分支为什么出现，选择之后对后续流程有什么影响；
- 省略的实现细节应该回到哪段源码、测试或复习笔记。

画面通常先给出全景，再放大关键子流程；同一条消息、任务或关联 ID 会在镜头切换后继续保持身份。看完视频，脑中留下的是一条可以复述的链路。

## 从项目到视频

Skill 的工作过程如下，成片只呈现理解最有帮助的部分：

1. **先摸清项目。** 先读 README；如果没有 README，会询问是否先调研并补建。随后从真实入口、触发点和测试出发，跟到状态变化、结果去向和重要分支。
2. **整理理解重点。** 写出项目名、一句总述和 3–4 条有依据的项目要点，再从面试官视角列出可能的追问，找出最容易混淆、也最值得展开的部分。
3. **选一条主线。** 以任务或数据生命周期为单位比较候选流程，确定一条锚点主线和必要的支撑机制。通常制作一条视频，确实存在独立生命周期时最多拆成三条。
4. **设计连续画面。** 依据机制选择全景聚焦、递进因果、前后对照、并行泳道或横切回挂。文字只承担名称、状态、条件和必要提示，动作负责说明因果。
5. **补上视频没有展开的部分。** 按章节写短笔记，补充实现取舍、边界条件和源码入口，并把面试问题关联到视频时间或笔记段落。

## 目标项目里的产物

Skill 会在目标项目根目录创建独立的 `.project-to-video/`。目录按实际需要生成，不要求每个项目都填满：

```text
.project-to-video/
├── README.md                 观看顺序、视频链接、章节时间和运行命令
├── research/                 项目全景、候选流程和源码证据
├── planning/                 主线选择、分镜和覆盖关系
├── review/                   简历稿、面试问题和补充笔记
├── remotion/                 项目专属动画工程与组件
└── output/                   MP4、章节索引和检查记录
```

项目专属的标签、链路和新组件留在这个目录里；Skill 自带的通用组件不会被普通使用流程改写。

## 快速开始

### 安装

把仓库内容直接放入宿主识别的 `project-to-video` Skill 目录，不要再套一层同名文件夹。

| 宿主 | 个人安装位置 |
| --- | --- |
| Codex | `$CODEX_HOME/skills/project-to-video/`；未设置时为 `~/.codex/skills/project-to-video/` |
| Claude Code | `~/.claude/skills/project-to-video/` |

也可以把仓库克隆到对应路径，或使用宿主提供的 Skill 安装器。Claude Code 还支持放在项目共享目录：`<项目>/.claude/skills/project-to-video/`。

### 使用

在目标项目中执行：

```text
使用 $project-to-video 分析当前项目，制作架构与核心链路讲解动画。
```

Claude Code 可以使用 `/project-to-video`，也可以直接描述同样的目标。已有 `.project-to-video/` 时会优先续用有效资料。

安装 Skill 本身不需要 npm 依赖。开始制作视频时，再在目标项目的 `.project-to-video/remotion/` 中安装 Node.js/npm、Remotion 及渲染所需浏览器。模板复制、开发、检查和渲染命令见 [Remotion 工程说明](references/remotion-template.md) 与 [模板 README](assets/remotion-template/README.md)。

多 Agent 是可选能力，同时最多三个（包含主 Agent）；无法并行时会顺序完成相同范围的调研。

## 仓库内容

| 路径 | 用途 |
| --- | --- |
| [`SKILL.md`](SKILL.md) | 执行入口、默认约定和五阶段工作流 |
| [`references/`](references/) | 项目探索、叙事、视觉表达、布局、节奏和交付规则 |
| [`assets/remotion-template/`](assets/remotion-template/) | 可复制的 Remotion 起始工程、图标、行为模式和示例场景 |
| [`assets/previews/`](assets/previews/) | 通用表达的可播放预览 |
| [`assets/story-model.example.json`](assets/story-model.example.json) | 分镜模型的中性示例，可交给校验脚本检查 |
| [`scripts/`](scripts/) | 分镜模型、布局和成片规格的可重复检查脚本 |

重点参考：

- [项目探索与主线选择](references/project-exploration.md)：从任务和数据生命周期抓主线，决定哪里展开、哪里收束。
- [连续分镜规则](references/storyboard-rules.md)：保持对象身份、状态变化和镜头承接。
- [可复用组件](references/visual-components.md)：Agent、存储、消息、等待恢复、循环等现成表达。
- [组合场景](references/composition-patterns.md)：多实例、全景缩略、局部展开、并行和汇合。
- [布局契约与静态检查](references/layout-validation.md)：减少文字遮挡、端口错位、斜线和微小折点。
- [节奏与阅读时间](references/pacing-and-timing.md)：让动作更利落，同时给关键状态留下阅读时间。

## 默认约定

- 中文、无配音、16:9、30 fps；沿用用户明确指定的语言、规格和检查方式。
- 默认一条视频；只有独立主线无法在一条片子里讲清时才拆分，最多三条。
- 先用源码、测试和运行结果确认关系，再决定如何画；没有证据的关系保留为疑点。
- 模板里的图标和场景是可选能力，可以替换、组合或不用；项目专属表达放在项目产物目录中。
- Skill 会完成类型、布局、渲染和文件规格检查；完整播放观感由使用者在目标分辨率下确认。
