# 成片与章节检查脚本

[inspect-video.py](../scripts/inspect-video.py) 使用 Python 标准库及 PATH 中的 ffprobe；抽帧还需要 ffmpeg。脚本不依赖某个项目、Remotion 工程或特定绝对路径。

从项目目录运行，替换 Skill 所在路径：

```text
python <skill路径>/scripts/inspect-video.py .project-to-video/output/architecture.mp4 --chapters .project-to-video/output/chapters.json --out .project-to-video/output/checks --width 1920 --height 1080 --fps 30 --audio absent
```

章节 JSON 由工程的实际时间数据导出，格式为数组：

```json
[{"id":"overview","title":"系统全景","start":0,"end":8},{"id":"flow","title":"核心链路","start":8,"end":20}]
```

每条视频使用自己的章节文件，时间从 0 开始、顺序连续并覆盖完整成片。上面仅示意结构，实际时间由项目决定。

加 `--extract --times 3.5 12` 可输出首尾帧、章节中间帧、每个章节边界前后帧及指定时刻。`inspection.json` 保存规格与错误，`frames.md` 链接抽帧。重复执行会覆盖检查目录中的同名报告和抽帧；输出放在项目检查目录，不能放回 Skill 内。

格式、时长、音轨或章节错误返回非零状态。脚本适用于常规固定帧率成片；它不读取屏幕几何，也不自动发现字体裁切、对象重叠、反向语义或并发误导。抽帧用于安排复核；完整动态检查按用户约定执行。
