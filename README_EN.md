# project-to-video

> Turn a project's main story into an animation you can actually explain.

[English](README_EN.md) | [中文](README.md)

Have you ever put a project on your resume, then hoped the interviewer would not probe too deeply? Months later, you open the repository again: the entry point is here, state lives in another package, and events disappear into a third module. You rebuild a call chain in one evening, yet a question such as "Why was it designed this way?" can still throw the whole explanation off course.

Code and documentation provide fragments. The hard part is reconnecting entry points, modules, state, data flow, and design trade-offs into one coherent picture.

`project-to-video` helps do that. It traces an evidence-backed core path through the README, source code, and tests, then turns it into a continuous, silent Remotion explainer: begin with the system map, follow a real task into the important details, and show how objects move, wait, branch, and resume. Afterward, you have one story you can retell, with short notes and source links for the questions that need more depth. It is useful before an interview and whenever you need to take over, revisit, or study a project quickly.

[Preview](#preview) · [Quick Start](#quick-start) · [Reusable visuals (Chinese)](references/visual-components.md) · [Remotion template (Chinese)](assets/remotion-template/README.md)

---

## Preview

These bundled videos demonstrate reusable patterns with neutral example data. Their on-screen labels are currently Chinese.

https://github.com/user-attachments/assets/ee333178-5f02-48f1-a056-304d81ff9da3

| Preview | What it shows |
| --- | --- |
| [Progressive causality](assets/previews/progressive-causal.mp4) | Steps, decision branches, and context changes appearing in causal order |
| [Composition patterns](assets/previews/composition-patterns.mp4) | Selecting from multiple instances, entering a detail from an overview, parallel work, and convergence |
| [Visual library](assets/previews/visual-library.mp4) | Agents, storage, terminals, models, tools, waiting/resuming, and cycles |
| [Focus trail](assets/previews/focus-trail.mp4) | Keeping your place while moving from a system overview into a subflow |

If the player does not render on the current page, open the linked MP4 directly.

## You may need it if

- A project appears on your resume, but you can only describe features instead of explaining how one request crosses the system.
- The code and documentation are available, but they never quite form a system map in your head.
- You need to recover state ownership, data flow, and design trade-offs before an interview without rereading the entire repository from the entry point.
- You are taking over a project and want to understand the main path before diving into every implementation detail.

## What it makes clear

The animation puts relationships scattered through the code onto one timeline:

- Where a request or task begins, which boundaries it crosses, and who receives the result.
- Which object owns state, when it waits, and what lets it continue.
- Which work is genuinely parallel and which steps merely happen in sequence.
- Why a branch exists and what its outcome changes downstream.
- Which source file, test, or note answers a detail omitted for pacing.

The video normally starts with the overview and then enlarges the important subflow. The same message, task, or correlation ID stays recognizable as the camera moves, leaving you with a chain of events you can explain aloud.

## From project to video

The Skill works through the following stages; the finished video only shows what helps a viewer understand the system.

1. **Understand the project.** Read the README first. If it is missing, ask whether to investigate and create one. Then trace real entry points, triggers, state changes, outcomes, and important branches.
2. **Choose what matters.** Produce a project summary and 3-4 evidence-backed points, then use an interviewer's questions to locate the parts most likely to be confused or worth expanding.
3. **Choose a main path.** Compare candidate task or data lifecycles and select one anchor path with the supporting mechanisms it needs. One video is the default; independently understandable lifecycles can be split into at most three.
4. **Design a continuous explanation.** Use overview-to-detail focus, progressive causality, before/after comparisons, parallel lanes, or cross-cutting returns where they fit. Labels carry names, state, conditions, and short prompts; motion explains the causal change.
5. **Add the details left out of the video.** Write short chapter-based notes for implementation trade-offs, boundary conditions, and source entry points. Link interview questions to timestamps or notes.

## What appears in the target project

The Skill creates a separate `.project-to-video/` directory at the target project's root. Files are created when they are needed; a small project does not need to fill every directory.

```text
.project-to-video/
├── README.md                 Viewing order, video links, chapter times, and run commands
├── research/                 System map, candidate flows, and source evidence
├── planning/                 Main-path decision, storyboard, and coverage
├── review/                   Project summary, interview questions, and notes
├── remotion/                 Project-specific animation source and components
└── output/                   MP4s, chapter index, and check records
```

Project-specific labels, flows, and newly designed components stay there. The shared visual library is not modified during ordinary use.

## Quick Start

### Install

Place the repository contents directly in a Skill directory named `project-to-video`; avoid an extra nested directory with the same name.

| Host | Personal installation path |
| --- | --- |
| Codex | `$CODEX_HOME/skills/project-to-video/`, or `~/.codex/skills/project-to-video/` when `CODEX_HOME` is unset |
| Claude Code | `~/.claude/skills/project-to-video/` |

You can also clone the repository into the appropriate path or use your host's Skill installer. Claude Code also supports a shared project path: `<project>/.claude/skills/project-to-video/`.

### Use

From a target project, ask:

```text
Use $project-to-video to analyze this project and create an animated architecture and core-flow explainer.
```

In Claude Code, use `/project-to-video` or describe the same goal in natural language. Existing `.project-to-video/` materials are reused when they are still valid.

Installing the Skill itself requires no npm dependencies. When it is time to make a video, install Node.js/npm, Remotion, and the rendering browser inside the target project's `.project-to-video/remotion/` directory. See the [Remotion guide (Chinese)](references/remotion-template.md) and [template README (Chinese)](assets/remotion-template/README.md) for copying, developing, checking, and rendering the template.

Multi-agent research is optional and uses at most three active agents, including the primary agent. The same work can run sequentially when parallel agents are unavailable.

## Repository contents

| Path | Purpose |
| --- | --- |
| [`SKILL.md`](SKILL.md) | Entry point, default conventions, and the five-stage workflow |
| [`references/`](references/) | Exploration, narrative, visual, layout, pacing, and delivery guidance; currently Chinese |
| [`assets/remotion-template/`](assets/remotion-template/) | A copyable Remotion starter, icons, behavior patterns, and demo scenes |
| [`assets/previews/`](assets/previews/) | Playable previews of the generic visual patterns |
| [`assets/story-model.example.json`](assets/story-model.example.json) | A neutral example input for the storyboard-model validator |
| [`scripts/`](scripts/) | Repeatable checks for storyboard models, layout, and rendered-video specifications |

Useful deep dives, currently in Chinese:

- [Project exploration and main-path selection](references/project-exploration.md)
- [Continuous storyboard rules](references/storyboard-rules.md)
- [Reusable visual components](references/visual-components.md)
- [Composition patterns](references/composition-patterns.md)
- [Layout contract and static checks](references/layout-validation.md)
- [Pacing and reading time](references/pacing-and-timing.md)

## Defaults

- Chinese labels, no voice-over, 16:9, and 30 fps by default. Explicit user choices for language, output format, and validation take precedence.
- One video by default, with no more than three when independent main paths need separate treatment.
- Confirm relationships from source code, tests, and available execution evidence before deciding how to animate them. Unverified relationships remain open questions.
- Template icons and scenes are optional building blocks. Project-specific expressions belong in the target project's output directory.
- The Skill runs type, layout, render, and output-specification checks. Final viewing quality is confirmed at the target resolution.

## Related docs

- [Codex Skills](https://developers.openai.com/codex/skills/)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Remotion documentation](https://www.remotion.dev/docs/)
