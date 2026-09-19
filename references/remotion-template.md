# Remotion 工程说明

在目标项目的 `.project-to-video/remotion/` 中工作。可复制 `assets/remotion-template/` 或沿用已有工程，版本锁文件随工程保存。需要未熟悉的 API 时读取可用的 Remotion 技能或[官方文档](https://www.remotion.dev/docs/)，本 Skill 不要求安装其他 Skill。

`assets/remotion-template/` 提供最小注册入口、FocusTrail、VisualLibraryDemo、CompositionPatternsDemo 和 ProgressiveCausalDemo 演示，以及按需使用的系统图标、行为组件和递进因果组件。它不自动将项目或分镜转换成视频：正式场景需根据核查后的链路在项目中实现并注册为 Composition。

另提供可选的 `Patterns/FocusTrailDemo`，演示导航与局部展开同步。[逐层聚焦导航说明](focus-navigation.md) 包含组件参数和替代方案；根据项目选择使用。

正式项目按四层组织基础绘制、系统表达、行为模式和讲解场景。场景可用 TypeScript 明确配置参与者、时间和路径；跨项目参数化只在复用边界清楚时实现。将 `registerRoot()` 放在 CLI 入口文件。面板、文字块和跨节点连线同时登记布局 manifest，使用 `panelRegions`、`WrappedLabel` 和 `Connect` 生成可检查的边界。

所有动画由帧计算，任意帧可独立重建，支持拖动时间轴。使用 useCurrentFrame、interpolate、spring、Sequence；动态全景与摄像机可共享一个连续 Composition，避免切场景时丢失定位。素材加载需要等待完成，中文字体在实际渲染环境检查。

模板的 `visual/pacing.ts` 提供 `fast-review`、`balanced` 和 `spacious` 三个节奏档位。组件默认采用 `balanced`；项目可在自己的节奏入口选择档位，复杂或关键的局部仍可通过 `duration` 显式覆盖。节奏只改变动作时长，不自动缩短章节和阅读停顿，具体原则见[pacing-and-timing.md](pacing-and-timing.md)。

不要使用 CSS transition/keyframe 或真实时间计时器作为动画时钟。正式视频默认 1080p/30 fps；附带导航演示是 720p 的 7 秒样例。多章节共享对象与时间数据，按需要增加章节 Composition 方便回看。

常用命令：

```text
npm ci
npm run check
npx remotion studio src/index.tsx --no-open
npx remotion still src/index.tsx CompositionId output.png --frame=300
npx remotion render src/index.tsx CompositionId output.mp4 --codec=h264
```

按实际 Composition ID 和输出路径替换。记录完整时长和章节帧区间；如果使用参数化输入，运行时验证必填字段及引用，不只依赖静态类型。

布局检查命令见[布局契约与静态检查](layout-validation.md)。模板复制到目标项目后，可将 `scripts/check-layout.mjs` 和 manifest 一并放入 `.project-to-video/remotion/`，在渲染前执行。
