#!/usr/bin/env python3
"""核对成片与章节时间，可选抽取关键帧。仅依赖 Python 标准库及 ffprobe/ffmpeg。"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from fractions import Fraction
from pathlib import Path


def run_json(command: list[str]) -> dict:
    result = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8")
    return json.loads(result.stdout)


def number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_chapters(chapters: object, duration: float, fps: float) -> list[str]:
    errors: list[str] = []
    if not isinstance(chapters, list) or not chapters:
        return ["章节必须是非空数组"]
    cursor = 0.0
    ids: set[str] = set()
    for index, chapter in enumerate(chapters):
        if not isinstance(chapter, dict):
            errors.append(f"章节 {index + 1} 必须是对象")
            continue
        cid = chapter.get("id")
        if not isinstance(cid, str) or not cid or cid in ids:
            errors.append(f"章节 {index + 1} 的 id 缺失或重复")
        else:
            ids.add(cid)
        if not isinstance(chapter.get("title"), str) or not chapter["title"].strip():
            errors.append(f"章节 {index + 1} 缺少标题")
        start, end = chapter.get("start"), chapter.get("end")
        if not number(start) or not number(end) or start < 0 or end <= start:
            errors.append(f"章节 {index + 1} 的时间不合法")
            continue
        if abs(start - cursor) > .5 / fps:
            errors.append(f"章节 {index + 1} 与前段不连续：预期 {cursor:g}，实际 {start:g}")
        if end > duration + 1 / fps:
            errors.append(f"章节 {index + 1} 超过视频时长")
        cursor = end
    if abs(cursor - duration) > 1 / fps + 1e-6:
        errors.append(f"章节终点 {cursor:g} 与成片时长 {duration:g} 不一致")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video", type=Path)
    parser.add_argument("--chapters", type=Path, required=True, help="数组，每项含 id/title/start/end，时间单位为秒")
    parser.add_argument("--out", type=Path, required=True, help="项目内检查目录；同名报告/抽帧会覆盖")
    parser.add_argument("--extract", action="store_true", help="抽取首尾、章节中间及转场前后帧")
    parser.add_argument("--times", nargs="*", type=float, default=[], help="额外检查时刻（秒），与 --extract 配合")
    parser.add_argument("--width", type=int)
    parser.add_argument("--height", type=int)
    parser.add_argument("--fps", type=float)
    parser.add_argument("--audio", choices=["absent", "present", "any"], default="absent")
    args = parser.parse_args()
    video, out = args.video.resolve(), args.out.resolve()
    if not video.is_file():
        parser.error("视频不存在")
    skill_root = Path(__file__).resolve().parent.parent
    if (skill_root / "SKILL.md").exists() and (out == skill_root or skill_root in out.parents):
        parser.error("检查输出应放到目标项目或临时目录，不能写入已安装 Skill")
    if not shutil.which("ffprobe") or (args.extract and not shutil.which("ffmpeg")):
        parser.error("需要 PATH 中可用的 ffprobe；--extract 还需要 ffmpeg")
    info = run_json(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(video)])
    streams = info.get("streams", [])
    stream = next((s for s in streams if s.get("codec_type") == "video"), None)
    if stream is None:
        parser.error("文件没有视频流")
    fps = float(Fraction(stream["r_frame_rate"]))
    duration = float(stream.get("duration") or info["format"]["duration"])
    if fps <= 0 or not math.isfinite(duration) or duration <= 0:
        parser.error("无法读取有效视频时间")
    chapters = json.loads(args.chapters.read_text(encoding="utf-8-sig"))
    errors = validate_chapters(chapters, duration, fps)
    for name in ["width", "height"]:
        expected = getattr(args, name)
        if expected is not None and stream.get(name) != expected:
            errors.append(f"{name} 预期 {expected}，实际 {stream.get(name)}")
    if args.fps is not None and abs(args.fps - fps) > .001:
        errors.append(f"帧率预期 {args.fps}，实际 {fps}")
    audio = any(s.get("codec_type") == "audio" for s in streams)
    if (args.audio == "absent" and audio) or (args.audio == "present" and not audio):
        errors.append("音轨与要求不符")
    for t in args.times:
        if not math.isfinite(t) or not 0 <= t < duration:
            errors.append(f"额外时间超出范围：{t}")
    out.mkdir(parents=True, exist_ok=True)
    report = {"video": str(video), "duration": duration, "fps": fps, "width": stream["width"], "height": stream["height"], "has_audio": audio, "errors": errors, "visual_review": "未执行：抽帧不能自动判断语义、字体或遮挡"}
    (out / "inspection.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if errors:
        print("\n".join(errors))
        return 1
    if args.extract:
        last_frame = max(0, math.ceil(duration * fps - 1e-6) - 1)
        frames = {0, last_frame}
        for chapter in chapters:
            frames.add(round((chapter["start"] + chapter["end"]) / 2 * fps))
            for t in [chapter["start"], chapter["end"]]:
                boundary = round(t * fps)
                frames.update([boundary - 1, boundary, boundary + 1])
        frames.update(round(t * fps) for t in args.times)
        lines = ["# 关键帧索引", "", "仅供视觉复核，尚未判断遮挡或讲解正确性。", ""]
        for frame in sorted(f for f in frames if 0 <= f <= last_frame):
            name = f"frame-{frame:06d}.png"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{frame / fps:.9f}", "-i", str(video), "-frames:v", "1", str(out / name)], check=True, capture_output=True)
            if not (out / name).is_file():
                raise RuntimeError(f"未生成抽帧：{name}")
            lines.append(f"- {frame / fps:.3f}s · 帧 {frame}：[查看]({name})")
        (out / "frames.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"规格与章节检查通过：{duration:g}s / {fps:g}fps；视觉验收未执行")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
