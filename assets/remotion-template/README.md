# 项目复习 Remotion 起始工程

复制到目标项目的 `.project-to-video/remotion/` 后工作。此工程注册 `Patterns/FocusTrailDemo`（7 秒导航）、`Patterns/VisualLibraryDemo`（24 秒图标与行为）、`Patterns/CompositionPatternsDemo`（25 秒选择/局部展开/并行）和 `Patterns/ProgressiveCausalDemo`（25 秒递进因果），均为 1280×720、30 fps。按项目分镜实现连续场景，在 `src/Root.tsx` 注册正式 Composition；视频默认规格为 1920×1080、30 fps。

安装与验证：

```text
npm ci
npm run check
npm run dev
npm run still
npm run render
npm run check:layout
```

项目事实放在 props、JSON 或 TypeScript 数据中。新增场景在 `src/Root.tsx` 注册，`src/index.tsx` 保留 `registerRoot()`。用帧计算控制运动，抽查进入、到达、等待、恢复和退出。

正式成片命令使用实际 Composition ID 与输出位置，例如从此工程目录执行 `npx remotion render src/index.tsx Architecture ../output/architecture.mp4 --codec=h264`，前提是已注册 Architecture。依赖与临时输出在复制后的项目工程安装和生成。

FocusTrail 在 SVG 内使用，由调用者提供路径与时间；它不推断包含、调用或所有权关系。示例演示讲解聚焦的逐层进入，不能据此推断目标项目架构。其字体使用系统中文字体，部署到不同环境时需要核对字体是否可用。

视觉实现位于 src/visual：Systems.tsx 提供系统图标，Behaviors.tsx 提供传递、等待恢复和循环。运行 `npx remotion render src/index.tsx VisualLibraryDemo out/visual-library.mp4` 查看组合演示。

组合场景见 src/visual/Scenes.tsx，边界端口与坐标变换见 geometry.ts。运行 `npx remotion render src/index.tsx CompositionPatternsDemo out/composition-patterns.mp4` 可生成对应演示。

递进因果组件见 src/visual/Progressive.tsx；运行 `npm run render:progressive` 可生成对应演示。步骤卡、决策门和上下文变换不推断业务关系，需由场景传入证据支持的标签、分支和时间。

`scripts/check-layout.mjs` 和 `layout.example.json` 提供渲染前的节点、文字和端口路线检查；正式项目应复制 manifest 并按实际场景登记节点。

模板内的 `check-layout.mjs` 与仓库根目录的同名脚本保持同一检查契约：前者随模板复制到目标项目，后者用于维护 Skill 本身。两处新增或调整布局约束时应同步更新。
