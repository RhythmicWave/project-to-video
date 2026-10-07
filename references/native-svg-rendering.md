# 纯 SVG 场景的原生渲染

适用：画面由 SVG 形状、路径、文字和帧函数构成，无 HTML 布局、CSS 特效、网页截图、视频或浏览器专属字体行为。保留 Remotion 作为交互预览，正式导出可由相同纯帧组件直接生成 SVG。

## 可用库及职责

| 工具 | 用途 | 限制 |
| --- | --- | --- |
| react-dom/server | 将纯 Frame(props, frame) 组件生成 SVG 字符串 | 组件内部不读取 Remotion hook、DOM 或真实时钟 |
| @resvg/resvg-js | 用 Rust 原生库栅格化 SVG；renderAsync 可并行 | 不执行 HTML、JS 或浏览器 CSS；字体、滤镜和文字形态需抽帧对照 |
| sharp | 从 RGBA 像素编码 JPEG，避免同步 PNG 压缩占用主线程 | JPEG 采用较高质量和 4:4:4 色度以保护细文字；像素布局必须匹配 |
| FFmpeg | 对代表帧及其 duration 编码，随后按章节合成 | NVENC/QSV/AMF 需要实际硬件与驱动；使用合法的目标尺寸完成启动验证后才选用，过小探针可能被编码器拒绝 |

依赖使用官方 npm 包，锁定版本。库可作为项目工程依赖按需安装，不要求所有模板项目都使用。

## 组织与实现

拆出纯 SVG 组件：`Frame({frame, fps, ...props})` 返回 `<svg xmlns="http://www.w3.org/2000/svg">`。Remotion 的壳只读取 useCurrentFrame/useVideoConfig，再把数值交给 Frame；原生导出也调用这个组件。显式字体、坐标、时间与对象数据，使两条路径共享画面定义。

```tsx
const svg = renderToStaticMarkup(<Frame frame={frame} fps={30} {...props}/>);
const image = await renderAsync(svg, {
  fitTo: {mode: 'width', value: width},
  font: {fontFiles, loadSystemFonts: false, defaultFontFamily},
});
const jpeg = await sharp(image.pixels, {
  raw: {width: image.width, height: image.height, channels: 4},
}).jpeg({quality: 90, chromaSubsampling: '4:4:4'}).toBuffer();
```

不要每帧扫描系统字体。使用明确的本地字体；大型中文字体加载仍可能成为瓶颈，可用 fontTools 将当前用到的字符子集保存在本地渲染缓存，并同时保留正常/粗体。新增字符后更新子集，字体许可按源文件处理，不把系统字体复制进共享 Skill 或发布包。缺字状态符号优先改用 SVG 路径。

运动采样、静止代表帧、章节依赖与绘图/编码缓存分离统一见[高效渲染](render-efficiency.md)。原生帧也遵循同一阅读预算和实际时间映射；渲染器、字体及采样参数参与绘图缓存，编码器/CRF 变化只使编码失效。章节编码后使用 `-c copy` 拼接。

## 验证与报告

先核对中文、最长方法、公式上标、透明度、缩略图及状态符号；支持不完整的画面继续用 Chrome 渲染。渲染器切换后缓存必须失效。记录绘图、编码、拼接各自耗时，区分冷启动和缓存命中；不要把全景小样的倍率套用于所有章节。实际视频仍检查尺寸、CFR、总帧数、章节字幕时间及冻结区间。
