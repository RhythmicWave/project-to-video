#!/usr/bin/env python3
"""Validate a project explanation model before storyboard work."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


MODES = {"overview", "progressive_causal", "state_change", "parallel", "comparison", "cross_cut"}


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(value, dict):
        raise SystemExit("story model root must be an object")
    return value


def nonempty(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def strings(value: object) -> bool:
    return isinstance(value, list) and all(nonempty(item) for item in value)


def unique_ids(items: list[Any], label: str, errors: list[str]) -> set[str]:
    ids: set[str] = set()
    for index, item in enumerate(items):
        item_id = item.get("id") if isinstance(item, dict) else None
        if not nonempty(item_id) or item_id in ids:
            errors.append(f"{label}[{index}] must have a unique id")
        else:
            ids.add(item_id)
    return ids


def validate(model: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    project = model.get("project")
    if not isinstance(project, dict) or not nonempty(project.get("name")) or not nonempty(project.get("core_promise")):
        errors.append("project.name and project.core_promise are required")

    flows = model.get("flows")
    if not isinstance(flows, list) or not flows:
        errors.append("flows must be a non-empty list")
        flows = []
    flow_ids = unique_ids(flows, "flows", errors)
    for index, flow in enumerate(flows):
        if not isinstance(flow, dict):
            errors.append(f"flows[{index}] must be an object")
            continue
        for key in ("name", "trigger", "normal_end"):
            if not nonempty(flow.get(key)):
                errors.append(f"flows[{index}].{key} is required")
        steps = flow.get("steps")
        if not isinstance(steps, list) or not steps:
            errors.append(f"flows[{index}].steps must be a non-empty list")
            steps = []
        step_ids = unique_ids(steps, f"flows[{index}].steps", errors)
        for step_index, step in enumerate(steps):
            if not isinstance(step, dict):
                errors.append(f"flows[{index}].steps[{step_index}] must be an object")
                continue
            for key in ("from", "to", "action", "result"):
                if not nonempty(step.get(key)):
                    errors.append(f"flows[{index}].steps[{step_index}].{key} is required")
            if not strings(step.get("evidence")):
                errors.append(f"flows[{index}].steps[{step_index}].evidence must be a non-empty string list")
        branches = flow.get("branches", [])
        if not isinstance(branches, list):
            errors.append(f"flows[{index}].branches must be a list")
            branches = []
        for branch_index, branch in enumerate(branches):
            if not isinstance(branch, dict):
                errors.append(f"flows[{index}].branches[{branch_index}] must be an object")
                continue
            for key in ("condition", "outcome", "next"):
                if not nonempty(branch.get(key)):
                    errors.append(f"flows[{index}].branches[{branch_index}].{key} is required")
            target = branch.get("next")
            if nonempty(target) and target != "end" and target not in step_ids:
                errors.append(f"flows[{index}].branches[{branch_index}].next references unknown step: {target}")
            if not strings(branch.get("evidence")):
                errors.append(f"flows[{index}].branches[{branch_index}].evidence must be a non-empty string list")
        if flow.get("branch_required") and not branches:
            errors.append(f"flows[{index}] requires a branch but has none")

    scenes = model.get("scenes", [])
    if not isinstance(scenes, list):
        errors.append("scenes must be a list")
        scenes = []
    unique_ids(scenes, "scenes", errors)
    for index, scene in enumerate(scenes):
        if not isinstance(scene, dict):
            errors.append(f"scenes[{index}] must be an object")
            continue
        if scene.get("flow") not in flow_ids:
            errors.append(f"scenes[{index}].flow references unknown flow")
        if not nonempty(scene.get("claim")):
            errors.append(f"scenes[{index}].claim is required")
        if scene.get("mode") not in MODES:
            errors.append(f"scenes[{index}].mode must be one of: {', '.join(sorted(MODES))}")
        if not strings(scene.get("evidence")):
            errors.append(f"scenes[{index}].evidence must be a non-empty string list")
        covers = scene.get("covers", [])
        if not isinstance(covers, list) or not all(nonempty(item) for item in covers):
            errors.append(f"scenes[{index}].covers must be a string list when provided")
    coverage = model.get("coverage", [])
    if coverage is not None and not isinstance(coverage, list):
        errors.append("coverage must be a list when provided")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model", type=Path)
    args = parser.parse_args()
    errors = validate(load(args.model))
    if errors:
        print("Story model invalid:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"Story model valid: {args.model}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
